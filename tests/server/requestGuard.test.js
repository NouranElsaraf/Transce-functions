import { describe, expect, it } from 'vitest';
import { checkRequest, isJsonContentType, studioAllowlist } from '../../server/requestGuard.mjs';

const allow = studioAllowlist([8787, 5173]);
const req = (method, headers) => ({ method, headers });

describe('studioAllowlist', () => {
  it('lists loopback hosts on each port, and the matching http origins', () => {
    expect([...allow.hosts]).toEqual(expect.arrayContaining(['localhost:8787', '127.0.0.1:8787', '[::1]:8787', 'localhost:5173', '127.0.0.1:5173', '[::1]:5173']));
    expect([...allow.origins]).toEqual(expect.arrayContaining(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://[::1]:5173', 'http://localhost:8787']));
    expect(allow.hosts.size).toBe(6);
  });
});

describe('checkRequest', () => {
  it('accepts loopback Host headers on allowed ports, case-insensitively', () => {
    for (const host of ['localhost:5173', 'LOCALHOST:8787', '127.0.0.1:8787', '[::1]:5173']) {
      expect(checkRequest(req('GET', { host }), allow)).toBeNull();
    }
  });

  it('rejects foreign, port-less or wrong-port Host headers (DNS rebinding)', () => {
    for (const host of ['evil.example:8787', 'localhost', '127.0.0.1:9999', 'localhost.evil.example:5173', undefined]) {
      expect(checkRequest(req('GET', { host }), allow)).toMatchObject({ status: 403, code: 'forbidden-host' });
    }
  });

  it('requires an allowed Origin on every non-GET request', () => {
    const host = 'localhost:5173';
    expect(checkRequest(req('POST', { host, origin: 'http://localhost:5173' }), allow)).toBeNull();
    for (const origin of ['https://evil.example', 'null', 'http://localhost:5174', 'https://localhost:5173']) {
      for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
        expect(checkRequest(req(method, { host, origin }), allow)).toMatchObject({ status: 403, code: 'forbidden-origin' });
      }
    }
  });

  it('does not require an Origin on GET/HEAD, and allows a missing Origin for non-browser clients', () => {
    expect(checkRequest(req('GET', { host: 'localhost:8787', origin: 'https://evil.example' }), allow)).toBeNull();
    expect(checkRequest(req('HEAD', { host: 'localhost:8787' }), allow)).toBeNull();
    expect(checkRequest(req('POST', { host: '127.0.0.1:8787' }), allow)).toBeNull();
  });
});

describe('isJsonContentType', () => {
  it('accepts application/json with or without parameters', () => {
    expect(isJsonContentType('application/json')).toBe(true);
    expect(isJsonContentType('Application/JSON; charset=utf-8')).toBe(true);
  });

  it('rejects the CORS-simple types a cross-site form or fetch can send, and missing types', () => {
    for (const t of ['text/plain', 'text/plain;charset=UTF-8', 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=x', 'application/jsonp', '', undefined]) {
      expect(isJsonContentType(t)).toBe(false);
    }
  });
});
