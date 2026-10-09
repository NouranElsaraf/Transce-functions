/**
 * Replaceable lesson-generation providers. Credentials stay on the server
 * (environment variables); the browser never sees them.
 *
 *   LESSON_AI_PROVIDER = anthropic | none      (default: anthropic if ANTHROPIC_API_KEY is set, else none)
 *   ANTHROPIC_API_KEY  = server-side key       (required for anthropic)
 *   LESSON_AI_MODEL    = model id              (default: claude-opus-5-5)
 *   LESSON_AI_BASE_URL = API base URL          (default: https://api.anthropic.com)
 *
 * A provider is `{ name, model, available, unavailableReason?, generate({system, user}) → Promise<string> }`.
 * To add another vendor, implement that shape and register it in `PROVIDERS`.
 * @module server/providers
 */
import { ProviderError } from '../../src/engine/generation/pipeline.js';

const NOT_CONFIGURED =
  'Live generation is not configured on this server. Set ANTHROPIC_API_KEY in the server environment to enable it. Until then, use “Import” with clearly labelled demo or hand-authored content.';

export function noneProvider(reason = NOT_CONFIGURED) {
  return {
    name: 'none',
    model: 'none',
    available: false,
    unavailableReason: reason,
    async generate() {
      throw new ProviderError(reason, { code: 'unavailable' });
    },
  };
}

/**
 * Anthropic provider via the official SDK. `clientFactory` lets tests inject a
 * fake client; in production the SDK is loaded lazily.
 */
export function anthropicProvider(env, { clientFactory } = {}) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey && !clientFactory) return noneProvider();
  const model = env.LESSON_AI_MODEL || 'claude-opus-5-5';
  let clientPromise = null;
  const getClient = async () => {
    if (clientFactory) return clientFactory();
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    // maxRetries 0: the generation pipeline owns retries so failures are recorded once.
    return new Anthropic({ apiKey, baseURL: env.LESSON_AI_BASE_URL || 'https://api.anthropic.com', maxRetries: 0, timeout: 15 * 60 * 1000 });
  };
  return {
    name: 'anthropic',
    model,
    available: true,
    async generate({ system, user }) {
      clientPromise ??= getClient();
      const client = await clientPromise;
      let message;
      try {
        const stream = client.beta.messages.stream({
          model,
          max_tokens: 64000,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: { effort: 'high' },
          system,
          messages: [{ role: 'user', content: user }],
        });
        message = await stream.finalMessage();
      } catch (e) {
        const status = e?.status;
        const retryable = status === undefined || status === 408 || status === 409 || status === 429 || status >= 500;
        throw new ProviderError(`Anthropic API error${status ? ` ${status}` : ''}: ${e?.message ?? e}`, { retryable, code: status ? `http-${status}` : 'network' });
      }
      if (message.stop_reason === 'refusal') throw new ProviderError('The model declined this request.', { code: 'refusal' });
      if (message.stop_reason === 'max_tokens') throw new ProviderError('The lesson was cut off (max_tokens).', { retryable: true, code: 'truncated' });
      return message.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
    },
  };
}

export const PROVIDERS = { anthropic: anthropicProvider, none: () => noneProvider() };

export function createProvider(env = process.env, opts = {}) {
  const name = env.LESSON_AI_PROVIDER || (env.ANTHROPIC_API_KEY ? 'anthropic' : 'none');
  const factory = PROVIDERS[name];
  if (!factory) return noneProvider(`Unknown LESSON_AI_PROVIDER "${name}".`);
  return factory(env, opts);
}

/**
 * Voice providers. No paid text-to-speech service is enabled. Narration comes
 * from uploaded human recordings (POST /api/lessons/:id/narration). A synthetic
 * voice can be added here later, behind explicit approval.
 */
export function createVoiceProvider(env = process.env) {
  if (env.LESSON_VOICE_PROVIDER && env.LESSON_VOICE_PROVIDER !== 'none') {
    return { name: env.LESSON_VOICE_PROVIDER, available: false, reason: 'No voice adapter is implemented for this provider yet.' };
  }
  return { name: 'upload-only', available: false, reason: 'Synthetic Egyptian-Arabic narration is not configured. Upload a human recording instead.' };
}
