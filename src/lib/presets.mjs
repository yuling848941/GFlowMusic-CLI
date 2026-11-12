// Professional Music Prompt Engineering Engine & Universal Genre Preset Library
// Built on Google Lyria (3 / 3.5 / Pro) & AI Music Community 6-Component Sonic Formula:
// [1. Genre & Era Anchor] + [2. Mood & Emotional Arc] + [3. Specific Instrumentation & Articulation]
// + [4. Tempo, Groove & Meter] + [5. Vocal/Instrumental Focus] + [6. Production, Acoustics & Mix Polish]

/**
 * Anti-pattern / noise keywords known in the AI music community to dilute sonic embeddings
 * or cause over-compressed artifacts without adding musical specificity.
 */
export const BANNED_MUSIC_KEYWORDS = [
  /\b(?:best\s+quality|high\s+quality|ultra\s+hd|4k\s+audio|8k\s+audio|masterpiece|award[- ]winning)\b/gi,
  /\b(?:320\s*kbps|128\s*kbps|mp3\s+quality|lossless\s+wav|trending\s+on\s+spotify|viral\s+hit)\b/gi,
  /\b(?:good\s+music|nice\s+song|great\s+melody|best\s+song\s+ever)\b/gi,
  /^(?:please\s+)?(?:make|create|generate|write)\s+(?:me\s+)?(?:a\s+)?(?:song|music|track|bgm)\s+(?:about|with|for|that\s+is)\s+/i,
];

/**
 * Vague instrument/style terms upgraded to specific physical acoustic descriptors.
 */
const VAGUE_UPGRADES = [
  [/\bguitars?\s+and\s+drums?\b/gi, "articulate acoustic/electric guitars and punchy studio drum kit"],
  [/\bnice\s+piano\b/gi, "expressive felt grand piano with warm room resonance"],
  [/\bbig\s+drums\b/gi, "thunderous cinematic taiko and timpani percussion"],
  [/\bsad\s+strings\b/gi, "melancholic legato cello and weeping chamber violin ensemble"],
];

/**
 * Bilingual Chinese -> Professional English Sonic Concept Dictionary
 */
const CN_CONCEPT_MAP = [
  [/(?:大型活动)?(?:领导登场|嘉宾登场|贵宾入场|高光登场|颁奖盛典|隆重登场)+/g, "triumphant celebratory orchestral entrance fanfare in bright major key, soaring radiant trumpets and French horns, driving joyful snare and timpani crescendo, prestigious gala hall acoustics"],
  [/(?:迎宾|入场仪式|进行曲|庆典)+/g, "dignified symphonic ceremonial march in uplifting major key, majestic brass ensemble, steady celebratory percussion"],
  [/(?:激情|激动|正向|积极|昂扬|奋进|欢庆|自豪)+/g, "passionate, exhilarating, deeply uplifting, pure positive energy, enthusiastic joy, bright triumphant major key, inspiring celebratory momentum"],
  [/(?:史诗|宏大|磅礴|气势|震撼|激昂|超燃|热血|恢弘|大气)+/g, "radiant triumphant symphonic anthem in major key, soaring brass fanfare, crisp driving percussion, powerful celebratory crescendo, high-octane uplifting positive energy"],
  [/(?:国风|古风|仙侠|武侠|东方|中国风|古装)+/g, "grand Oriental cinematic fusion, expressive bamboo flute (Dizi), plucked Guzheng arpeggios, Pipa and Erhu melodies, sweeping symphonic strings"],
  [/(?:禅意|江南|竹林|茶道|古琴|山水)+/g, "serene Oriental Zen acoustic, resonant Guqin zither, gentle Xiao bamboo flute, peaceful minimalist ambiance"],
  [/(?:科技感?|发布会|未来感?|人工智能|数字|创新)+/g, "futuristic tech keynote electronic, plucky analog synth arpeggios, deep sub-bass pulse, crisp minimal percussive groove, glossy wide stereo mix"],
  [/(?:企业|宣传片|阳光|正能量|励志|商务)+/g, "uplifting corporate indie-pop, palm-muted delayed electric guitar harmonics, bright acoustic piano chords, optimistic driving four-on-the-floor beat"],
  [/(?:赛博朋克|科幻|暗黑电音|机甲)+/g, "cyberpunk midtempo industrial electronic, gritty distorted Reese bass, punchy heavy drum hits, dark sci-fi analog synthesizers"],
  [/(?:复古电音|合成器浪潮|夜驾|霓虹)+/g, "1980s retrofuturistic synthwave, pulsing analog Juno bassline, shimmering polyphonic synth leads, gated reverb LinnDrum snare"],
  [/(?:咖啡馆|咖啡厅|看书|学习|专注|工作背景|慵懒|庸懒|放松)+/g, "chillhop lo-fi jazz beats, warm Fender Rhodes electric piano chords, dusty boom-bap drum break, upright bass, subtle analog tape warmth"],
  [/(?:冥想|疗愈|助眠|空灵|自然氛围)+/g, "ethereal ambient healing soundscape, evolving warm analog synth pads, resonant crystal singing bowls, weightless shimmer reverb"],
  [/(?:悬疑|紧张|惊悚|推理|暗黑)+/g, "tense cinematic thriller underscore, low rumbling contrabass drone, staccato string ostinato, pulsing sub-bass heartbeat"],
  [/(?:抒情|感人|催泪|温柔|治愈|唯美|伤感|悲伤)+/g, "intimate neoclassical emotional score, delicate felt piano, expressive solo cello, swelling warm chamber strings"],
  [/(?:摇滚|运动|竞技|冲刺|体育)+/g, "high-energy stadium arena rock, overdriven tube-amp electric guitar riffs, thunderous live acoustic drum kit, driving bassline"],
  [/(?:后摇|星空|情绪递进)+/g, "atmospheric cinematic post-rock, tremolo-picked electric guitars with cathedral delay, building into a massive wall-of-sound crescendo"],
  [/(?:爵士|酒廊|波萨诺瓦|午后)+/g, "sophisticated Bossa Nova jazz lounge, syncopated nylon-string guitar, warm breathy tenor saxophone, upright double bass, gentle brush drums"],
  [/(?:放克|迪斯科|复古派对|律动|欢快|动感)+/g, "1970s Nu-Disco Funk, slap electric bassline, rhythmic wah-wah guitar chops, tight brass section stabs, infectious dance groove"],
  [/(?:民谣|木吉他|校园|叙事)+/g, "intimate indie folk, fingerpicked acoustic guitars, soft brush snare, warm upright bass, organic acoustic room warmth"],
  [/(?:游戏战斗|BOSS战|战斗音乐)+/g, "fast-paced JRPG battle theme, virtuosic solo violin and soaring brass, driving double-kick rock drums, energetic arpeggiated synths"],
  [/(?:游戏城镇|新手村|日常探索|休闲游戏)+/g, "charming fantasy RPG town theme, playful flute and oboe woodwinds, acoustic lute and pizzicato strings, light hand percussion"],
  [/(?:纯音乐|背景音乐|配乐|伴奏|音乐|歌曲)+/g, ""],
];

/**
 * 9 Major Categories / 24 Community-Validated Professional Presets
 * Following Production Music Library standards (Cinematic, Ceremony, Corporate/Tech, Electronic,
 * Lo-Fi/Ambient, Pop/R&B, Rock, Jazz/Funk, World/Guofeng/Game).
 */
export const PRESETS = {
  // --- 1. Ceremony, Gala & Broadcast (大型盛典、礼仪、发布会登场与广播) ---
  "entrance-jubilant": {
    category: "Ceremony & Gala",
    title: "高光激情盛典 / 阳光正向登场 (Joyous Triumphant Entrance)",
    bpm: 126,
    instrumental: true,
    genre: "Uplifting celebratory symphonic fanfare in bright major key",
    mood: "passionate, exhilarating, jubilant, deeply inspiring, pure positive energy, enthusiastic, celebratory triumph, radiant warmth, absolutely no dark or melancholy tones",
    instruments: "radiant heraldic trumpets in bright high register, soaring French horns, shimmering orchestral glockenspiel and chimes, uplifting violin section in major harmonies, crisp celebratory military snare rolls, resonant joyous timpani and bright crash cymbals",
    rhythm: "driving energetic uplifting march rhythm with buoyant celebratory forward momentum",
    production: "sparkling radiant grand hall acoustics, glorious warm air, punchy clear dynamic mix, uplifting festival atmosphere",
  },
  "entrance-epic": {
    category: "Ceremony & Gala",
    title: "高光激昂登场 / 盛典巅峰 (Epic Triumphant Entrance)",
    bpm: 128,
    instrumental: true,
    genre: "Uplifting triumphant ceremonial orchestral anthem in radiant major key",
    mood: "thrilling, electrifying, victorious, enthusiastic, celebratory, bright optimistic energy, majestic peak stadium excitement, positive and heroic",
    instruments: "soaring heraldic trumpets and triumphant French horn fanfare, uplifting melodic string orchestra, driving crisp snare rolls, thunderous joyful timpani crescendo, sparkling chimes and bright crash cymbals",
    rhythm: "driving energetic ceremonial march beat with celebratory percussive builds",
    production: "wide grand gala concert hall acoustics, bright shimmering highs, punchy low-end impact, glorious major key mastering",
  },
  "entrance-grand": {
    category: "Ceremony & Gala",
    title: "庄重国宾迎宾 / 盛典进行曲 (Dignified Ceremonial March)",
    bpm: 116,
    instrumental: true,
    genre: "Grand symphonic ceremonial march",
    mood: "dignified, prestigious, confident, solemn yet uplifting",
    instruments: "noble brass ensemble, rich symphonic string harmonies, steady military snare cadence, resonant concert bass drum and timpani",
    rhythm: "steady measured ceremonial walking pace",
    production: "spacious symphony hall reverb, balanced orchestral stereo stage",
  },
  "award-glory": {
    category: "Ceremony & Gala",
    title: "荣耀颁奖时刻 / 冠军礼赞 (Triumphant Award Glory)",
    bpm: 124,
    instrumental: true,
    genre: "Inspirational symphonic victory theme",
    mood: "euphoric, glorious, emotional, celebratory",
    instruments: "soaring French horns, shimmering harp glissandos, lush full string section, orchestral chimes and uplifting percussion",
    rhythm: "flowing anthemic pulse with triumphant rhythmic accents",
    production: "lush cinematic scoring stage mix, glossy high-end sparkle",
  },
  "broadcast-news": {
    category: "Ceremony & Gala",
    title: "权威新闻片头 / 资讯开篇 (Broadcast News Opener)",
    bpm: 125,
    instrumental: true,
    genre: "Modern broadcast news and media theme",
    mood: "authoritative, urgent, dynamic, professional",
    instruments: "staccato orchestral strings, bold brass stabs, pulsing arpeggiated modular synth bed, crisp hybrid electronic percussion",
    rhythm: "tight driving 16th-note pulse with clean transitions",
    production: "punchy broadcast-standard compression, crystal-clear stereo separation",
  },

  // --- 2. Cinematic & Orchestral (影视配乐与交响史诗) ---
  "cinematic-epic": {
    category: "Cinematic & Orchestral",
    title: "史诗大片预告 / 宏大交响 (Hybrid Orchestral Trailer)",
    bpm: 130,
    instrumental: true,
    genre: "Hybrid orchestral blockbuster trailer score",
    mood: "heroic, monumental, intense, awe-inspiring",
    instruments: "low brass braaams, staccato string ostinato, massive taiko and anvil percussion, soaring epic choir pads, sub-bass drops",
    rhythm: "relentless building momentum leading to a massive climactic drop",
    production: "wide IMAX cinematic soundstage, heavy dynamic contrast",
  },
  "cinematic-emotional": {
    category: "Cinematic & Orchestral",
    title: "细腻情感叙事 / 新古典弦乐 (Intimate Neoclassical Score)",
    bpm: 76,
    instrumental: true,
    genre: "Intimate neoclassical film score",
    mood: "poignant, heartfelt, reflective, tenderly hopeful",
    instruments: "close-miked felt grand piano, expressive solo cello melody, swelling warm chamber strings, delicate harp harmonics",
    rhythm: "gentle rubato breathing pace with gradual emotional swell",
    production: "natural wooden scoring room acoustics, warm intimate proximity",
  },
  "cinematic-tension": {
    category: "Cinematic & Orchestral",
    title: "悬疑张力暗涌 / 科幻惊悚 (Dark Suspense Underscore)",
    bpm: 110,
    instrumental: true,
    genre: "Dark cinematic thriller and suspense underscore",
    mood: "tense, mysterious, ominous, suspenseful",
    instruments: "low rumbling contrabass drone, col legno string ticks, sub-bass heartbeat pulse, eerie metallic waterphone textures",
    rhythm: "creeping hypnotic pulse with unpredictable percussive accents",
    production: "deep subterranean reverb, pristine dark low-end clarity",
  },

  // --- 3. Corporate, Tech & Commercial (科技发布会与企业商业) ---
  "keynote-tech": {
    category: "Corporate & Tech",
    title: "科技峰会发布 / 未来感暖场 (Futuristic Tech Keynote)",
    bpm: 122,
    instrumental: true,
    genre: "Futuristic minimal electronic tech soundtrack",
    mood: "innovative, forward-thinking, sleek, inspiring",
    instruments: "plucky analog Prophet synth arpeggios, warm sub-bass, glass marimba mallets, crisp minimal micro-percussion",
    rhythm: "clean propulsive four-on-the-floor groove",
    production: "ultra-clean modern digital mix, wide holographic stereo imaging",
  },
  "corporate-uplifting": {
    category: "Corporate & Tech",
    title: "企业阳光励志 / 品牌形象片 (Uplifting Corporate Pop)",
    bpm: 118,
    instrumental: true,
    genre: "Uplifting corporate indie-pop",
    mood: "optimistic, motivating, confident, bright",
    instruments: "palm-muted delayed electric guitar harmonics, bright acoustic piano chords, warm bass guitar, crisp upbeat studio drums and handclaps",
    rhythm: "steady driving upbeat groove",
    production: "polished commercial studio mix, bright and airy top-end",
  },

  // --- 4. Electronic, Synth & Club (电子音乐与俱乐部律动) ---
  "synthwave-retro": {
    category: "Electronic & Club",
    title: "80年代复古合成器 / 霓虹夜驾 (1980s Retro Synthwave)",
    bpm: 118,
    instrumental: false,
    genre: "1980s retrofuturistic Outrun synthwave",
    mood: "nostalgic, nocturnal, energetic, cinematic",
    instruments: "pulsing 16th-note analog Juno bassline, shimmering polyphonic Oberheim synth leads, punchy LinnDrum with gated reverb snare",
    rhythm: "driving midnight highway cruise beat",
    production: "warm analog tape saturation, lush 80s chorus and stadium reverb",
  },
  "house-melodic": {
    category: "Electronic & Club",
    title: "深邃旋律浩室 / 时尚秀场 (Melodic Progressive House)",
    bpm: 124,
    instrumental: true,
    genre: "Deep melodic progressive house",
    mood: "hypnotic, euphoric, sophisticated, immersive",
    instruments: "rolling warm Moog bassline, evolving atmospheric pad swells, plucky melodic synth hook, crisp off-beat hi-hats and shakers",
    rhythm: "tight four-on-the-floor club groove",
    production: "pumping sidechain compression, deep club-ready sub-bass mastering",
  },
  "cyberpunk-bass": {
    category: "Electronic & Club",
    title: "赛博朋克重低音 / 工业电音 (Cyberpunk Midtempo Bass)",
    bpm: 105,
    instrumental: true,
    genre: "Aggressive cyberpunk midtempo industrial bass",
    mood: "dystopian, gritty, high-octane, rebellious",
    instruments: "heavily distorted Reese bass, metallic industrial drum slams, dark sci-fi brassy synth stabs, glitchy cybernetic SFX",
    rhythm: "heavy stomping half-time industrial groove",
    production: "aggressive saturation, razor-sharp transient punch",
  },

  // --- 5. Lo-Fi, Chill & Ambient (伴学放松与自然冥想) ---
  "lofi-study": {
    category: "Lo-Fi & Ambient",
    title: "温暖爵士伴学 / 咖啡馆 (Chillhop Lo-Fi Study Beats)",
    bpm: 82,
    instrumental: true,
    genre: "Chillhop lo-fi jazz hip-hop",
    mood: "cozy, nostalgic, relaxed, introspective",
    instruments: "warm Fender Rhodes electric piano playing jazz 7th chords, mellow nylon guitar, upright acoustic bass, dusty boom-bap vinyl drum break",
    rhythm: "laid-back swung J-Dilla style pocket beat",
    production: "vintage SP-404 tape saturation, subtle vinyl crackle, warm rolled-off highs",
  },
  "ambient-healing": {
    category: "Lo-Fi & Ambient",
    title: "空灵颂钵冥想 / 自然疗愈 (Ethereal Ambient Meditation)",
    bpm: 64,
    instrumental: true,
    genre: "Ethereal ambient meditation soundscape",
    mood: "serene, weightless, peaceful, transcendent",
    instruments: "evolving warm analog synth drones, resonant Tibetan singing bowls, gentle wind chimes, soft felted piano notes",
    rhythm: "slow free-flowing beatless breathing pace",
    production: "infinite cathedral shimmer reverb, ultra-wide immersive spatial audio",
  },

  // --- 6. Pop, Indie & R&B (流行、独立民谣与节奏布鲁斯) ---
  "pop-anthemic": {
    category: "Pop, Indie & R&B",
    title: "现代流行主打 / 电台热单 (Modern Glossy Synth-Pop)",
    bpm: 120,
    instrumental: false,
    genre: "Modern glossy chart-topping synth-pop",
    mood: "upbeat, infectious, vibrant, feel-good",
    instruments: "punchy synth bass, rhythmic funky mute guitar strums, bright layered synth chords, tight electronic pop drums",
    rhythm: "danceable upbeat pop groove with explosive chorus drop",
    production: "glossy modern Top-40 pop mix, crisp vocal presence",
  },
  "indie-folk": {
    category: "Pop, Indie & R&B",
    title: "温暖木吉他民谣 / 独立叙事 (Intimate Indie Folk)",
    bpm: 92,
    instrumental: false,
    genre: "Intimate acoustic indie folk-pop",
    mood: "warm, nostalgic, honest, wanderlust",
    instruments: "fingerpicked steel-string acoustic guitar, soft brush snare drum, warm upright bass, subtle harmonium and cello backing",
    rhythm: "gentle swaying acoustic rhythm",
    production: "organic live-in-studio analog warmth, natural room reverb",
  },
  "rnb-neosoul": {
    category: "Pop, Indie & R&B",
    title: "丝滑复古律动 / 当代 R&B (Smooth Neo-Soul R&B)",
    bpm: 88,
    instrumental: false,
    genre: "Contemporary Neo-Soul and late-night R&B",
    mood: "sultry, smooth, intimate, velvet nocturnal vibe",
    instruments: "lush Wurlitzer electric piano extended chords, melodic fretless bassline, clean jazz guitar fills, crisp rimshot pocket drums",
    rhythm: "deep laid-back neo-soul pocket groove",
    production: "warm analog console saturation, silky low-end warmth",
  },

  // --- 7. Rock & Post-Rock (摇滚、竞技运动与史诗后摇) ---
  "rock-stadium": {
    category: "Rock & Post-Rock",
    title: "体育场高燃摇滚 / 竞技运动 (Stadium Arena Rock)",
    bpm: 132,
    instrumental: true,
    genre: "High-energy stadium arena rock",
    mood: "fierce, adrenaline-fueled, unstoppable, anthemic",
    instruments: "crunchy overdriven Marshall tube-amp electric guitars, driving pick bass, thunderous live acoustic drum kit with stomping kick and claps",
    rhythm: "powerful driving rock beat with energetic drum fills",
    production: "massive arena rock mix, wide double-tracked guitar wall",
  },
  "post-rock-epic": {
    category: "Rock & Post-Rock",
    title: "星河情绪后摇 / 音墙爆发 (Cinematic Post-Rock Crescendo)",
    bpm: 112,
    instrumental: true,
    genre: "Atmospheric cinematic post-rock",
    mood: "cathartic, expansive, emotional, transcendent",
    instruments: "clean delayed electric guitar arpeggios, tremolo-picked soaring lead guitar, driving bass, dynamic acoustic drums, lush string swells",
    rhythm: "gradual dynamic build from delicate whisper to a massive wall-of-sound climax",
    production: "cathedral reverb and tape delay, wide dynamic range",
  },

  // --- 8. Jazz, Funk & Lounge (爵士、波萨诺瓦与复古放克) ---
  "jazz-bossa": {
    category: "Jazz & Funk",
    title: "波萨诺瓦爵士 / 高级酒廊 (Bossa Nova Jazz Lounge)",
    bpm: 110,
    instrumental: true,
    genre: "Authentic Brazilian Bossa Nova jazz",
    mood: "sophisticated, breezy, sunny, relaxed",
    instruments: "syncopated nylon-string classical guitar, breathy Stan Getz-style tenor saxophone, acoustic double bass, gentle brush snare and shaker",
    rhythm: "classic syncopated bossa nova clave groove",
    production: "warm 1960s Blue Note analog studio acoustics, natural stereo separation",
  },
  "funk-disco": {
    category: "Jazz & Funk",
    title: "复古放克迪斯科 / 动感派对 (1970s Nu-Disco Funk)",
    bpm: 116,
    instrumental: true,
    genre: "1970s Nu-Disco and classic Funk",
    mood: "groovy, joyful, flamboyant, infectious",
    instruments: "virtuosic slap electric bass, rhythmic wah-wah rhythm guitar chops, clavinet, tight punchy horn section (trumpet, sax, trombone), disco strings",
    rhythm: "syncopated 16th-note funk pocket groove",
    production: "warm vintage analog tape mix, tight punchy drum transients",
  },

  // --- 9. World, Guofeng & Game BGM (东方国风与游戏循环配乐) ---
  "guofeng-epic": {
    category: "World, Guofeng & Game",
    title: "大气国风交响 / 仙侠史诗 (Grand Oriental Guofeng Orchestral)",
    bpm: 108,
    instrumental: true,
    genre: "Grand Oriental Guofeng cinematic orchestral fusion",
    mood: "majestic, poetic, chivalrous, sweeping epic",
    instruments: "expressive Dizi bamboo flute, cascading Guzheng zither arpeggios, dramatic Pipa strums, passionate Erhu lead, backed by full symphonic strings and Chinese Tanggu war drums",
    rhythm: "flowing heroic rhythm with powerful percussive accents",
    production: "panoramic cinematic soundstage blending traditional Chinese instruments with orchestra",
  },
  "guofeng-zen": {
    category: "World, Guofeng & Game",
    title: "东方禅意山水 / 古琴竹笛 (Oriental Zen Guqin & Xiao)",
    bpm: 72,
    instrumental: true,
    genre: "Traditional Chinese Zen acoustic chamber music",
    mood: "tranquil, meditative, misty, scholarly elegance",
    instruments: "deep resonant Guqin seven-string zither, breathy vertical Xiao bamboo flute, delicate Guzheng harmonics, subtle temple bell",
    rhythm: "spacious contemplative pacing with natural pauses",
    production: "pure acoustic room resonance, organic ink-wash aesthetic",
  },
  "game-battle": {
    category: "World, Guofeng & Game",
    title: "高燃游戏战斗 / BOSS战循环 (JRPG Boss Battle Theme)",
    bpm: 145,
    instrumental: true,
    genre: "Symphonic rock JRPG boss battle soundtrack",
    mood: "intense, urgent, heroic, thrilling",
    instruments: "virtuosic solo violin and shred electric guitar trading leads, soaring brass fanfare, rapid harpsichord and synth arpeggios, double-kick rock drums",
    rhythm: "fast relentless 145 BPM battle pace designed for seamless looping",
    production: "tight high-impact game audio mix, clear melodic separation",
  },
  "game-town": {
    category: "World, Guofeng & Game",
    title: "奇幻游戏城镇 / 日常探索循环 (Fantasy RPG Town BGM)",
    bpm: 104,
    instrumental: true,
    genre: "Charming fantasy RPG town and exploration soundtrack",
    mood: "welcoming, whimsical, peaceful, nostalgic",
    instruments: "playful concert flute and oboe melody, plucked acoustic lute and Celtic harp, light pizzicato strings, tambourine and frame drum",
    rhythm: "breezy walking-pace waltz/march groove ideal for background looping",
    production: "warm acoustic chamber mix, crystal clear instrumental timbres",
  },
};

/**
 * Clean banned/anti-pattern keywords and upgrade vague descriptors.
 */
export function sanitizeMusicPrompt(raw = "") {
  let s = String(raw || "").trim();
  for (const re of BANNED_MUSIC_KEYWORDS) s = s.replace(re, "");
  for (const [re, rep] of VAGUE_UPGRADES) s = s.replace(re, rep);
  for (const [re, en] of CN_CONCEPT_MAP) {
    if (re.test(s)) s = s.replace(re, en ? `, ${en}, ` : " ");
  }
  const phrases = s.split(",").map((x) => x.trim()).filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const p of phrases) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(p);
    }
  }
  return deduped.join(", ").replace(/\s+/g, " ").replace(/^[,.\s]+|[,.\s]+$/g, "");
}

/**
 * Detect which of the 6 sonic components are already present in a user prompt.
 */
export function analyzePromptComponents(prompt = "") {
  const p = prompt.toLowerCase();
  return {
    hasGenre: /\b(orchestral|symphon|cinematic|pop|rock|jazz|bossa|funk|disco|house|techno|synthwave|cyberpunk|lofi|lo-fi|chillhop|ambient|folk|r&b|neo-soul|trap|hip-hop|march|fanfare|anthem|score|guofeng|oriental|jrpg)\b/.test(p),
    hasMood: /\b(epic|triumphant|majestic|heroic|dignified|uplifting|emotional|melanchol|tense|suspense|cozy|relaxed|serene|nostalgic|euphoric|dark|gritty|energetic|thrilling|warm|intimate|joyful|peaceful)\b/.test(p),
    hasInstruments: /\b(piano|rhodes|wurlitzer|guitar|violin|cello|strings|brass|trumpet|horn|trombone|flute|dizi|xiao|guzheng|guqin|pipa|erhu|sax|synth|808|bass|drums|snare|timpani|taiko|percussion|harp|lute|bowls)\b/.test(p),
    hasRhythm: /\b(\d+\s*bpm|groove|beat|rhythm|pace|tempo|pulse|cadence|march|swung|ostinato|four-on-the-floor|rubato)\b/.test(p),
    hasProduction: /\b(reverb|mix|master|analog|tape|stereo|acoustics|hall|room|saturation|sidechain|soundstage|compression|lofi|clean|glossy|punchy)\b/.test(p),
  };
}

/**
 * Infer default sonic supplements based on detected style cues when user enables --expand.
 */
function inferStyleSupplements(p) {
  const low = p.toLowerCase();
  if (/orchestra|brass|fanfare|march|epic|ceremon|triumph|gala|summit|leader|horn|timpani|taiko/.test(low)) {
    return {
      genre: "Grand cinematic orchestral score",
      mood: "triumphant, majestic, and uplifting",
      instruments: "soaring brass fanfare, sweeping symphonic strings, thunderous timpani and ceremonial percussion",
      rhythm: "driving steady ceremonial rhythm",
      production: "wide concert hall acoustics, punchy dynamic mastering",
      defaultBpm: 124,
    };
  }
  if (/lofi|lo-fi|chill|study|cafe|coffee|rhodes|cozy/.test(low)) {
    return {
      genre: "Chillhop lo-fi jazz beats",
      mood: "cozy, warm, and nostalgic",
      instruments: "warm Fender Rhodes electric piano, mellow acoustic guitar, upright bass, dusty boom-bap drum break",
      rhythm: "laid-back swung pocket groove",
      production: "warm analog tape saturation, subtle vinyl texture",
      defaultBpm: 82,
    };
  }
  if (/synth|cyber|tech|electro|house|club|neon|80s|future/.test(low)) {
    return {
      genre: "Modern electronic synth soundtrack",
      mood: "energetic, sleek, and immersive",
      instruments: "pulsing analog synth bass, shimmering polyphonic leads, crisp electronic drum machine",
      rhythm: "driving propulsive four-on-the-floor groove",
      production: "glossy wide stereo mix, punchy low-end clarity",
      defaultBpm: 122,
    };
  }
  if (/dizi|guzheng|guqin|oriental|chinese|guofeng|zen|bamboo/.test(low)) {
    return {
      genre: "Oriental Guofeng cinematic fusion",
      mood: "poetic, majestic, and expressive",
      instruments: "expressive bamboo flute (Dizi), cascading Guzheng zither, sweeping orchestral strings, resonant percussion",
      rhythm: "flowing melodic pacing",
      production: "spacious panoramic acoustic soundstage",
      defaultBpm: 100,
    };
  }
  if (/rock|metal|guitar|stadium|sport|battle/.test(low)) {
    return {
      genre: "High-energy arena rock",
      mood: "adrenaline-fueled, fierce, and anthemic",
      instruments: "overdriven tube-amp electric guitars, driving bassline, punchy live acoustic drum kit",
      rhythm: "powerful driving rock beat",
      production: "wide double-tracked studio rock mix",
      defaultBpm: 130,
    };
  }
  return {
    genre: "Contemporary studio instrumental production",
    mood: "evocative, balanced, and expressive",
    instruments: "articulate lead melody, rich harmonic backing, dynamic rhythm section",
    rhythm: "steady cohesive groove",
    production: "warm analog-style studio mix, clear stereo separation",
    defaultBpm: 112,
  };
}

/**
 * Apply preset and/or 6-Component Formula expansion to build a professional music prompt.
 *
 * @param {object} options
 * @param {string} [options.prompt] - User's raw sound prompt
 * @param {string} [options.preset] - Preset key from PRESETS
 * @param {boolean} [options.expand] - Whether to run the 6-Component Formula expander
 * @param {number|string} [options.bpm] - Explicit BPM override
 * @param {boolean} [options.instrumental] - Explicit instrumental flag
 * @param {number|string} [options.loop] - If looping is requested, inject seamless loop cues
 * @returns {{ prompt: string, bpm?: number, instrumental?: boolean, presetUsed?: object }}
 */
export function buildProfessionalPrompt({ prompt = "", preset, expand = false, bpm, instrumental, loop } = {}) {
  let cleaned = sanitizeMusicPrompt(prompt);
  let presetObj = null;

  if (preset) {
    presetObj = PRESETS[preset];
    if (!presetObj) {
      const available = Object.keys(PRESETS).join(", ");
      throw new Error(`Unknown preset "${preset}". Run \`flowmusic presets\` to view all (${available})`);
    }
  }

  let finalParts = [];
  let resolvedBpm = bpm != null ? Number(bpm) : presetObj?.bpm;
  let resolvedInstrumental = instrumental != null ? Boolean(instrumental) : presetObj?.instrumental;

  if (presetObj) {
    // Lead with Preset Genre Anchor -> User custom specifics -> Preset Mood & Instruments & Rhythm & Production
    finalParts.push(presetObj.genre);
    if (cleaned) finalParts.push(cleaned);
    finalParts.push(presetObj.mood);
    finalParts.push(presetObj.instruments);
    finalParts.push(presetObj.rhythm);
    finalParts.push(presetObj.production);
  } else if (expand && cleaned) {
    const comp = analyzePromptComponents(cleaned);
    const sup = inferStyleSupplements(cleaned);
    if (!comp.hasGenre) finalParts.push(sup.genre);
    finalParts.push(cleaned);
    if (!comp.hasMood) finalParts.push(sup.mood);
    if (!comp.hasInstruments) finalParts.push(sup.instruments);
    if (!comp.hasRhythm) finalParts.push(sup.rhythm);
    if (!comp.hasProduction) finalParts.push(sup.production);
    if (!resolvedBpm && !comp.hasRhythm) resolvedBpm = sup.defaultBpm;
  } else {
    finalParts.push(cleaned);
  }

  if (loop) {
    finalParts.push("consistent tempo and steady energy throughout for seamless looping");
  }

  const joined = finalParts.filter(Boolean).join(", ").replace(/\s*,\s*,+/g, ", ").trim();
  return {
    prompt: joined,
    bpm: resolvedBpm,
    instrumental: resolvedInstrumental,
    presetUsed: presetObj ? { name: preset, ...presetObj } : null,
  };
}

/**
 * Format presets table for CLI output.
 */
export function formatPresetsList(categoryFilter = "") {
  const lines = [];
  const entries = Object.entries(PRESETS).filter(([, v]) =>
    !categoryFilter || v.category.toLowerCase().includes(categoryFilter.toLowerCase())
  );
  let currentCat = "";
  for (const [key, p] of entries) {
    if (p.category !== currentCat) {
      currentCat = p.category;
      lines.push(`\n[${currentCat}]`);
    }
    lines.push(`  ${key.padEnd(20)} ${String(p.bpm + " BPM").padEnd(9)} ${p.title}`);
    lines.push(`    └─ ${p.genre}; ${p.instruments}`);
  }
  return lines.join("\n").trim();
}
