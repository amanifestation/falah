// Astronomical prayer-time engine (after the PrayTimes.org algorithm).
// All results are absolute instants (Date objects), so they are independent
// of the device timezone: hours are computed relative to 00:00 UTC of the
// location's calendar date.

const DEG = Math.PI / 180;
const dsin = (d) => Math.sin(d * DEG);
const dcos = (d) => Math.cos(d * DEG);
const dtan = (d) => Math.tan(d * DEG);
const darcsin = (x) => Math.asin(x) / DEG;
const darccos = (x) => Math.acos(x) / DEG;
const darctan2 = (y, x) => Math.atan2(y, x) / DEG;
const darccot = (x) => Math.atan(1 / x) / DEG;
const fix = (a, b) => {
  a = a - b * Math.floor(a / b);
  return a < 0 ? a + b : a;
};
const fixAngle = (a) => fix(a, 360);
const fixHour = (a) => fix(a, 24);

function julian(y, m, d) {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = darctan2(dcos(e) * dsin(L), dcos(L)) / 15;
  return {
    declination: darcsin(dsin(e) * dsin(L)),
    equation: q / 15 - fixHour(RA),
  };
}

/**
 * @param {{y:number,m:number,d:number}} date  calendar date at the location
 * @param {{lat:number,lng:number,elv?:number}} coords
 * @param {{fajr:number, isha?:number, ishaMin?:number, maghrib?:number,
 *          asrFactor?:number, highLat?:string, offsets?:Record<string,number>}} p
 * @returns {{fajr:Date,sunrise:Date,dhuhr:Date,asr:Date,maghrib:Date,isha:Date,midnight:Date}}
 */
export function computeTimes({ y, m, d }, { lat, lng, elv = 0 }, p) {
  const jDate = julian(y, m, d) - lng / (15 * 24);
  const asrFactor = p.asrFactor || 1;
  const highLat = p.highLat || 'AngleBased';

  const midDay = (t) => fixHour(12 - sunPosition(jDate + t).equation);
  const sunAngleTime = (angle, t, ccw) => {
    const decl = sunPosition(jDate + t).declination;
    const noon = midDay(t);
    const T = darccos((-dsin(angle) - dsin(decl) * dsin(lat)) / (dcos(decl) * dcos(lat))) / 15;
    return noon + (ccw ? -T : T);
  };
  const asrTime = (factor, t) => {
    const decl = sunPosition(jDate + t).declination;
    const angle = -darccot(factor + dtan(Math.abs(lat - decl)));
    return sunAngleTime(angle, t);
  };
  const riseSet = 0.833 + 0.0347 * Math.sqrt(Math.max(0, elv));

  // Initial guesses (hours), refined once.
  let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, maghrib: 18, isha: 18 };
  const dp = {};
  for (const k in t) dp[k] = t[k] / 24;
  t = {
    fajr: sunAngleTime(p.fajr, dp.fajr, true),
    sunrise: sunAngleTime(riseSet, dp.sunrise, true),
    dhuhr: midDay(dp.dhuhr),
    asr: asrTime(asrFactor, dp.asr),
    sunset: sunAngleTime(riseSet, dp.sunset),
    maghrib: typeof p.maghrib === 'number' ? sunAngleTime(p.maghrib, dp.maghrib) : NaN,
    isha: p.ishaMin ? NaN : sunAngleTime(p.isha, dp.isha),
  };

  // Convert local solar time to UTC hours.
  for (const k in t) t[k] -= lng / 15;

  // High-latitude safeguards when twilight angles are never reached.
  if (highLat !== 'None') {
    const night = fixHour(t.sunrise - t.sunset);
    const portion = (angle) => {
      if (highLat === 'NightMiddle') return night / 2;
      if (highLat === 'OneSeventh') return night / 7;
      return (angle / 60) * night; // AngleBased
    };
    const adjust = (time, base, angle, ccw) => {
      const part = portion(angle);
      const diff = ccw ? fixHour(base - time) : fixHour(time - base);
      return Number.isNaN(time) || diff > part ? base + (ccw ? -part : part) : time;
    };
    t.fajr = adjust(t.fajr, t.sunrise, p.fajr, true);
    if (!p.ishaMin) t.isha = adjust(t.isha, t.sunset, p.isha, false);
    if (typeof p.maghrib === 'number') t.maghrib = adjust(t.maghrib, t.sunset, p.maghrib, false);
  }

  if (typeof p.maghrib !== 'number') t.maghrib = t.sunset;
  if (p.ishaMin) t.isha = t.maghrib + p.ishaMin / 60;

  // Midnight (sunset → next sunrise middle); approximated with today's sunrise.
  t.midnight = t.sunset + fixHour(t.sunrise - t.sunset) / 2;

  const base = Date.UTC(y, m - 1, d);
  const off = p.offsets || {};
  const out = {};
  for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight']) {
    const ms = base + t[k] * 3600000 + (off[k] || 0) * 60000;
    out[k] = new Date(Math.round(ms / 60000) * 60000);
  }
  return out;
}

const KAABA = { lat: 21.4225, lng: 39.8262 };

/** Initial great-circle bearing from a point to the Kaaba, degrees from true north. */
export function qiblaBearing(lat, lng) {
  const φ1 = lat * DEG;
  const φ2 = KAABA.lat * DEG;
  const Δλ = (KAABA.lng - lng) * DEG;
  const θ = Math.atan2(Math.sin(Δλ), Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ));
  return fixAngle(θ / DEG);
}

/** Great-circle distance in km. */
export function distanceKm(lat1, lng1, lat2 = KAABA.lat, lng2 = KAABA.lng) {
  const R = 6371;
  const dφ = (lat2 - lat1) * DEG;
  const dλ = (lng2 - lng1) * DEG;
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
