// Wirid & doa after the fardhu prayers, following the sequence commonly
// practised in Malaysian mosques (Ahli Sunnah wal Jamaah, Shafiʿi school).
// Qur'anic text follows the standard Uthmani orthography (simplified).

export const WIRID = [
  {
    id: 'istighfar', tag: 'Istighfar', title: 'Seeking forgiveness', count: 3,
    ar: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    tr: 'Astaghfirullāhal-ʿaẓīm, alladhī lā ilāha illā huwal-ḥayyul-qayyūm, wa atūbu ilaih.',
    en: 'I seek forgiveness from Allah the Almighty — there is no god but He, the Ever-Living, the Self-Sustaining — and I turn to Him in repentance.',
  },
  {
    id: 'tahlil', tag: 'Tahlil', title: 'Declaring His oneness', count: 3,
    ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    tr: 'Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamd, yuḥyī wa yumīt, wa huwa ʿalā kulli shay’in qadīr.',
    en: 'There is no god but Allah alone, without partner. His is the dominion and His is the praise; He gives life and causes death, and He has power over all things.',
    note: 'Many recite this ten times after Subuh and Maghrib.',
  },
  {
    id: 'salam', tag: 'Doa', title: 'You are Peace', count: 1,
    ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، وَإِلَيْكَ يَعُودُ السَّلَامُ، فَحَيِّنَا رَبَّنَا بِالسَّلَامِ، وَأَدْخِلْنَا الْجَنَّةَ دَارَ السَّلَامِ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    tr: 'Allāhumma antas-salām, wa minkas-salām, wa ilaika yaʿūdus-salām, fa ḥayyinā rabbanā bis-salām, wa adkhilnal-jannata dāras-salām, tabārakta rabbanā wa taʿālaita yā dhal-jalāli wal-ikrām.',
    en: 'O Allah, You are Peace and from You comes peace, and to You peace returns. Let us live, our Lord, in peace, and admit us into Paradise, the Abode of Peace. Blessed and exalted are You, our Lord, Possessor of Majesty and Honour.',
  },
  {
    id: 'fatihah', tag: 'Al-Fatihah', title: 'The Opening', count: 1,
    ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
    tr: 'Bismillāhir-raḥmānir-raḥīm. Al-ḥamdu lillāhi rabbil-ʿālamīn. Ar-raḥmānir-raḥīm. Māliki yawmid-dīn. Iyyāka naʿbudu wa iyyāka nastaʿīn. Ihdinaṣ-ṣirāṭal-mustaqīm. Ṣirāṭalladhīna anʿamta ʿalaihim, ghairil-maghḍūbi ʿalaihim wa laḍ-ḍāllīn.',
    en: 'In the name of Allah, the Most Compassionate, the Most Merciful. All praise is for Allah, Lord of all worlds, the Most Compassionate, the Most Merciful, Master of the Day of Judgement. You alone we worship and You alone we ask for help. Guide us along the Straight Path — the path of those You have blessed, not of those who earned Your anger, nor of those who went astray.',
    ref: 'Qur’an 1:1–7',
  },
  {
    id: 'ilahukum', tag: 'Al-Baqarah 163', title: 'Your God is One', count: 1,
    ar: 'وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ',
    tr: 'Wa ilāhukum ilāhun wāḥid, lā ilāha illā huwar-raḥmānur-raḥīm.',
    en: 'Your God is one God; there is no god except Him, the Most Compassionate, the Most Merciful.',
    ref: 'Qur’an 2:163',
  },
  {
    id: 'kursi', tag: 'Ayat al-Kursi', title: 'The Verse of the Throne', count: 1,
    ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    tr: 'Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta’khudhuhū sinatun wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dhalladhī yashfaʿu ʿindahū illā bi-idhnih, yaʿlamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bi shay’in min ʿilmihī illā bimā shā’, wasiʿa kursiyyuhus-samāwāti wal-arḍ, wa lā ya’ūduhū ḥifẓuhumā, wa huwal-ʿaliyyul-ʿaẓīm.',
    en: 'Allah — there is no god except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and the earth. Who could intercede with Him except by His permission? He knows what is before them and what is behind them, and they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and the earth, and guarding them does not tire Him. He is the Most High, the Most Great.',
    ref: 'Qur’an 2:255',
    note: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and Paradise except death. — al-Nasa’i',
  },
  {
    id: 'tasbih', tag: 'Tasbih', title: 'Glory be to Allah', count: 33,
    ar: 'سُبْحَانَ اللَّهِ',
    tr: 'Subḥānallāh.',
    en: 'Glory be to Allah.',
    after: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ دَائِمًا أَبَدًا',
    afterTr: 'Subḥānallāhi wa biḥamdihī dā’iman abadā — Glory and praise be to Allah, always and forever.',
  },
  {
    id: 'tahmid', tag: 'Tahmid', title: 'All praise is for Allah', count: 33,
    ar: 'الْحَمْدُ لِلَّهِ',
    tr: 'Al-ḥamdu lillāh.',
    en: 'All praise is for Allah.',
    after: 'الْحَمْدُ لِلَّهِ عَلَىٰ كُلِّ حَالٍ وَفِي كُلِّ حَالٍ وَبِنِعْمَةِ يَا كَرِيمُ',
    afterTr: 'Al-ḥamdu lillāhi ʿalā kulli ḥālin wa fī kulli ḥālin wa bi niʿmati yā Karīm — Praise be to Allah in every state and in every condition, for every blessing, O Most Generous.',
  },
  {
    id: 'takbir', tag: 'Takbir', title: 'Allah is the Greatest', count: 33,
    ar: 'اللَّهُ أَكْبَرُ',
    tr: 'Allāhu akbar.',
    en: 'Allah is the Greatest.',
    after: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا',
    afterTr: 'Allāhu akbaru kabīrā, wal-ḥamdu lillāhi kathīrā, wa subḥānallāhi bukratan wa aṣīlā — Allah is the Greatest, abundant praise be to Allah, and glory be to Allah morning and evening.',
  },
  {
    id: 'hundred', tag: 'Completing 100', title: 'Sealing the tasbih', count: 1,
    ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    tr: 'Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shay’in qadīr. Wa lā ḥawla wa lā quwwata illā billāhil-ʿaliyyil-ʿaẓīm.',
    en: 'There is no god but Allah alone, without partner; His is the dominion and the praise, and He has power over all things. There is no might and no power except with Allah, the Most High, the Most Great.',
    note: 'Whoever glorifies Allah 33 times, praises Him 33 times, magnifies Him 33 times and completes the hundred with this, his sins are forgiven even if they are like the foam of the sea. — Muslim',
  },
  {
    id: 'afdal', tag: 'Tahlil', title: 'The best remembrance', count: 33,
    pre: 'أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ',
    preTr: 'Afḍaludh-dhikri faʿlam annahū — Know that the best remembrance is:',
    ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    tr: 'Lā ilāha illallāh.',
    en: 'There is no god but Allah.',
    after: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    afterTr: 'Lā ilāha illallāh, Muḥammadur-rasūlullāh ṣallallāhu ʿalaihi wa sallam.',
  },
  {
    id: 'selawat', tag: 'Selawat', title: 'Blessings upon the Prophet ﷺ', count: 3,
    ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ وَسَلِّمْ',
    tr: 'Allāhumma ṣalli ʿalā sayyidinā Muḥammadin wa ʿalā āli sayyidinā Muḥammadin wa sallim.',
    en: 'O Allah, send blessings and peace upon our master Muhammad and upon the family of our master Muhammad.',
  },
  {
    id: 'doa', tag: 'Doa', title: 'Opening the supplication', count: 1,
    ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيدَهُ. يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ. اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ أَجْمَعِينَ',
    tr: 'Bismillāhir-raḥmānir-raḥīm. Al-ḥamdu lillāhi rabbil-ʿālamīn, ḥamdan yuwāfī niʿamahū wa yukāfi’u mazīdah. Yā rabbanā lakal-ḥamdu kamā yanbaghī li jalāli wajhika wa ʿaẓīmi sulṭānik. Allāhumma ṣalli wa sallim ʿalā sayyidinā Muḥammadin wa ʿalā ālihī wa ṣaḥbihī ajmaʿīn.',
    en: 'In the name of Allah, the Most Compassionate, the Most Merciful. All praise is for Allah, Lord of the worlds — praise that matches His blessings and equals His increase. Our Lord, to You belongs all praise, as befits the majesty of Your Face and the greatness of Your sovereignty. O Allah, send blessings and peace upon our master Muhammad, his family and all his companions.',
  },
  {
    id: 'ainni', tag: 'Doa', title: 'Help me to worship You well', count: 1,
    ar: 'اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    tr: 'Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa ḥusni ʿibādatik.',
    en: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
    note: 'Taught by the Prophet ﷺ to Muʿadh ibn Jabal to say after every prayer. — Abu Dawud',
  },
  {
    id: 'walidayya', tag: 'Doa', title: 'For parents and believers', count: 1,
    ar: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    tr: 'Rabbanaghfir lī wa li wālidayya wa lil-mu’minīna yawma yaqūmul-ḥisāb.',
    en: 'Our Lord, forgive me, my parents and the believers on the Day the reckoning is established.',
    ref: 'Qur’an 14:41',
  },
  {
    id: 'hasanah', tag: 'Doa', title: 'Good in both worlds', count: 1,
    ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    tr: 'Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ʿadhāban-nār.',
    en: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    ref: 'Qur’an 2:201',
  },
  {
    id: 'closing', tag: 'Closing', title: 'Sealing the doa', count: 1,
    ar: 'سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ ﴿١٨٠﴾ وَسَلَامٌ عَلَى الْمُرْسَلِينَ ﴿١٨١﴾ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١٨٢﴾',
    tr: 'Subḥāna rabbika rabbil-ʿizzati ʿammā yaṣifūn, wa salāmun ʿalal-mursalīn, wal-ḥamdu lillāhi rabbil-ʿālamīn.',
    en: 'Exalted is your Lord, the Lord of Might, above what they describe. Peace be upon the messengers, and all praise is for Allah, Lord of the worlds.',
    ref: 'Qur’an 37:180–182',
    note: 'It is customary in Malaysia to end with Al-Fatihah and wipe the face with both palms.',
  },
];

export const WIRID_INTRO =
  'A gentle sequence of remembrance and supplication recited after each fardhu prayer, as commonly practised in Malaysian mosques following Ahli Sunnah wal Jamaah. Wording may vary slightly between booklets — follow your teacher or local masjid where they differ.';
