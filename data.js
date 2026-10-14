// Static reference data: prayers, calculation methods, cities, reminders.

export const PRAYERS = [
  { id: 'fajr', name: 'Fajr', ar: 'الفجر', rakat: 2 },
  { id: 'dhuhr', name: 'Dhuhr', ar: 'الظهر', rakat: 4 },
  { id: 'asr', name: 'Asr', ar: 'العصر', rakat: 4 },
  { id: 'maghrib', name: 'Maghrib', ar: 'المغرب', rakat: 3 },
  { id: 'isha', name: 'Isha', ar: 'العشاء', rakat: 4 },
];
export const PRAYER_IDS = PRAYERS.map((p) => p.id);
export const PRAYER = Object.fromEntries(PRAYERS.map((p) => [p.id, p]));

export const STATUSES = {
  jamaah: { label: 'In congregation', short: 'Jamaah', hint: 'Prayed on time with the congregation', score: 1 },
  ontime: { label: 'On time', short: 'On time', hint: 'Prayed within its time', score: 1 },
  late: { label: 'Late', short: 'Late', hint: 'Prayed, but delayed or after its time', score: 0.5 },
  missed: { label: 'Missed', short: 'Missed', hint: 'Not prayed — adds one to your Qada list', score: 0 },
};
export const PERFORMED = new Set(['jamaah', 'ontime', 'late']);
export const ON_TIME = new Set(['jamaah', 'ontime']);

// Twilight angles in degrees; offsets in minutes (method-level precaution).
const SEA_OFFSETS = { fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 };
export const METHODS = {
  JAKIM: { name: 'JAKIM', full: 'Jabatan Kemajuan Islam Malaysia', fajr: 20, isha: 18, offsets: SEA_OFFSETS },
  MUIS: { name: 'MUIS', full: 'Majlis Ugama Islam Singapura', fajr: 20, isha: 18, offsets: SEA_OFFSETS },
  KEMENAG: { name: 'Kemenag', full: 'Ministry of Religious Affairs, Indonesia', fajr: 20, isha: 18, offsets: SEA_OFFSETS },
  MWL: { name: 'Muslim World League', full: 'Muslim World League', fajr: 18, isha: 17 },
  ISNA: { name: 'ISNA', full: 'Islamic Society of North America', fajr: 15, isha: 15 },
  EGYPT: { name: 'Egyptian Authority', full: 'Egyptian General Authority of Survey', fajr: 19.5, isha: 17.5 },
  MAKKAH: { name: 'Umm al-Qura', full: 'Umm al-Qura University, Makkah', fajr: 18.5, ishaMin: 90 },
  KARACHI: { name: 'Karachi', full: 'University of Islamic Sciences, Karachi', fajr: 18, isha: 18 },
  DUBAI: { name: 'Dubai', full: 'Islamic Affairs & Charitable Activities, Dubai', fajr: 18.2, isha: 18.2, offsets: { sunrise: -3, dhuhr: 3, asr: 3, maghrib: 3 } },
  QATAR: { name: 'Qatar', full: 'Ministry of Awqaf, Qatar', fajr: 18, ishaMin: 90 },
  KUWAIT: { name: 'Kuwait', full: 'Ministry of Awqaf, Kuwait', fajr: 18, isha: 17.5 },
  TURKEY: { name: 'Diyanet', full: 'Presidency of Religious Affairs, Türkiye', fajr: 18, isha: 17, offsets: { sunrise: -7, dhuhr: 5, asr: 4, maghrib: 7 } },
  FRANCE: { name: 'UOIF', full: 'Union des Organisations Islamiques de France', fajr: 12, isha: 12 },
  TEHRAN: { name: 'Tehran', full: 'Institute of Geophysics, University of Tehran', fajr: 17.7, isha: 14, maghrib: 4.5 },
  JAFARI: { name: 'Shia Ithna-Ashari', full: 'Leva Institute, Qum', fajr: 16, isha: 14, maghrib: 4 },
};

export function suggestMethod(tz = '') {
  const map = [
    [/Kuala_Lumpur|Kuching|Brunei/, 'JAKIM'],
    [/Singapore/, 'MUIS'],
    [/Jakarta|Makassar|Jayapura|Pontianak/, 'KEMENAG'],
    [/^America\//, 'ISNA'],
    [/Cairo/, 'EGYPT'],
    [/Riyadh|Aden/, 'MAKKAH'],
    [/Dubai|Muscat/, 'DUBAI'],
    [/Qatar|Bahrain/, 'QATAR'],
    [/Kuwait/, 'KUWAIT'],
    [/Karachi|Dhaka|Kolkata|Kabul/, 'KARACHI'],
    [/Istanbul/, 'TURKEY'],
    [/Tehran/, 'TEHRAN'],
  ];
  for (const [re, m] of map) if (re.test(tz)) return m;
  return 'MWL';
}

export function suggestAsr(tz = '') {
  return /Karachi|Dhaka|Kolkata|Kabul|Istanbul|Tashkent|Samarkand/.test(tz) ? 'hanafi' : 'standard';
}

// [name, country, lat, lng, tz]
export const CITIES = [
  ['Kuala Lumpur', 'Malaysia', 3.139, 101.6869, 'Asia/Kuala_Lumpur'],
  ['Putrajaya', 'Malaysia', 2.9264, 101.6964, 'Asia/Kuala_Lumpur'],
  ['Shah Alam', 'Malaysia', 3.0733, 101.5185, 'Asia/Kuala_Lumpur'],
  ['George Town', 'Malaysia', 5.4141, 100.3288, 'Asia/Kuala_Lumpur'],
  ['Johor Bahru', 'Malaysia', 1.4927, 103.7414, 'Asia/Kuala_Lumpur'],
  ['Kota Bharu', 'Malaysia', 6.1254, 102.2381, 'Asia/Kuala_Lumpur'],
  ['Kuala Terengganu', 'Malaysia', 5.3296, 103.137, 'Asia/Kuala_Lumpur'],
  ['Kuantan', 'Malaysia', 3.8077, 103.326, 'Asia/Kuala_Lumpur'],
  ['Ipoh', 'Malaysia', 4.5975, 101.0901, 'Asia/Kuala_Lumpur'],
  ['Alor Setar', 'Malaysia', 6.1248, 100.3678, 'Asia/Kuala_Lumpur'],
  ['Kangar', 'Malaysia', 6.4414, 100.1986, 'Asia/Kuala_Lumpur'],
  ['Melaka', 'Malaysia', 2.1896, 102.2501, 'Asia/Kuala_Lumpur'],
  ['Seremban', 'Malaysia', 2.7297, 101.9381, 'Asia/Kuala_Lumpur'],
  ['Kota Kinabalu', 'Malaysia', 5.9804, 116.0735, 'Asia/Kuching'],
  ['Kuching', 'Malaysia', 1.5533, 110.3592, 'Asia/Kuching'],
  ['Labuan', 'Malaysia', 5.2831, 115.2308, 'Asia/Kuching'],
  ['Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore'],
  ['Bandar Seri Begawan', 'Brunei', 4.9031, 114.9398, 'Asia/Brunei'],
  ['Jakarta', 'Indonesia', -6.2088, 106.8456, 'Asia/Jakarta'],
  ['Bandung', 'Indonesia', -6.9175, 107.6191, 'Asia/Jakarta'],
  ['Surabaya', 'Indonesia', -7.2575, 112.7521, 'Asia/Jakarta'],
  ['Medan', 'Indonesia', 3.5952, 98.6722, 'Asia/Jakarta'],
  ['Banda Aceh', 'Indonesia', 5.5483, 95.3238, 'Asia/Jakarta'],
  ['Makassar', 'Indonesia', -5.1477, 119.4327, 'Asia/Makassar'],
  ['Bangkok', 'Thailand', 13.7563, 100.5018, 'Asia/Bangkok'],
  ['Pattani', 'Thailand', 6.8696, 101.2501, 'Asia/Bangkok'],
  ['Manila', 'Philippines', 14.5995, 120.9842, 'Asia/Manila'],
  ['Makkah', 'Saudi Arabia', 21.3891, 39.8579, 'Asia/Riyadh'],
  ['Madinah', 'Saudi Arabia', 24.5247, 39.5692, 'Asia/Riyadh'],
  ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 'Asia/Riyadh'],
  ['Jeddah', 'Saudi Arabia', 21.4858, 39.1925, 'Asia/Riyadh'],
  ['Dubai', 'United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai'],
  ['Abu Dhabi', 'United Arab Emirates', 24.4539, 54.3773, 'Asia/Dubai'],
  ['Doha', 'Qatar', 25.2854, 51.531, 'Asia/Qatar'],
  ['Kuwait City', 'Kuwait', 29.3759, 47.9774, 'Asia/Kuwait'],
  ['Muscat', 'Oman', 23.588, 58.3829, 'Asia/Muscat'],
  ['Amman', 'Jordan', 31.9454, 35.9284, 'Asia/Amman'],
  ['Jerusalem', 'Palestine', 31.7683, 35.2137, 'Asia/Jerusalem'],
  ['Cairo', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo'],
  ['Istanbul', 'Türkiye', 41.0082, 28.9784, 'Europe/Istanbul'],
  ['Tehran', 'Iran', 35.6892, 51.389, 'Asia/Tehran'],
  ['Karachi', 'Pakistan', 24.8607, 67.0011, 'Asia/Karachi'],
  ['Lahore', 'Pakistan', 31.5204, 74.3587, 'Asia/Karachi'],
  ['Islamabad', 'Pakistan', 33.6844, 73.0479, 'Asia/Karachi'],
  ['Delhi', 'India', 28.6139, 77.209, 'Asia/Kolkata'],
  ['Mumbai', 'India', 19.076, 72.8777, 'Asia/Kolkata'],
  ['Hyderabad', 'India', 17.385, 78.4867, 'Asia/Kolkata'],
  ['Dhaka', 'Bangladesh', 23.8103, 90.4125, 'Asia/Dhaka'],
  ['Kabul', 'Afghanistan', 34.5553, 69.2075, 'Asia/Kabul'],
  ['Tashkent', 'Uzbekistan', 41.2995, 69.2401, 'Asia/Tashkent'],
  ['Casablanca', 'Morocco', 33.5731, -7.5898, 'Africa/Casablanca'],
  ['Tunis', 'Tunisia', 36.8065, 10.1815, 'Africa/Tunis'],
  ['Algiers', 'Algeria', 36.7538, 3.0588, 'Africa/Algiers'],
  ['Lagos', 'Nigeria', 6.5244, 3.3792, 'Africa/Lagos'],
  ['Nairobi', 'Kenya', -1.2921, 36.8219, 'Africa/Nairobi'],
  ['Johannesburg', 'South Africa', -26.2041, 28.0473, 'Africa/Johannesburg'],
  ['London', 'United Kingdom', 51.5074, -0.1278, 'Europe/London'],
  ['Birmingham', 'United Kingdom', 52.4862, -1.8904, 'Europe/London'],
  ['Paris', 'France', 48.8566, 2.3522, 'Europe/Paris'],
  ['Berlin', 'Germany', 52.52, 13.405, 'Europe/Berlin'],
  ['Amsterdam', 'Netherlands', 52.3676, 4.9041, 'Europe/Amsterdam'],
  ['Stockholm', 'Sweden', 59.3293, 18.0686, 'Europe/Stockholm'],
  ['New York', 'United States', 40.7128, -74.006, 'America/New_York'],
  ['Chicago', 'United States', 41.8781, -87.6298, 'America/Chicago'],
  ['Houston', 'United States', 29.7604, -95.3698, 'America/Chicago'],
  ['Los Angeles', 'United States', 34.0522, -118.2437, 'America/Los_Angeles'],
  ['Toronto', 'Canada', 43.6532, -79.3832, 'America/Toronto'],
  ['Sydney', 'Australia', -33.8688, 151.2093, 'Australia/Sydney'],
  ['Melbourne', 'Australia', -37.8136, 144.9631, 'Australia/Melbourne'],
  ['Perth', 'Australia', -31.9505, 115.8605, 'Australia/Perth'],
  ['Auckland', 'New Zealand', -36.8485, 174.7633, 'Pacific/Auckland'],
  ['Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo'],
  ['Seoul', 'South Korea', 37.5665, 126.978, 'Asia/Seoul'],
  ['Beijing', 'China', 39.9042, 116.4074, 'Asia/Shanghai'],
  ['Hong Kong', 'China', 22.3193, 114.1694, 'Asia/Hong_Kong'],
].map(([name, country, lat, lng, tz]) => ({ name, country, lat, lng, tz }));

export const REMINDERS = [
  { text: 'Indeed, prayer has been decreed upon the believers at specified times.', ref: 'Qur’an 4:103' },
  { text: 'Guard strictly the prayers, especially the middle prayer, and stand before Allah in devotion.', ref: 'Qur’an 2:238' },
  { text: 'Seek help through patience and prayer.', ref: 'Qur’an 2:45' },
  { text: 'Successful indeed are the believers — those who are humble in their prayers.', ref: 'Qur’an 23:1–2' },
  { text: 'Indeed, prayer restrains from immorality and wrongdoing.', ref: 'Qur’an 29:45' },
  { text: 'Establish prayer at the two ends of the day and in the early hours of the night.', ref: 'Qur’an 11:114' },
  { text: 'So remember Me; I will remember you.', ref: 'Qur’an 2:152' },
  { text: 'The deed most beloved to Allah is prayer offered at its proper time.', ref: 'Sahih al-Bukhari & Muslim' },
  { text: 'The first deed a servant will be asked about on the Day of Judgement is the prayer.', ref: 'Sunan al-Tirmidhi' },
  { text: 'Prayer in congregation is twenty-seven degrees more excellent than prayer alone.', ref: 'Sahih al-Bukhari & Muslim' },
  { text: 'Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers.', ref: 'Sahih Muslim' },
  { text: 'The most beloved deeds to Allah are those done consistently, even if they are small.', ref: 'Sahih al-Bukhari & Muslim' },
  { text: 'The five prayers are like a river at your door in which you bathe five times a day.', ref: 'Sahih al-Bukhari & Muslim (meaning)' },
  { text: 'The coolness of my eyes has been placed in prayer.', ref: 'Sunan al-Nasa’i' },
];

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiʿ al-Awwal', 'Rabiʿ al-Thani', 'Jumada al-Ula', 'Jumada al-Akhirah',
  'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhu al-Qaʿdah', 'Dhu al-Hijjah',
];

// Adhan recordings bundled with the app (freely licensed, from Wikimedia Commons).
// File names use only a-z, 0-9 and _ so they can double as Android notification sounds (res/raw).
export const ADHANS = [
  { id: 'fakhri', name: 'Sabah Fakhri', note: 'Aleppo, Syria · celebrated voice', file: 'adhan_fakhri.mp3', length: '2:38', license: 'Public domain', author: 'Sabah Fakhri', source: 'https://commons.wikimedia.org/wiki/File:Call_to_prayer_by_Sabah_Fakhry.mp3' },
  { id: 'gentle', name: 'Gentle', note: 'Soft and unhurried', file: 'adhan_gentle.ogg', length: '2:34', license: 'CC0', author: 'Adam-synagda', source: 'https://commons.wikimedia.org/wiki/File:Beautiful_adhan.ogg' },
  { id: 'classic', name: 'Classic', note: 'Full traditional adhan', file: 'adhan_classic.ogg', length: '3:03', license: 'CC BY-SA 4.0', author: 'Andrewler', source: 'https://commons.wikimedia.org/wiki/File:Azan.ogg' },
  { id: 'azeez', name: 'Aaqib Azeez', note: 'Clear and concise', file: 'adhan_azeez.mp3', length: '1:27', license: 'CC BY-SA 4.0', author: 'Atcovi (recording of Aaqib Azeez)', source: 'https://commons.wikimedia.org/wiki/File:The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3' },
  { id: 'custom', name: 'Your own adhan', note: 'e.g. your local masjid', file: 'adhan_custom.mp3', optional: true },
];
export const ADHAN = Object.fromEntries(ADHANS.map((a) => [a.id, a]));
