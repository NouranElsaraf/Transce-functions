/**
 * The car's journeys, as position functions of time (metres vs seconds).
 * @module SpeedDetective/trip
 */
import { derivative } from '../../core/mathUtils.js';

export const DURATION = 10;
export const ROAD_LENGTH = 100;

const K = 1.1;
const T_PEAK = 6.5;
const logistic = (t) => 1 / (1 + Math.exp(-K * (t - T_PEAK)));
const L0 = logistic(0);
const L1 = logistic(DURATION);

/** Main trip: gentle start, hard acceleration, braking. Fastest at t = 6.5 s. */
export const position = (t) => (ROAD_LENGTH * (logistic(t) - L0)) / (L1 - L0);
export const speed = (t) => derivative(position, t);
export const FASTEST_T = T_PEAK;

/** Second trip: drives forward, stops at t = 4, reverses. */
export const tripBack = (t) => 40 * Math.sin((t * Math.PI) / 8);
