// Recitations inside the prayer, in order from Takbir to Salam, following the
// Shafiʿi practice taught in Malaysia. Qur'anic text in simplified Uthmani orthography.
import { WIRID } from './wirid.js';

const FATIHAH = WIRID.find((w) => w.id === 'fatihah');

export const HUKUM = {
  rukun: 'Rukun',
  sunnah: 'Sunnah',
  abad: 'Sunnah abʿaḍ',
};

export const PHASES = [
  { id: 'start', name: 'Opening', posture: 'Standing · facing the Qibla', note: 'Stand upright facing the Qibla, in a state of wudu and with the ʿawrah covered. The prayer begins with the intention and Takbiratul Ihram.' },
  { id: 'qiyam', name: 'Qiyam', posture: 'Standing', note: 'Place the right hand over the left below the chest. Recite quietly in Dhuhr and Asr, and aloud in the first two rakaʿat of Subuh, Maghrib and Isha (for the imam or when praying alone).' },
  { id: 'ruku', name: 'Rukuk', posture: 'Bowing', note: 'Say “Allāhu akbar” while bowing, with the back straight and the palms on the knees. Pause in stillness (tumaʾninah).' },
  { id: 'itidal', name: 'Iʿtidal', posture: 'Rising · standing upright', note: 'Rise from rukuk raising the hands, then stand fully upright with tumaʾninah.' },
  { id: 'sujud', name: 'Sujud', posture: 'Prostration', note: 'Go down saying “Allāhu akbar”. Seven parts touch the ground: the forehead, both palms, both knees and the toes of both feet.' },
  { id: 'jalsah', name: 'Between the two sujud', posture: 'Sitting · iftirash', note: 'Sit on the left foot with the right foot upright, then make the second sujud exactly like the first.' },
  { id: 'tashahhud', name: 'Tashahhud', posture: 'Sitting', note: 'The first tashahhud comes after the second rakaʿah of a 3- or 4-rakaʿah prayer. The final tashahhud is in the last rakaʿah. Raise the right index finger at “illallāh”.' },
  { id: 'salam', name: 'Salam', posture: 'Closing', note: 'Turn the face to the right, then to the left.' },
  { id: 'extra', name: 'Also useful', posture: 'When needed', note: '' },
];

export const GUIDE = [
  {
    id: 'g-niat', phase: 'start', hukum: 'rukun', tag: 'Niat', title: 'Intention', count: 1, dynamic: true,
    note: 'The intention is made in the heart at the moment of Takbiratul Ihram. Pronouncing it softly just before (talaffuẓ) is a sunnah in the Shafiʿi school to help the heart focus.',
  },
  {
    id: 'g-takbir', phase: 'start', hukum: 'rukun', tag: 'Takbiratul Ihram', title: 'Opening takbir', count: 1,
    ar: 'اللَّهُ أَكْبَرُ',
    tr: 'Allāhu akbar.',
    en: 'Allah is the Greatest.',
    note: 'Raise both hands level with the shoulders, thumbs near the earlobes, while holding the intention in the heart.',
  },
  {
    id: 'g-iftitah', phase: 'qiyam', hukum: 'sunnah', tag: 'Doa Iftitah', title: 'Opening supplication', count: 1,
    ar: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا. وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا مُسْلِمًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ. إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ، لَا شَرِيكَ لَهُ وَبِذَٰلِكَ أُمِرْتُ وَأَنَا مِنَ الْمُسْلِمِينَ',
    tr: 'Allāhu akbaru kabīrā, wal-ḥamdu lillāhi kathīrā, wa subḥānallāhi bukratan wa aṣīlā. Wajjahtu wajhiya lilladhī faṭaras-samāwāti wal-arḍa ḥanīfan musliman wa mā ana minal-mushrikīn. Inna ṣalātī wa nusukī wa maḥyāya wa mamātī lillāhi rabbil-ʿālamīn, lā sharīka lahū wa bidhālika umirtu wa ana minal-muslimīn.',
    en: 'Allah is the Greatest, abundant praise be to Allah, and glory be to Allah morning and evening. I have turned my face to the One who created the heavens and the earth, inclining to truth in submission, and I am not of those who associate partners with Him. My prayer, my sacrifice, my life and my death are for Allah, Lord of the worlds. He has no partner; this I have been commanded, and I am of those who submit.',
    note: 'Recited quietly after Takbiratul Ihram, in the first rakaʿah only.',
    ref: 'Sahih Muslim',
  },
  {
    id: 'g-taawwudh', phase: 'qiyam', hukum: 'sunnah', tag: 'Taʿawwudh', title: 'Seeking refuge', count: 1,
    ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    tr: 'Aʿūdhu billāhi minash-shaiṭānir-rajīm.',
    en: 'I seek refuge in Allah from Satan, the accursed.',
    note: 'Said quietly before Al-Fatihah in every rakaʿah.',
  },
  {
    ...FATIHAH, id: 'g-fatihah', phase: 'qiyam', hukum: 'rukun', tag: 'Al-Fatihah', title: 'The Opening', count: 1,
    after: 'آمِين',
    afterTr: 'Āmīn — O Allah, answer our prayer. (Sunnah after Al-Fatihah.)',
    note: 'A pillar in every rakaʿah. Recite it carefully with correct makhraj and tajwid; a single missed letter can affect the prayer.',
  },
  {
    id: 'g-ikhlas', phase: 'qiyam', hukum: 'sunnah', tag: 'Short surah', title: 'Al-Ikhlas', count: 1,
    ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ﴿٤﴾',
    tr: 'Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul-lahū kufuwan aḥad.',
    en: 'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, and there is none comparable to Him.',
    ref: 'Qur’an 112',
    note: 'Any surah or verses may be recited after Al-Fatihah in the first two rakaʿat. Three short options are given here.',
  },
  {
    id: 'g-asr', phase: 'qiyam', hukum: 'sunnah', tag: 'Short surah', title: 'Al-ʿAsr', count: 1,
    ar: 'وَالْعَصْرِ ﴿١﴾ إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ ﴿٢﴾ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴿٣﴾',
    tr: 'Wal-ʿaṣr. Innal-insāna lafī khusr. Illalladhīna āmanū wa ʿamiluṣ-ṣāliḥāti wa tawāṣau bil-ḥaqqi wa tawāṣau biṣ-ṣabr.',
    en: 'By time, indeed mankind is in loss — except those who believe, do righteous deeds, and urge one another to the truth and to patience.',
    ref: 'Qur’an 103',
  },
  {
    id: 'g-kawthar', phase: 'qiyam', hukum: 'sunnah', tag: 'Short surah', title: 'Al-Kawthar', count: 1,
    ar: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ﴿١﴾ فَصَلِّ لِرَبِّكَ وَانْحَرْ ﴿٢﴾ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ ﴿٣﴾',
    tr: 'Innā aʿṭaināka al-kawthar. Fa ṣalli li rabbika wanḥar. Inna shāni’aka huwal-abtar.',
    en: 'Indeed, We have granted you al-Kawthar. So pray to your Lord and sacrifice. Indeed, the one who hates you is the one cut off.',
    ref: 'Qur’an 108',
  },
  {
    id: 'g-rukuk', phase: 'ruku', hukum: 'sunnah', tag: 'Tasbih rukuk', title: 'Glory to my Lord, the Most Great', count: 3,
    ar: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ',
    tr: 'Subḥāna rabbiyal-ʿaẓīmi wa biḥamdih.',
    en: 'Glory be to my Lord, the Most Great, and praise be to Him.',
    note: 'Bowing with stillness is a pillar; the tasbih is sunnah — three times is the recommended minimum.',
  },
  {
    id: 'g-samiallah', phase: 'itidal', hukum: 'sunnah', tag: 'Rising', title: 'Allah hears the one who praises Him', count: 1,
    ar: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ',
    tr: 'Samiʿallāhu liman ḥamidah.',
    en: 'Allah hears the one who praises Him.',
    note: 'Said while rising from rukuk, raising both hands.',
  },
  {
    id: 'g-rabbana', phase: 'itidal', hukum: 'sunnah', tag: 'Iʿtidal', title: 'Our Lord, to You is all praise', count: 1,
    ar: 'رَبَّنَا لَكَ الْحَمْدُ، مِلْءَ السَّمَاوَاتِ، وَمِلْءَ الْأَرْضِ، وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ',
    tr: 'Rabbanā lakal-ḥamd, mil’as-samāwāti, wa mil’al-arḍi, wa mil’a mā shi’ta min shay’in baʿd.',
    en: 'Our Lord, to You belongs all praise — filling the heavens, filling the earth, and filling whatever else You will.',
    ref: 'Sahih Muslim',
  },
  {
    id: 'g-qunut', phase: 'itidal', hukum: 'abad', tag: 'Qunut Subuh', title: 'The Qunut supplication', count: 1,
    ar: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَىٰ عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ، فَلَكَ الْحَمْدُ عَلَىٰ مَا قَضَيْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ، وَصَلَّى اللَّهُ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلَّمَ',
    tr: 'Allāhummahdinī fīman hadait, wa ʿāfinī fīman ʿāfait, wa tawallanī fīman tawallait, wa bārik lī fīmā aʿṭait, wa qinī sharra mā qaḍait, fa innaka taqḍī wa lā yuqḍā ʿalaik, wa innahū lā yadhillu man wālait, wa lā yaʿizzu man ʿādait, tabārakta rabbanā wa taʿālait, fa lakal-ḥamdu ʿalā mā qaḍait, astaghfiruka wa atūbu ilaik, wa ṣallallāhu ʿalā sayyidinā Muḥammadinin-nabiyyil-ummiyyi wa ʿalā ālihī wa ṣaḥbihī wa sallam.',
    en: 'O Allah, guide me among those You have guided, grant me well-being among those You have granted well-being, take me into Your care among those You have cared for, bless me in what You have given, and protect me from the evil of what You have decreed. You decree and none decrees against You. Whoever You befriend is never humbled, and whoever You oppose is never honoured. Blessed and exalted are You, our Lord. Praise is Yours for what You have decreed; I seek Your forgiveness and turn to You. May Allah send blessings and peace upon our master Muhammad, the unlettered Prophet, and his family and companions.',
    note: 'Recited in the second rakaʿah of Subuh after rising from rukuk, with hands raised. If forgotten, perform sujud sahwi. When leading, the imam uses the plural: اهْدِنَا (ihdinā), وَعَافِنَا …',
  },
  {
    id: 'g-sujud', phase: 'sujud', hukum: 'sunnah', tag: 'Tasbih sujud', title: 'Glory to my Lord, the Most High', count: 3,
    ar: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ وَبِحَمْدِهِ',
    tr: 'Subḥāna rabbiyal-aʿlā wa biḥamdih.',
    en: 'Glory be to my Lord, the Most High, and praise be to Him.',
    note: 'Prostrating with stillness is a pillar; the tasbih is sunnah. Sujud is the moment a servant is closest to his Lord — make abundant doa.',
  },
  {
    id: 'g-jalsah', phase: 'jalsah', hukum: 'sunnah', tag: 'Duduk antara dua sujud', title: 'My Lord, forgive me', count: 1,
    ar: 'رَبِّ اغْفِرْ لِي، وَارْحَمْنِي، وَاجْبُرْنِي، وَارْفَعْنِي، وَارْزُقْنِي، وَاهْدِنِي، وَعَافِنِي، وَاعْفُ عَنِّي',
    tr: 'Rabbighfir lī, warḥamnī, wajburnī, warfaʿnī, warzuqnī, wahdinī, wa ʿāfinī, waʿfu ʿannī.',
    en: 'My Lord, forgive me, have mercy on me, mend my shortcomings, raise my rank, provide for me, guide me, grant me well-being and pardon me.',
  },
  {
    id: 'g-tahiyyat1', phase: 'tashahhud', hukum: 'abad', tag: 'Tahiyyat awal', title: 'The first tashahhud', count: 1,
    ar: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
    tr: 'At-taḥiyyātul-mubārakātuṣ-ṣalawātuṭ-ṭayyibātu lillāh. As-salāmu ʿalaika ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu ʿalainā wa ʿalā ʿibādillāhiṣ-ṣāliḥīn. Ashhadu an lā ilāha illallāh, wa ashhadu anna Muḥammadar-rasūlullāh.',
    en: 'All blessed greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.',
    after: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ',
    afterTr: 'Allāhumma ṣalli ʿalā sayyidinā Muḥammad — O Allah, send blessings upon our master Muhammad.',
    ref: 'Sahih Muslim (Ibn ʿAbbas)',
    note: 'Sit iftirash after the second rakaʿah of Dhuhr, Asr, Maghrib and Isha, then rise for the next rakaʿah saying “Allāhu akbar”. If forgotten, perform sujud sahwi.',
  },
  {
    id: 'g-tahiyyat2', phase: 'tashahhud', hukum: 'rukun', tag: 'Tahiyyat akhir', title: 'The final tashahhud', count: 1,
    ar: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
    tr: 'At-taḥiyyātul-mubārakātuṣ-ṣalawātuṭ-ṭayyibātu lillāh. As-salāmu ʿalaika ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu ʿalainā wa ʿalā ʿibādillāhiṣ-ṣāliḥīn. Ashhadu an lā ilāha illallāh, wa ashhadu anna Muḥammadar-rasūlullāh.',
    en: 'All blessed greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.',
    ref: 'Sahih Muslim (Ibn ʿAbbas)',
    note: 'In the last rakaʿah, sit tawarruk — the left hip on the ground with the left foot under the right shin.',
  },
  {
    id: 'g-ibrahimiyyah', phase: 'tashahhud', hukum: 'rukun', tag: 'Selawat Ibrahimiyyah', title: 'Blessings upon the Prophet ﷺ', count: 1,
    ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    tr: 'Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa ʿalā āli sayyidinā Muḥammad, kamā ṣallaita ʿalā sayyidinā Ibrāhīma wa ʿalā āli sayyidinā Ibrāhīm, wa bārik ʿalā sayyidinā Muḥammadin wa ʿalā āli sayyidinā Muḥammad, kamā bārakta ʿalā sayyidinā Ibrāhīma wa ʿalā āli sayyidinā Ibrāhīm, fil-ʿālamīna innaka ḥamīdun majīd.',
    en: 'O Allah, send prayers upon our master Muhammad and the family of our master Muhammad, as You sent prayers upon our master Ibrahim and the family of our master Ibrahim; and bless our master Muhammad and the family of our master Muhammad, as You blessed our master Ibrahim and the family of our master Ibrahim. In all the worlds, You are Praiseworthy, Glorious.',
    note: 'The minimum “Allāhumma ṣalli ʿalā Muḥammad” is a pillar in the final tashahhud; the complete form is sunnah.',
  },
  {
    id: 'g-beforesalam', phase: 'tashahhud', hukum: 'sunnah', tag: 'Doa before salam', title: 'Seeking refuge from four trials', count: 1,
    ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
    tr: 'Allāhumma innī aʿūdhu bika min ʿadhābi jahannam, wa min ʿadhābil-qabr, wa min fitnatil-maḥyā wal-mamāt, wa min sharri fitnatil-masīḥid-dajjāl.',
    en: 'O Allah, I seek refuge in You from the punishment of Hell, from the punishment of the grave, from the trials of life and death, and from the evil of the trial of the False Messiah.',
    ref: 'Sahih Muslim',
  },
  {
    id: 'g-salam', phase: 'salam', hukum: 'rukun', tag: 'Salam', title: 'Ending the prayer', count: 1,
    ar: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
    tr: 'As-salāmu ʿalaikum wa raḥmatullāh.',
    en: 'Peace be upon you, and the mercy of Allah.',
    note: 'Turn to the right, then to the left. The first salam is a pillar; the second is sunnah. Then continue with the wirid.',
  },
  {
    id: 'g-sahwi', phase: 'extra', hukum: 'sunnah', tag: 'Sujud sahwi', title: 'Prostration of forgetfulness', count: 1,
    ar: 'سُبْحَانَ مَنْ لَا يَنَامُ وَلَا يَسْهُو',
    tr: 'Subḥāna man lā yanāmu wa lā yashū.',
    en: 'Glory be to the One who neither sleeps nor forgets.',
    note: 'Two prostrations after the final tashahhud and before salam — for example when the first tashahhud or the qunut was missed, or in doubt about the number of rakaʿat. The regular sujud tasbih also suffices.',
  },
];

// ---- Niat (intention) builder ----------------------------------------------
const NIAT = {
  fajr: { ar: 'الصُّبْحِ', tr: 'farḍaṣ-ṣubḥi', rar: 'رَكْعَتَيْنِ', rtr: 'rakʿataini', en: 'Subuh', n: 'two' },
  dhuhr: { ar: 'الظُّهْرِ', tr: 'farḍaẓ-ẓuhri', rar: 'أَرْبَعَ رَكَعَاتٍ', rtr: 'arbaʿa rakaʿātin', en: 'Dhuhr', n: 'four' },
  asr: { ar: 'الْعَصْرِ', tr: 'farḍal-ʿaṣri', rar: 'أَرْبَعَ رَكَعَاتٍ', rtr: 'arbaʿa rakaʿātin', en: 'Asr', n: 'four' },
  maghrib: { ar: 'الْمَغْرِبِ', tr: 'farḍal-maghribi', rar: 'ثَلَاثَ رَكَعَاتٍ', rtr: 'thalātha rakaʿātin', en: 'Maghrib', n: 'three' },
  isha: { ar: 'الْعِشَاءِ', tr: 'farḍal-ʿishā’i', rar: 'أَرْبَعَ رَكَعَاتٍ', rtr: 'arbaʿa rakaʿātin', en: 'Isha', n: 'four' },
};
const TYPE = {
  ada: { ar: 'أَدَاءً', tr: 'adā’an', en: 'on time' },
  qada: { ar: 'قَضَاءً', tr: 'qaḍā’an', en: 'as a make-up (qada)' },
};
const ROLE = {
  alone: { ar: '', tr: '', en: '' },
  makmum: { ar: 'مَأْمُومًا', tr: 'ma’mūman', en: ', following the imam' },
  imam: { ar: 'إِمَامًا', tr: 'imāman', en: ', as imam' },
};

/** Resolve a guide item; the niat is built from the chosen prayer, type and role. */
export function resolveGuide(g, opts) {
  if (!g.dynamic) return g;
  const p = NIAT[opts.prayer] || NIAT.dhuhr;
  const t = TYPE[opts.type] || TYPE.ada;
  const r = ROLE[opts.role] || ROLE.alone;
  return {
    ...g,
    ar: `أُصَلِّي فَرْضَ ${p.ar} ${p.rar} ${t.ar}${r.ar ? ` ${r.ar}` : ''} لِلَّهِ تَعَالَىٰ`,
    tr: `Uṣallī ${p.tr} ${p.rtr} ${t.tr}${r.tr ? ` ${r.tr}` : ''} lillāhi taʿālā.`,
    en: `I intend to pray the obligatory ${p.en}, ${p.n} rakaʿat ${t.en}${r.en}, for Allah the Exalted.`,
  };
}

export const GUIDE_INTRO =
  'Every recitation of the prayer in order — Arabic, transliteration and meaning — following the Shafiʿi practice taught in Malaysia. Pillars (rukun) must never be left out; sunnah abʿaḍ, if forgotten, is made up with sujud sahwi; the other sunnah recitations complete and beautify the prayer.';
