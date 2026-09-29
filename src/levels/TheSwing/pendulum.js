/**
 * Pendulum model (small-angle approximation), in SI units and degrees.
 * @module TheSwing/pendulum
 */
export const G = 9.8;

/** Period in seconds for a rope of length L metres. */
export const periodFor = (L) => 2 * Math.PI * Math.sqrt(L / G);

/** Length giving a 2-second period — the classic "seconds pendulum" (≈ 0.99 m). */
export const SECONDS_PENDULUM = G / Math.PI ** 2;

/** Angle in degrees at time t, released from +A at t = 0. */
export const angleAt = (t, A, L = SECONDS_PENDULUM) => A * Math.cos((2 * Math.PI * t) / periodFor(L));
