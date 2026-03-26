// lib/leaders.js
// ─── LEADER IMAGE MAPPING ───────────────────────────────────────────────────
// Maps leader names to BBG portrait image URLs.
// Images hosted at civ6bbg.github.io, naming: "{Civ} {Leader}.webp"

const BBG_IMAGE_BASE = "https://civ6bbg.github.io/images/leaders/";

const LEADER_CIV_MAP = {
  "Abraham Lincoln": "America", "Teddy Roosevelt (Bull Moose)": "America",
  "Teddy Roosevelt (Rough Rider)": "America", "Saladin (Vizier)": "Arabia",
  "Saladin (Sultan)": "Arabia", "John Curtin": "Australia", "Montezuma": "Aztec",
  "Hammurabi": "Babylon", "Pedro II": "Brazil", "Basil II": "Byzantium",
  "Theodora": "Byzantium", "Wilfrid Laurier": "Canada",
  "Kublai Khan (China)": "China", "Qin Shi Huang (Mandate of Heaven)": "China",
  "Qin Shi Huang (Unifier)": "China", "Wu Zetian": "China", "Yongle": "China",
  "Poundmaker": "Cree", "Cleopatra (Egyptian)": "Egypt",
  "Cleopatra (Ptolemaic)": "Egypt", "Ramses II": "Egypt",
  "Eleanor of Aquitaine (England)": "England", "Elizabeth I": "England",
  "Victoria (Age of Empire)": "England", "Victoria (Age of Steam)": "England",
  "Menelik II": "Ethiopia", "Catherine de Medici (Black Queen)": "France",
  "Catherine de Medici (Magnificence)": "France",
  "Eleanor of Aquitaine (France)": "France", "Ambiorix": "Gaul",
  "Vercingetorix": "Gaul", "Tamar": "Georgia", "Frederick Barbarossa": "Germany",
  "Ludwig II": "Germany", "Simón Bolívar": "Gran Colombia", "Gorgo": "Greece",
  "Pericles": "Greece", "Matthias Corvinus": "Hungary", "Pachacuti": "Inca",
  "Chandragupta": "India", "Gandhi": "India", "Gitarja": "Indonesia",
  "Hojo Tokimune": "Japan", "Tokugawa": "Japan", "Jayavarman VII": "Khmer",
  "Mvemba a Nzinga": "Kongo", "Nzinga Mbande": "Kongo", "Sejong": "Korea",
  "Seondeok": "Korea", "Alexander": "Macedon", "Olympias": "Macedon",
  "Mansa Musa": "Mali", "Sundiata Keita": "Mali", "Kupe": "Māori",
  "Lautaro": "Mapuche", "Lady Six Sky": "Maya", "Te' K'inich II": "Maya",
  "Genghis Khan": "Mongolia", "Kublai Khan (Mongolia)": "Mongolia",
  "Wilhelmina": "Netherlands", "Harald Hardrada (Varangian)": "Norway",
  "Harald Hardrada (Konge)": "Norway", "Amanitore": "Nubia",
  "Suleiman (Kanuni)": "Ottomans", "Suleiman (Muhteşem)": "Ottomans",
  "Cyrus": "Persia", "Nader Shah": "Persia", "Dido": "Phoenicia",
  "Ahiram": "Phoenicia", "Jadwiga": "Poland", "João III": "Portugal",
  "Julius Caesar": "Rome", "Trajan": "Rome", "Peter": "Russia",
  "Robert the Bruce": "Scotland", "Tomyris": "Scythia", "Philip II": "Spain",
  "Gilgamesh": "Sumeria", "Al-Hasan ibn Sulaiman": "Swahili",
  "Kristina": "Sweden", "Spearthrower Owl": "Teotihuacán", "Kiviuq": "Thule",
  "Trisong Detsen": "Tibet", "Bà Triệu": "Vietnam", "Shaka": "Zulu",
};

// BBG uses slightly different names for some leaders in image filenames
const BBG_NAME_MAP = {
  "Qin Shi Huang (Mandate of Heaven)": "Qin (Mandate of Heaven)",
  "Qin Shi Huang (Unifier)": "Qin (Unifier)",
};

export function getLeaderImageUrl(leaderName) {
  if (!leaderName) return null;
  const civ = LEADER_CIV_MAP[leaderName];
  if (!civ) return null;
  const bbgName = BBG_NAME_MAP[leaderName] || leaderName;
  return `${BBG_IMAGE_BASE}${encodeURIComponent(`${civ} ${bbgName}`)}.webp`;
}

export function getLeaderCiv(leaderName) {
  return LEADER_CIV_MAP[leaderName] || null;
}
