// Spiritu -- Gloria Dei Technologies -- v2.0
import { useState, useEffect, useRef, createContext, useContext } from "react";

// API calls routed through /api/anthropic serverless function

// ═══════════════════════════════════════════════════════════
// FONT SCALE CONTEXT
// ═══════════════════════════════════════════════════════════
const FontCtx = createContext(1);
const useFS = () => useContext(FontCtx);

// ═══════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════

function getEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}

function sod(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dEq(a, b) {
  return sod(a).getTime() === sod(b).getTime();
}

function getAdvent1(year) {
  const xmas = new Date(year, 11, 25);
  const wd = xmas.getDay(); // 0=Sun
  const daysBack = wd === 0 ? 28 : wd + 21;
  return addDays(xmas, -daysBack);
}

// ═══════════════════════════════════════════════════════════
// NOVUS ORDO CALENDAR (1970 General Roman Calendar)
// ═══════════════════════════════════════════════════════════

const NO_FIXED = {
  "1-1":  { name: "Mary, Mother of God", rank: "solemnity", color: "white" },
  "1-6":  { name: "Epiphany of the Lord", rank: "solemnity", color: "white" },
  "1-17": { name: "St. Anthony of Egypt", rank: "memorial", color: "white" },
  "1-21": { name: "St. Agnes", rank: "memorial", color: "red" },
  "1-25": { name: "Conversion of St. Paul", rank: "feast", color: "white" },
  "1-28": { name: "St. Thomas Aquinas", rank: "memorial", color: "white" },
  "2-2":  { name: "Presentation of the Lord", rank: "feast", color: "white" },
  "2-22": { name: "Chair of St. Peter", rank: "feast", color: "white" },
  "3-19": { name: "St. Joseph, Spouse of the Virgin Mary", rank: "solemnity", color: "white" },
  "3-25": { name: "Annunciation of the Lord", rank: "solemnity", color: "white" },
  "4-25": { name: "St. Mark the Evangelist", rank: "feast", color: "red" },
  "4-29": { name: "St. Catherine of Siena", rank: "feast", color: "white" },
  "5-3":  { name: "Sts. Philip and James", rank: "feast", color: "red" },
  "5-31": { name: "Visitation of the Virgin Mary", rank: "feast", color: "white" },
  "6-11": { name: "St. Barnabas", rank: "memorial", color: "red" },
  "6-13": { name: "St. Anthony of Padua", rank: "memorial", color: "white" },
  "6-24": { name: "Birth of St. John the Baptist", rank: "solemnity", color: "white" },
  "6-29": { name: "Sts. Peter and Paul", rank: "solemnity", color: "red" },
  "7-3":  { name: "St. Thomas the Apostle", rank: "feast", color: "red" },
  "7-11": { name: "St. Benedict", rank: "memorial", color: "white" },
  "7-21": { name: "St. Lawrence of Brindisi, Priest and Doctor", rank: "memorial", color: "white" },
  "7-22": { name: "St. Mary Magdalene", rank: "feast", color: "white" },
  "7-25": { name: "St. James the Apostle", rank: "feast", color: "red" },
  "7-26": { name: "Sts. Joachim and Anne", rank: "memorial", color: "white" },
  "8-6":  { name: "Transfiguration of the Lord", rank: "feast", color: "white" },
  "8-10": { name: "St. Lawrence", rank: "feast", color: "red" },
  "8-15": { name: "Assumption of the Virgin Mary", rank: "solemnity", color: "white" },
  "8-22": { name: "Queenship of the Virgin Mary", rank: "memorial", color: "white" },
  "8-24": { name: "St. Bartholomew the Apostle", rank: "feast", color: "red" },
  "8-28": { name: "St. Augustine of Hippo", rank: "memorial", color: "white" },
  "8-29": { name: "Martyrdom of St. John the Baptist", rank: "memorial", color: "red" },
  "9-8":  { name: "Birth of the Virgin Mary", rank: "feast", color: "white" },
  "9-14": { name: "Exaltation of the Holy Cross", rank: "feast", color: "red" },
  "9-15": { name: "Our Lady of Sorrows", rank: "memorial", color: "white" },
  "9-21": { name: "St. Matthew the Apostle", rank: "feast", color: "red" },
  "9-29": { name: "Sts. Michael, Gabriel & Raphael", rank: "feast", color: "white" },
  "9-30": { name: "St. Jerome", rank: "memorial", color: "white" },
  "10-1": { name: "St. Thérèse of Lisieux", rank: "memorial", color: "white" },
  "10-2": { name: "Guardian Angels", rank: "memorial", color: "white" },
  "10-4": { name: "St. Francis of Assisi", rank: "memorial", color: "white" },
  "10-7": { name: "Our Lady of the Rosary", rank: "memorial", color: "white" },
  "10-15":{ name: "St. Teresa of Ávila", rank: "memorial", color: "white" },
  "10-18":{ name: "St. Luke the Evangelist", rank: "feast", color: "red" },
  "10-28":{ name: "Sts. Simon and Jude", rank: "feast", color: "red" },
  "11-1": { name: "All Saints", rank: "solemnity", color: "white" },
  "11-2": { name: "All Souls", rank: "commemoration", color: "black" },
  "11-9": { name: "Dedication of the Lateran Basilica", rank: "feast", color: "white" },
  "11-21":{ name: "Presentation of the Virgin Mary", rank: "memorial", color: "white" },
  "11-22":{ name: "St. Cecilia", rank: "memorial", color: "red" },
  "11-30":{ name: "St. Andrew the Apostle", rank: "feast", color: "red" },
  "12-3": { name: "St. Francis Xavier", rank: "memorial", color: "white" },
  "12-8": { name: "Immaculate Conception", rank: "solemnity", color: "white" },
  "12-12":{ name: "Our Lady of Guadalupe", rank: "feast", color: "white" },
  "12-13":{ name: "St. Lucy", rank: "memorial", color: "red" },
  "12-25":{ name: "Nativity of the Lord (Christmas)", rank: "solemnity", color: "white" },
  "12-26":{ name: "St. Stephen, First Martyr", rank: "feast", color: "red" },
  "12-27":{ name: "St. John the Apostle", rank: "feast", color: "white" },
  "12-28":{ name: "Holy Innocents", rank: "feast", color: "red" },
};

function getLiturgicalDayNO(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const d = sod(date);

  const easter = getEaster(year);
  const ashWed = addDays(easter, -46);
  const palmSun = addDays(easter, -7);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 49);
  const trinity = addDays(easter, 56);
  const corpus = addDays(easter, 60);
  const advent1 = getAdvent1(year);
  const advent1Next = getAdvent1(year + 1);
  const christmas = new Date(year, 11, 25);

  // Moveable solemnities
  if (dEq(d, easter))              return { name: "Easter Sunday", rank: "solemnity", color: "white", season: "Easter", rankLabel: "Solemnity" };
  if (dEq(d, addDays(easter, 1))) return { name: "Easter Monday", rank: "solemnity", color: "white", season: "Easter", rankLabel: "Solemnity" };
  if (dEq(d, addDays(easter, -2)))return { name: "Good Friday", rank: "solemnity", color: "red", season: "Triduum", rankLabel: "Solemnity" };
  if (dEq(d, addDays(easter, -1)))return { name: "Holy Saturday", rank: "solemnity", color: "white", season: "Triduum", rankLabel: "Solemnity" };
  if (dEq(d, palmSun))            return { name: "Palm Sunday", rank: "solemnity", color: "red", season: "Lent", rankLabel: "Solemnity" };
  if (dEq(d, ashWed))             return { name: "Ash Wednesday", rank: "solemnity", color: "purple", season: "Lent", rankLabel: "Solemnity" };
  if (dEq(d, ascension))          return { name: "Ascension of the Lord", rank: "solemnity", color: "white", season: "Easter", rankLabel: "Solemnity" };
  if (dEq(d, pentecost))          return { name: "Pentecost Sunday", rank: "solemnity", color: "red", season: "Easter", rankLabel: "Solemnity" };
  if (dEq(d, trinity))            return { name: "Most Holy Trinity", rank: "solemnity", color: "white", season: "Ordinary Time", rankLabel: "Solemnity" };
  if (dEq(d, corpus))             return { name: "Corpus Christi", rank: "solemnity", color: "white", season: "Ordinary Time", rankLabel: "Solemnity" };

  // Season
  let season = "Ordinary Time";
  if (d >= sod(advent1) && d < sod(christmas))  season = "Advent";
  else if (d >= sod(christmas) || (month === 1 && day <= 13)) season = "Christmas";
  else if (d >= sod(ashWed) && d < sod(easter))  season = "Lent";
  else if (d >= sod(easter) && d <= sod(pentecost)) season = "Easter";
  else if (d >= sod(advent1Next))                season = "Advent";

  const key = `${month}-${day}`;
  if (NO_FIXED[key]) return { ...NO_FIXED[key], season, rankLabel: rankLabelNO(NO_FIXED[key].rank) };
  if (date.getDay() === 0) return { name: `Sunday of ${season}`, rank: "sunday", color: seasonColorNO(season), season, rankLabel: "Sunday" };
  return { name: null, rank: "feria", color: seasonColorNO(season), season, rankLabel: "Weekday" };
}

function rankLabelNO(r) {
  return { solemnity: "Solemnity", feast: "Feast Day", memorial: "Memorial", optional_memorial: "Optional Memorial", commemoration: "Commemoration", feria: "Weekday", sunday: "Sunday" }[r] || r;
}

function seasonColorNO(s) {
  return { Advent: "purple", Christmas: "white", Lent: "purple", Easter: "white", Triduum: "red", "Ordinary Time": "green" }[s] || "green";
}

// ═══════════════════════════════════════════════════════════
// TRADITIONAL LATIN MASS CALENDAR (1962 Missal)
// ═══════════════════════════════════════════════════════════

const TLM_FIXED = {
  // January
  "1-1":  { name: "Circumcision of Our Lord", rank: "double_1", color: "white" },
  "1-2":  { name: "Holy Name of Jesus", rank: "double_2", color: "white" },
  "1-6":  { name: "Epiphany of Our Lord", rank: "double_1", color: "white" },
  "1-13": { name: "Baptism of Our Lord (Octave of Epiphany)", rank: "double_2", color: "white" },
  "1-17": { name: "St. Anthony of Egypt", rank: "double", color: "white" },
  "1-20": { name: "Sts. Fabian and Sebastian", rank: "double", color: "red" },
  "1-21": { name: "St. Agnes, Virgin and Martyr", rank: "double", color: "red" },
  "1-22": { name: "Sts. Vincent and Anastasius", rank: "semidouble", color: "red" },
  "1-24": { name: "St. Timothy, Bishop and Martyr", rank: "semidouble", color: "red" },
  "1-25": { name: "Conversion of St. Paul", rank: "double_greater", color: "white" },
  "1-26": { name: "St. Polycarp, Bishop and Martyr", rank: "double", color: "red" },
  "1-28": { name: "St. Peter Nolasco", rank: "double", color: "white" },
  // February
  "2-2":  { name: "Purification of the Blessed Virgin Mary", rank: "double_2", color: "white" },
  "2-3":  { name: "St. Blaise, Bishop and Martyr", rank: "semidouble", color: "red" },
  "2-5":  { name: "St. Agatha, Virgin and Martyr", rank: "double", color: "red" },
  "2-14": { name: "St. Valentine, Priest and Martyr", rank: "simple", color: "red" },
  "2-22": { name: "Chair of St. Peter at Antioch", rank: "double_greater", color: "white" },
  "2-24": { name: "St. Matthias, Apostle", rank: "double_2", color: "red" },
  // March
  "3-7":  { name: "Sts. Perpetua and Felicity", rank: "double", color: "red" },
  "3-17": { name: "St. Patrick, Bishop and Confessor", rank: "double", color: "white" },
  "3-19": { name: "St. Joseph, Spouse of the Blessed Virgin Mary", rank: "double_1", color: "white" },
  "3-25": { name: "Annunciation of the Blessed Virgin Mary", rank: "double_1", color: "white" },
  // April
  "4-14": { name: "St. Justin Martyr", rank: "double", color: "red" },
  "4-23": { name: "St. George, Martyr", rank: "double", color: "red" },
  "4-25": { name: "St. Mark, Evangelist", rank: "double_2", color: "red" },
  "4-28": { name: "St. Paul of the Cross", rank: "double", color: "white" },
  "4-29": { name: "St. Peter Martyr", rank: "double", color: "red" },
  "4-30": { name: "St. Catherine of Siena", rank: "double", color: "white" },
  // May
  "5-1":  { name: "Sts. Philip and James, Apostles", rank: "double_2", color: "red" },
  "5-3":  { name: "Finding of the Holy Cross", rank: "double_2", color: "red" },
  "5-4":  { name: "St. Monica", rank: "double", color: "white" },
  "5-25": { name: "St. Gregory VII, Pope", rank: "semidouble", color: "white" },
  "5-26": { name: "St. Philip Neri", rank: "double", color: "white" },
  "5-27": { name: "St. Bede the Venerable", rank: "semidouble", color: "white" },
  "5-31": { name: "Queen of All Saints (BVM)", rank: "double_2", color: "white" },
  // June
  "6-1":  { name: "St. Angela Merici", rank: "double", color: "white" },
  "6-2":  { name: "Sts. Marcellinus and Peter", rank: "semidouble", color: "red" },
  "6-11": { name: "St. Barnabas, Apostle", rank: "double_greater", color: "red" },
  "6-12": { name: "St. John of San Facondo", rank: "double", color: "white" },
  "6-13": { name: "St. Anthony of Padua", rank: "double", color: "white" },
  "6-17": { name: "St. Gregory Barbarigo", rank: "double", color: "white" },
  "6-18": { name: "St. Ephrem the Syrian", rank: "double", color: "white" },
  "6-19": { name: "St. Juliana Falconieri", rank: "semidouble", color: "white" },
  "6-21": { name: "St. Aloysius Gonzaga", rank: "double", color: "white" },
  "6-22": { name: "St. Paulinus of Nola", rank: "semidouble", color: "white" },
  "6-24": { name: "Birth of St. John the Baptist", rank: "double_1", color: "white" },
  "6-28": { name: "Vigil of Sts. Peter and Paul", rank: "semidouble", color: "purple" },
  "6-29": { name: "Sts. Peter and Paul, Apostles", rank: "double_1", color: "red" },
  "6-30": { name: "Commemoration of St. Paul", rank: "double_greater", color: "red" },
  // July
  "7-1":  { name: "Most Precious Blood of Our Lord", rank: "double_1", color: "red" },
  "7-2":  { name: "Visitation of the Blessed Virgin Mary", rank: "double_2", color: "white" },
  "7-3":  { name: "St. Leo II, Pope", rank: "semidouble", color: "white" },
  "7-4":  { name: "St. Elizabeth of Portugal", rank: "double", color: "white" },
  "7-5":  { name: "St. Anthony Mary Zaccaria", rank: "double", color: "white" },
  "7-7":  { name: "Sts. Cyril and Methodius", rank: "double", color: "white" },
  "7-10": { name: "Seven Holy Brothers and Sts. Rufina and Secunda", rank: "semidouble", color: "red" },
  "7-11": { name: "St. Pius I, Pope and Martyr", rank: "semidouble", color: "red" },
  "7-12": { name: "St. John Gualbert", rank: "double", color: "white" },
  "7-14": { name: "St. Bonaventure", rank: "double", color: "white" },
  "7-15": { name: "St. Henry, Emperor", rank: "semidouble", color: "white" },
  "7-17": { name: "St. Alexis", rank: "semidouble", color: "white" },
  "7-18": { name: "St. Camillus de Lellis", rank: "double", color: "white" },
  "7-19": { name: "St. Vincent de Paul", rank: "double", color: "white" },
  "7-20": { name: "St. Jerome Emiliani", rank: "double", color: "white" },
  "7-21": { name: "St. Lawrence of Brindisi, Doctor of the Church", rank: "double_2", color: "white" },
  "7-22": { name: "St. Mary Magdalene", rank: "double_greater", color: "white" },
  "7-23": { name: "St. Apollinaris, Bishop and Martyr", rank: "double", color: "red" },
  "7-24": { name: "Vigil of St. James; St. Christina", rank: "simple", color: "purple" },
  "7-25": { name: "St. James the Greater, Apostle", rank: "double_2", color: "red" },
  "7-26": { name: "St. Anne, Mother of the BVM", rank: "double_2", color: "white" },
  "7-27": { name: "St. Pantaleon", rank: "semidouble", color: "red" },
  "7-28": { name: "Sts. Nazarius, Celsus, Victor and Innocent I", rank: "semidouble", color: "red" },
  "7-29": { name: "St. Martha", rank: "double", color: "white" },
  "7-30": { name: "Sts. Abdon and Sennen", rank: "semidouble", color: "red" },
  "7-31": { name: "St. Ignatius of Loyola", rank: "double", color: "white" },
  // August
  "8-1":  { name: "St. Peter's Chains (Ad Vincula)", rank: "double_greater", color: "white" },
  "8-2":  { name: "St. Alphonsus Liguori", rank: "double", color: "white" },
  "8-4":  { name: "St. Dominic", rank: "double_greater", color: "white" },
  "8-5":  { name: "Dedication of Our Lady of the Snows", rank: "double_greater", color: "white" },
  "8-6":  { name: "Transfiguration of Our Lord", rank: "double_2", color: "white" },
  "8-7":  { name: "St. Cajetan", rank: "double", color: "white" },
  "8-8":  { name: "St. John Vianney, Cure of Ars", rank: "double", color: "white" },
  "8-9":  { name: "Vigil of St. Lawrence", rank: "simple", color: "purple" },
  "8-10": { name: "St. Lawrence, Deacon and Martyr", rank: "double_2", color: "red" },
  "8-11": { name: "Sts. Tiburtius and Susanna", rank: "semidouble", color: "red" },
  "8-12": { name: "St. Clare of Assisi", rank: "double", color: "white" },
  "8-13": { name: "Sts. Hippolytus and Cassian", rank: "semidouble", color: "red" },
  "8-14": { name: "Vigil of the Assumption", rank: "simple", color: "purple" },
  "8-15": { name: "Assumption of the Blessed Virgin Mary", rank: "double_1", color: "white" },
  "8-16": { name: "St. Joachim, Father of the BVM", rank: "double_2", color: "white" },
  "8-17": { name: "St. Hyacinth", rank: "double", color: "white" },
  "8-18": { name: "St. Agapetus, Martyr", rank: "simple", color: "red" },
  "8-19": { name: "St. John Eudes", rank: "double", color: "white" },
  "8-20": { name: "St. Bernard of Clairvaux", rank: "double", color: "white" },
  "8-21": { name: "St. Jane Frances de Chantal", rank: "double", color: "white" },
  "8-22": { name: "Immaculate Heart of Mary", rank: "double_2", color: "white" },
  "8-23": { name: "St. Philip Benizi", rank: "double", color: "white" },
  "8-24": { name: "St. Bartholomew, Apostle", rank: "double_2", color: "red" },
  "8-25": { name: "St. Louis IX of France", rank: "semidouble", color: "white" },
  "8-26": { name: "St. Zephyrinus, Pope and Martyr", rank: "simple", color: "red" },
  "8-27": { name: "St. Joseph Calasanz", rank: "double", color: "white" },
  "8-28": { name: "St. Augustine of Hippo", rank: "double", color: "white" },
  "8-29": { name: "Beheading of St. John the Baptist", rank: "double_greater", color: "red" },
  "8-30": { name: "St. Rose of Lima", rank: "double", color: "white" },
  "8-31": { name: "St. Raymond Nonnatus", rank: "double", color: "white" },
  // September
  "9-1":  { name: "St. Giles", rank: "semidouble", color: "white" },
  "9-8":  { name: "Birth of the Blessed Virgin Mary", rank: "double_2", color: "white" },
  "9-9":  { name: "St. Peter Claver", rank: "double", color: "white" },
  "9-10": { name: "St. Nicholas of Tolentino", rank: "double", color: "white" },
  "9-12": { name: "Holy Name of Mary", rank: "double_greater", color: "white" },
  "9-14": { name: "Exaltation of the Holy Cross", rank: "double_greater", color: "red" },
  "9-15": { name: "Seven Dolors of the BVM", rank: "double_2", color: "white" },
  "9-16": { name: "Sts. Cornelius and Cyprian", rank: "semidouble", color: "red" },
  "9-17": { name: "Impression of the Stigmata of St. Francis", rank: "double_greater", color: "white" },
  "9-19": { name: "Sts. Januarius and Companions", rank: "double", color: "red" },
  "9-20": { name: "Sts. Eustace and Companions", rank: "semidouble", color: "red" },
  "9-21": { name: "St. Matthew, Apostle and Evangelist", rank: "double_2", color: "red" },
  "9-22": { name: "St. Thomas of Villanova", rank: "double", color: "white" },
  "9-23": { name: "St. Linus, Pope and Martyr", rank: "semidouble", color: "red" },
  "9-24": { name: "Our Lady of Ransom", rank: "double_greater", color: "white" },
  "9-26": { name: "Sts. Cyprian and Justina", rank: "semidouble", color: "red" },
  "9-27": { name: "Sts. Cosmas and Damian", rank: "semidouble", color: "red" },
  "9-28": { name: "St. Wenceslaus, Martyr", rank: "double", color: "red" },
  "9-29": { name: "Dedication of St. Michael the Archangel", rank: "double_2", color: "white" },
  "9-30": { name: "St. Jerome, Priest and Doctor", rank: "double", color: "white" },
  // October
  "10-1": { name: "St. Remigius", rank: "semidouble", color: "white" },
  "10-2": { name: "Holy Guardian Angels", rank: "double_greater", color: "white" },
  "10-3": { name: "St. Thérèse of the Child Jesus", rank: "double", color: "white" },
  "10-4": { name: "St. Francis of Assisi", rank: "double", color: "white" },
  "10-5": { name: "St. Placid and Companions", rank: "semidouble", color: "red" },
  "10-6": { name: "St. Bruno", rank: "double", color: "white" },
  "10-7": { name: "Our Lady of the Rosary", rank: "double_2", color: "white" },
  "10-8": { name: "St. Bridget of Sweden", rank: "double", color: "white" },
  "10-9": { name: "St. John Leonard", rank: "double", color: "white" },
  "10-11":{ name: "Maternity of the Blessed Virgin Mary", rank: "double_2", color: "white" },
  "10-13":{ name: "St. Edward the Confessor", rank: "semidouble", color: "white" },
  "10-14":{ name: "St. Callixtus I, Pope and Martyr", rank: "double", color: "red" },
  "10-15":{ name: "St. Teresa of Ávila", rank: "double", color: "white" },
  "10-16":{ name: "St. Hedwig", rank: "semidouble", color: "white" },
  "10-17":{ name: "St. Margaret Mary Alacoque", rank: "double", color: "white" },
  "10-18":{ name: "St. Luke, Evangelist", rank: "double_2", color: "red" },
  "10-19":{ name: "St. Peter of Alcantara", rank: "double", color: "white" },
  "10-20":{ name: "St. John Cantius", rank: "double", color: "white" },
  "10-21":{ name: "St. Hilarion", rank: "semidouble", color: "white" },
  "10-23":{ name: "St. Anthony Mary Claret", rank: "double", color: "white" },
  "10-24":{ name: "St. Raphael the Archangel", rank: "double_2", color: "white" },
  "10-25":{ name: "Sts. Chrysanthus and Daria", rank: "semidouble", color: "red" },
  "10-26":{ name: "St. Evaristus, Pope and Martyr", rank: "semidouble", color: "red" },
  "10-28":{ name: "Sts. Simon and Jude, Apostles", rank: "double_2", color: "red" },
  // November
  "11-1": { name: "All Saints", rank: "double_1", color: "white" },
  "11-2": { name: "All Souls", rank: "commemoration", color: "black" },
  "11-4": { name: "St. Charles Borromeo", rank: "double", color: "white" },
  "11-8": { name: "Feast of the Four Holy Crowned Martyrs", rank: "semidouble", color: "red" },
  "11-9": { name: "Dedication of the Lateran Basilica", rank: "double_2", color: "white" },
  "11-10":{ name: "St. Andrew Avellino", rank: "double", color: "white" },
  "11-11":{ name: "St. Martin of Tours", rank: "double", color: "white" },
  "11-12":{ name: "St. Martin I, Pope and Martyr", rank: "semidouble", color: "red" },
  "11-13":{ name: "St. Didacus", rank: "semidouble", color: "white" },
  "11-14":{ name: "St. Josaphat, Bishop and Martyr", rank: "double", color: "red" },
  "11-15":{ name: "St. Albert the Great", rank: "double", color: "white" },
  "11-16":{ name: "St. Gertrude the Great", rank: "double", color: "white" },
  "11-17":{ name: "St. Gregory the Wonderworker", rank: "semidouble", color: "white" },
  "11-18":{ name: "Dedication of the Vatican Basilica", rank: "double_greater", color: "white" },
  "11-19":{ name: "St. Elizabeth of Hungary", rank: "double", color: "white" },
  "11-20":{ name: "St. Felix of Valois", rank: "double", color: "white" },
  "11-21":{ name: "Presentation of the Blessed Virgin Mary", rank: "double_greater", color: "white" },
  "11-22":{ name: "St. Cecilia, Virgin and Martyr", rank: "double", color: "red" },
  "11-23":{ name: "St. Clement I, Pope and Martyr", rank: "double", color: "red" },
  "11-24":{ name: "St. John of the Cross", rank: "double", color: "white" },
  "11-25":{ name: "St. Catherine of Alexandria", rank: "double", color: "red" },
  "11-26":{ name: "St. Sylvester Gozzolini", rank: "semidouble", color: "white" },
  "11-29":{ name: "Vigil of St. Andrew", rank: "simple", color: "purple" },
  "11-30":{ name: "St. Andrew, Apostle", rank: "double_2", color: "red" },
  // December
  "12-2": { name: "St. Bibiana, Virgin and Martyr", rank: "double", color: "red" },
  "12-3": { name: "St. Francis Xavier", rank: "double", color: "white" },
  "12-4": { name: "St. Peter Chrysologus", rank: "double", color: "white" },
  "12-5": { name: "St. Sabbas", rank: "semidouble", color: "white" },
  "12-6": { name: "St. Nicholas of Bari", rank: "double", color: "white" },
  "12-7": { name: "St. Ambrose", rank: "double", color: "white" },
  "12-8": { name: "Immaculate Conception of the BVM", rank: "double_1", color: "white" },
  "12-10":{ name: "Translation of the Holy House (Loreto)", rank: "double_greater", color: "white" },
  "12-11":{ name: "St. Damasus I, Pope", rank: "semidouble", color: "white" },
  "12-13":{ name: "St. Lucy, Virgin and Martyr", rank: "double", color: "red" },
  "12-16":{ name: "St. Eusebius of Vercelli", rank: "semidouble", color: "red" },
  "12-21":{ name: "St. Thomas, Apostle", rank: "double_2", color: "red" },
  "12-24":{ name: "Vigil of Christmas", rank: "simple", color: "purple" },
  "12-25":{ name: "Nativity of Our Lord Jesus Christ", rank: "double_1", color: "white" },
  "12-26":{ name: "St. Stephen, First Martyr", rank: "double_2", color: "red" },
  "12-27":{ name: "St. John, Apostle and Evangelist", rank: "double_2", color: "white" },
  "12-28":{ name: "Holy Innocents", rank: "double_2", color: "red" },
  "12-29":{ name: "St. Thomas Becket", rank: "double", color: "red" },
  "12-31":{ name: "St. Sylvester I, Pope", rank: "semidouble", color: "white" },
};

const TLM_RANK_LABELS = {
  double_1: "Double of the First Class",
  double_2: "Double of the Second Class",
  double_greater: "Greater Double",
  double: "Double",
  semidouble: "Semidouble",
  simple: "Simple",
  commemoration: "Commemoration",
  feria: "Feria",
  sunday: "Sunday",
};

function getLiturgicalDayTLM(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const d = sod(date);

  const easter = getEaster(year);
  const ashWed = addDays(easter, -46);
  const septuagesima = addDays(easter, -63);
  const sexagesima = addDays(easter, -56);
  const quinquagesima = addDays(easter, -49);
  const palmSun = addDays(easter, -7);
  const ascension = addDays(easter, 39); // Always Thursday
  const pentecost = addDays(easter, 49);
  const trinity = addDays(easter, 56);
  const corpus = addDays(easter, 60); // Always Thursday
  const sacredHeart = addDays(easter, 68); // Friday after Corpus Christi
  const christKing = addDays(new Date(year, 9, 31), -(new Date(year, 9, 31).getDay())); // Last Sunday of October
  const advent1 = getAdvent1(year);
  const advent1Next = getAdvent1(year + 1);
  const christmas = new Date(year, 11, 25);

  // Moveable feasts - check in order of precedence
  if (dEq(d, easter))               return { name: "Easter Sunday", rank: "double_1", color: "white", season: "Passiontide/Easter", rankLabel: "Double of the First Class" };
  if (dEq(d, addDays(easter, 1)))   return { name: "Easter Monday", rank: "double_1", color: "white", season: "Easter", rankLabel: "Double of the First Class" };
  if (dEq(d, addDays(easter, 2)))   return { name: "Easter Tuesday", rank: "double_1", color: "white", season: "Easter", rankLabel: "Double of the First Class" };
  if (dEq(d, addDays(easter, -2)))  return { name: "Good Friday", rank: "double_1", color: "black", season: "Passiontide", rankLabel: "Double of the First Class" };
  if (dEq(d, addDays(easter, -1)))  return { name: "Holy Saturday", rank: "double_1", color: "white", season: "Passiontide", rankLabel: "Double of the First Class" };
  if (dEq(d, palmSun))              return { name: "Sunday of the Passion (Palm Sunday)", rank: "double_1", color: "red", season: "Passiontide", rankLabel: "Double of the First Class" };
  if (dEq(d, addDays(easter, -3)))  return { name: "Holy Wednesday (Spy Wednesday)", rank: "feria", color: "purple", season: "Passiontide", rankLabel: "Feria" };
  if (dEq(d, ashWed))               return { name: "Ash Wednesday", rank: "feria", color: "purple", season: "Lent", rankLabel: "Privileged Feria" };
  if (dEq(d, septuagesima))         return { name: "Septuagesima Sunday", rank: "sunday", color: "purple", season: "Septuagesima", rankLabel: "Sunday" };
  if (dEq(d, sexagesima))           return { name: "Sexagesima Sunday", rank: "sunday", color: "purple", season: "Septuagesima", rankLabel: "Sunday" };
  if (dEq(d, quinquagesima))        return { name: "Quinquagesima Sunday", rank: "sunday", color: "purple", season: "Septuagesima", rankLabel: "Sunday" };
  if (dEq(d, ascension))            return { name: "Ascension of Our Lord", rank: "double_1", color: "white", season: "Easter", rankLabel: "Double of the First Class" };
  if (dEq(d, pentecost))            return { name: "Pentecost Sunday", rank: "double_1", color: "red", season: "Pentecost", rankLabel: "Double of the First Class" };
  if (dEq(d, addDays(pentecost,1))) return { name: "Whit Monday", rank: "double_1", color: "red", season: "Pentecost", rankLabel: "Double of the First Class" };
  if (dEq(d, addDays(pentecost,2))) return { name: "Whit Tuesday", rank: "double_1", color: "red", season: "Pentecost", rankLabel: "Double of the First Class" };
  if (dEq(d, trinity))              return { name: "Most Holy Trinity", rank: "double_1", color: "white", season: "After Pentecost", rankLabel: "Double of the First Class" };
  if (dEq(d, corpus))               return { name: "Corpus Christi", rank: "double_1", color: "white", season: "After Pentecost", rankLabel: "Double of the First Class" };
  if (dEq(d, sacredHeart))          return { name: "Feast of the Sacred Heart", rank: "double_1", color: "white", season: "After Pentecost", rankLabel: "Double of the First Class" };
  if (dEq(d, christKing))           return { name: "Christ the King", rank: "double_1", color: "white", season: "After Pentecost", rankLabel: "Double of the First Class" };

  // Season
  let season = "After Pentecost";
  if (d >= sod(advent1) && d < sod(christmas))                         season = "Advent";
  else if (d >= sod(christmas) || (month === 1 && day <= 13))          season = "Christmastide";
  else if (d >= sod(septuagesima) && d < sod(ashWed))                  season = "Septuagesima";
  else if (d >= sod(ashWed) && d < sod(addDays(easter, -14)))          season = "Lent";
  else if (d >= sod(addDays(easter, -14)) && d < sod(easter))          season = "Passiontide";
  else if (d >= sod(easter) && d <= sod(pentecost))                    season = "Easter";
  else if (d >= sod(advent1Next))                                       season = "Advent";

  const key = `${month}-${day}`;
  if (TLM_FIXED[key]) return { ...TLM_FIXED[key], season, rankLabel: TLM_RANK_LABELS[TLM_FIXED[key].rank] || TLM_FIXED[key].rank };
  if (date.getDay() === 0) return { name: `Sunday ${seasonLabelTLM(season)}`, rank: "sunday", color: seasonColorTLM(season), season, rankLabel: "Sunday" };
  return { name: null, rank: "feria", color: seasonColorTLM(season), season, rankLabel: "Feria" };
}

function seasonLabelTLM(s) {
  return { "After Pentecost": "after Pentecost", Advent: "of Advent", Christmastide: "after Christmas", Septuagesima: "", Lent: "of Lent", Passiontide: "of Passiontide", Easter: "after Easter" }[s] || "";
}

function seasonColorTLM(s) {
  return { Advent: "purple", Christmastide: "white", Septuagesima: "purple", Lent: "purple", Passiontide: "purple", Easter: "white", "After Pentecost": "green" }[s] || "green";
}

// ═══════════════════════════════════════════════════════════
// COLOR TOKENS & SEASON THEMES
// ═══════════════════════════════════════════════════════════

const C = {
  darkBrown: "#111b30", midBrown: "#1a2744", gold: "#c9a96e",
  cream: "#f5f0e8", warmWhite: "#faf7f2", border: "#dcd4c8",
  mutedGold: "#8a7a6a", red: "#8B1A1A", green: "#4A7C59",
  blue: "#5B6FA6", lightGold: "#eae4da", text: "#1a2744",
};

const SEASON_THEMES = {
  Advent:          { bg: "#1E1030", accent: "#7B5EA7", textColor: "#E8D5FF", label: "Advent" },
  Christmastide:   { bg: "#0d2a1a", accent: "#c9a96e", textColor: "#FFF8E8", label: "Christmastide" },
  Christmas:       { bg: "#0d2a1a", accent: "#c9a96e", textColor: "#FFF8E8", label: "Christmas" },
  Septuagesima:    { bg: "#2A1A00", accent: "#8B6914", textColor: "#FFE4A0", label: "Septuagesima" },
  Lent:            { bg: "#1A1000", accent: "#8B6914", textColor: "#FFE4A0", label: "Lent" },
  Passiontide:     { bg: "#1A0A0A", accent: "#8B1A1A", textColor: "#FFD0D0", label: "Passiontide" },
  "Triduum":       { bg: "#0A0A0A", accent: "#8B1A1A", textColor: "#FFD0D0", label: "Triduum" },
  "Passiontide/Easter": { bg: "#1A0A0A", accent: "#8B1A1A", textColor: "#FFD0D0", label: "Passiontide" },
  Easter:          { bg: "#0A2A1A", accent: "#4A7C59", textColor: "#D0FFE4", label: "Eastertide" },
  Pentecost:       { bg: "#2A0A0A", accent: "#c9a96e", textColor: "#FFE4D0", label: "Pentecost" },
  "After Pentecost":{ bg: "#1a2744", accent: "#c9a96e", textColor: "#F5EDE4", label: "After Pentecost" },
  "Ordinary Time": { bg: "#1a2744", accent: "#c9a96e", textColor: "#F5EDE4", label: "Ordinary Time" },
};

function getTheme(season) {
  return SEASON_THEMES[season] || SEASON_THEMES["Ordinary Time"];
}

const inputStyle = {
  padding: "10px 13px", borderRadius: "10px", border: `1.5px solid ${C.border}`,
  fontFamily: "Georgia, serif", fontSize: "14px", color: C.text, background: C.warmWhite, outline: "none",
};
const btnStyle = {
  padding: "10px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
  fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "600", color: "#fff",
};

// ═══════════════════════════════════════════════════════════
// AI CONTENT GENERATOR
// ═══════════════════════════════════════════════════════════

async function generateDailyContent(feast, date, rite) {
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const riteNote = rite === "TLM"
    ? "This family follows the Traditional Latin Mass (1962 Missal). Use traditional language where appropriate (e.g. 'Blessed Virgin Mary' not just 'Mary', 'Our Lord' for Jesus, etc.)."
    : "This family follows the Ordinary Form of the Roman Rite.";

  const prompt = `You are generating daily content for Spiritu, a Catholic family faith app. Today is ${dateStr}. ${riteNote}

Today's liturgical celebration: "${feast.name || (feast.season + " Weekday")}"
Season: ${feast.season} | Rank: ${feast.rankLabel}

Generate a JSON object with exactly these fields:
{
  "storyYoung": "3-4 sentences for ages 4-6. Warm, concrete, wonder-filled. Simple words.",
  "storyOlder": "4-5 sentences for ages 7-10. Real historical detail. Something surprising or inspiring.",
  "dinnerQuestion": "One dinner table question connecting today's feast to everyday family life.",
  "prayer": "2-3 sentence family prayer. Address the saint or mystery directly. End with Amen.",
  "activityTitle": "Activity title (5 words max)",
  "activityDescription": "One sentence. Practical and doable at home tonight.",
  "funFact": "One fascinating fact about today's feast. 2 sentences max."
}

Return ONLY valid JSON. No markdown, no backticks, no preamble.`;

  const res = await fetch("/api/anthropic", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

// ═══════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════

function Card({ icon, label, children, accent }) {
  return (
    <div className="ck-card" style={{ background: "#fff", borderRadius: "16px", padding: "20px 22px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `3px solid ${accent || C.gold}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ fontSize: "11px", fontFamily: "Georgia, serif", letterSpacing: "0.08em", textTransform: "uppercase", color: C.mutedGold, fontWeight: "600" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function AgeToggle({ selected, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: C.lightGold, borderRadius: "20px", padding: "3px", gap: "2px" }}>
      {["young", "older"].map(a => (
        <button key={a} onClick={() => onChange(a)} style={{ padding: "5px 14px", borderRadius: "16px", border: "none", cursor: "pointer", fontSize: "12px", fontFamily: "Georgia, serif", fontWeight: selected === a ? "600" : "400", background: selected === a ? "#fff" : "transparent", color: selected === a ? C.midBrown : C.mutedGold, boxShadow: selected === a ? "0 1px 3px rgba(0,0,0,0.12)" : "none", transition: "all 0.2s" }}>
          {a === "young" ? "Ages 4-6" : "Ages 7-10"}
        </button>
      ))}
    </div>
  );
}

function Skeleton({ height = 60, radius = 12 }) {
  return <div style={{ height, borderRadius: radius, background: "linear-gradient(90deg,#f0e8de 25%,#e8ddd0 50%,#f0e8de 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

// ═══════════════════════════════════════════════════════════
// RITE TOGGLE
// ═══════════════════════════════════════════════════════════

function RiteToggle({ rite, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "3px", gap: "2px" }}>
      {["NO", "TLM"].map(r => (
        <button key={r} onClick={() => onChange(r)} style={{
          padding: "4px 12px", borderRadius: "16px", border: "none", cursor: "pointer",
          fontSize: "11px", fontFamily: "Georgia, serif", fontWeight: "700",
          letterSpacing: "0.05em",
          background: rite === r ? "rgba(255,255,255,0.9)" : "transparent",
          color: rite === r ? C.darkBrown : "rgba(255,255,255,0.7)",
          transition: "all 0.2s",
        }}>{r}</button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CALENDAR STRIP
// ═══════════════════════════════════════════════════════════

function CalendarStrip({ selectedDate, onSelect, rite, nightMode }) {
  const days = [];
  for (let i = -2; i <= 4; i++) {
    const d = addDays(selectedDate, i);
    const feast = rite === "TLM" ? getLiturgicalDayTLM(d) : getLiturgicalDayNO(d);
    const theme = getTheme(feast.season);
    const isSelected = i === 0;
    days.push(
      <button key={i} onClick={() => onSelect(d)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "8px 10px", borderRadius: "12px", border: "none", background: isSelected ? C.darkBrown : "transparent", cursor: "pointer", minWidth: "44px" }}>
        <span style={{ fontSize: "10px", color: isSelected ? C.gold : C.mutedGold, fontFamily: "Georgia, serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
        <span style={{ fontSize: "18px", fontWeight: isSelected ? "700" : "400", color: isSelected ? "#fff" : C.text, fontFamily: "Georgia, serif" }}>{d.getDate()}</span>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: feast.rank === "feria" ? C.border : theme.accent }} />
      </button>
    );
  }
  return (
    <div style={{ background: nightMode ? "#161b22" : "#fff", borderBottom: `1px solid ${nightMode ? "#30363d" : C.border}`, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {days}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DAILY FEED SCREEN
// ═══════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════
// DAILY READINGS — Missale Meum API (1962 Missal)
// ═══════════════════════════════════════════════════════════

function parseReadings(markdown) {
  // Extract Epistle and Gospel from Missale Meum HTML/markdown response
  const result = { epistle: null, gospel: null, collect: null, communion: null };

  // Extract Epistle section
  const epistleMatch = markdown.match(/####\s*Epistle[\s\S]*?####\s*Lectio[\s\S]*?\n([\s\S]*?)(?=####\s*(Gradual|Sequence|Gospel|Tract))/i);
  if (epistleMatch) {
    const raw = epistleMatch[1].trim();
    // Get scripture ref and text (English only, before Latin)
    const lines = raw.split("\n").filter(l => l.trim());
    const refLine = lines.find(l => l.match(/\*[A-Za-z1-9]/));
    const ref = refLine ? refLine.replace(/\*/g, "").trim() : "";
    // Get the main text - everything between ref and next italic/Latin
    const textLines = [];
    let capturing = false;
    for (const line of lines) {
      if (line.match(/Lesson from|Lectio/) && !capturing) { capturing = true; continue; }
      if (capturing && line.match(/^\*[A-Za-z]/) && textLines.length > 0) break; // hit Latin ref
      if (capturing && line.trim() && !line.match(/^Lectio|^In diebus|^In illo/)) {
        textLines.push(line.trim());
      }
    }
    result.epistle = { ref, text: textLines.join(" ").substring(0, 800) };
  }

  // Extract Gospel section
  const gospelMatch = markdown.match(/####\s*Gospel[\s\S]*?####\s*Evangelium[\s\S]*?\n([\s\S]*?)(?=####\s*Offertory)/i);
  if (gospelMatch) {
    const raw = gospelMatch[1].trim();
    const lines = raw.split("\n").filter(l => l.trim());
    const refLine = lines.find(l => l.match(/\*[A-Za-z1-9]/));
    const ref = refLine ? refLine.replace(/\*/g, "").trim() : "";
    const textLines = [];
    let capturing = false;
    for (const line of lines) {
      if (line.match(/Continuation|Continuation|according to/i) && !capturing) { capturing = true; continue; }
      if (capturing && line.match(/^Sequentia|^In illo tempore/) ) break;
      if (capturing && line.trim() && !line.match(/^\*[A-Z][a-z]/)) {
        textLines.push(line.trim());
      }
    }
    result.gospel = { ref, text: textLines.join(" ").substring(0, 1000) };
  }

  // Extract Collect
  const collectMatch = markdown.match(/####\s*Collect[\s\S]*?####\s*Oratio[\s\S]*?\n([\s\S]*?)(?=####\s*(Epistle|Tract|Gradual))/i);
  if (collectMatch) {
    const raw = collectMatch[1].trim();
    const lines = raw.split("\n").filter(l => l.trim() && !l.match(/^(Deus|Omnipotens|Per Dominum|Concede|Da nobis)/));
    result.collect = lines.slice(0, 3).join(" ").substring(0, 400);
  }

  return result;
}

async function fetchReadings(date) {
  const dateStr = date.toISOString().split("T")[0];
  const url = "/api/readings?date=" + dateStr;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch");
  const data = await response.json();
  const readings = parseReadings(data.html || "");
  // Attach feast info from Missale Meum for TLM calendar accuracy
  if (data.feast) readings.missalemeum = { name: data.feast, class: data.class, commemoration: data.commemoration };
  return readings;
}

// ── Dom Gueranger slug builder ──────────────────────────────
function buildGuerangerSlug(feast, date) {
  const month = ["january","february","march","april","may","june","july",
    "august","september","october","november","december"][date.getMonth()];
  const day = date.getDate();
  // Use feast name if available, otherwise use season
  const name = feast?.name || feast?.season || "";
  // Convert to URL slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const prefix = month + "-" + day + "-";
  // Full slug: month/month-day-feast-name
  return month + "/" + prefix + slug;
}

async function fetchGueranger(feast, date) {
  const slug = buildGuerangerSlug(feast, date);
  const url = "/api/gueranger?slug=" + encodeURIComponent(slug);
  const response = await fetch(url);
  if (!response.ok) throw new Error("Not found");
  const html = await response.text();

  // Extract the main article text - everything between the article heading and the table
  // The Gueranger text appears after the H1 heading and before the bilingual table
  const parser = new DOMParser ? new DOMParser() : null;

  // Simple text extraction - find paragraphs after the main h1
  // Look for content between main heading and "This text is taken from"
  const footerIdx = html.indexOf("This text is taken from");
  if (footerIdx === -1) throw new Error("No Gueranger text found");

  // Find the article start - after the last breadcrumb link
  const articleStart = html.lastIndexOf('<h1', footerIdx);
  if (articleStart === -1) throw new Error("No article start");

  // Extract just the text content
  let block = html.substring(articleStart, footerIdx);

  // Strip HTML tags
  block = block.replace(/<[^>]+>/g, " ");
  block = block.replace(/\s+/g, " ").trim();

  // Remove the H1 title (first sentence up to the saint name period)
  // Take the main body text - skip the h1 content
  const h1End = block.indexOf("  ");
  const bodyText = h1End > 0 ? block.substring(h1End).trim() : block;

  // Return first 600 chars as the preview excerpt
  return bodyText.substring(0, 700).trim();
}

function ReadingsSection({ date, feast, rite, onFeastData }) {
  const [readings, setReadings] = useState(null);
  const [gueranger, setGueranger] = useState(null);
  const [guerangerUrl, setGuerangerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState({ epistle: false, gospel: true, collect: false });

  useEffect(() => {
    setReadings(null);
    setGueranger(null);
    setLoading(true);
    setError(false);

    // Build Gueranger monthly URL - reliable, no slug guessing
    const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const month = months[date.getMonth()];
    setGuerangerUrl("https://sensusfidelium.com/the-liturgical-year-dom-prosper-gueranger/" + month + "/");

    // Fetch readings only
    fetchReadings(date)
      .then(r => {
        setReadings(r);
        setLoading(false);
        if (!r) setError(true);
        // Pass Missale Meum feast data up to override local TLM calendar
        if (r?.missalemeum && onFeastData) onFeastData(r.missalemeum);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [date]);

  if (rite !== "TLM") return null;

  return (
    <div style={{ marginTop: "4px" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingTop: "4px" }}>
        <div style={{ flex: 1, height: "1px", background: C.border }} />
        <span style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Mass Readings</span>
        <div style={{ flex: 1, height: "1px", background: C.border }} />
      </div>

      {loading && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <Skeleton height={14} radius={4} />
          <div style={{ height: 8 }} />
          <Skeleton height={14} radius={4} />
          <div style={{ height: 8 }} />
          <Skeleton height={60} radius={8} />
        </div>
      )}

      {error && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px 20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid " + C.border }}>
          <p style={{ fontSize: "13px", color: C.mutedGold, fontFamily: "Georgia, serif", margin: 0, fontStyle: "italic" }}>
            Readings unavailable offline. Visit missalemeum.com for today's propers.
          </p>
        </div>
      )}

      {readings && !loading && (
        <>
          {/* Dom Gueranger link */}
          {guerangerUrl && (
            <a href={guerangerUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "14px", border: "1px solid " + C.border, background: "#fff", marginBottom: "12px", textDecoration: "none" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#1a2744", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: C.gold, fontSize: "16px" }}>+</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a2744", fontFamily: "Georgia, serif" }}>Dom Gueranger on this month</div>
                <div style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>The Liturgical Year at Sensus Fidelium</div>
              </div>
              <span style={{ color: C.mutedGold, fontSize: "16px" }}>&#8250;</span>
            </a>
          )}

          {/* Collect */}
          {readings.collect && (
            <div style={{ background: "#fff", borderRadius: "14px", marginBottom: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid " + C.gold }}>
              <button onClick={() => setExpanded(e => ({ ...e, collect: !e.collect }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "14px" }}>prayer</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#1a2744", fontFamily: "Georgia, serif" }}>Collect</span>
                <span style={{ fontSize: "10px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>The priest's opening prayer</span>
                <span style={{ color: C.mutedGold, fontSize: "16px", transform: expanded.collect ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>&#8250;</span>
              </button>
              {expanded.collect && (
                <div style={{ padding: "0 16px 16px" }}>
                  <p style={{ fontSize: "13px", color: "#3a3a3a", fontFamily: "Georgia, serif", lineHeight: "1.75", margin: 0, fontStyle: "italic" }}>{readings.collect}</p>
                </div>
              )}
            </div>
          )}

          {/* Epistle */}
          {readings.epistle && (
            <div style={{ background: "#fff", borderRadius: "14px", marginBottom: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid " + C.red }}>
              <button onClick={() => setExpanded(e => ({ ...e, epistle: !e.epistle }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "14px" }}>book</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a2744", fontFamily: "Georgia, serif" }}>Epistle</div>
                  {readings.epistle.ref && <div style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>{readings.epistle.ref}</div>}
                </div>
                <span style={{ color: C.mutedGold, fontSize: "16px", transform: expanded.epistle ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>&#8250;</span>
              </button>
              {expanded.epistle && (
                <div style={{ padding: "0 16px 16px" }}>
                  <p style={{ fontSize: "14px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.8", margin: 0 }}>{readings.epistle.text}</p>
                  {readings.epistle.text.length >= 800 && (
                    <a href={"https://www.missalemeum.com/en/calendar/" + date.toISOString().split("T")[0]} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: C.blue, fontFamily: "Georgia, serif", display: "block", marginTop: "10px" }}>Full reading at missalemeum.com</a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gospel */}
          {readings.gospel && (
            <div style={{ background: "#fff", borderRadius: "14px", marginBottom: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid " + C.green }}>
              <button onClick={() => setExpanded(e => ({ ...e, gospel: !e.gospel }))} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "14px" }}>gospel</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a2744", fontFamily: "Georgia, serif" }}>Holy Gospel</div>
                  {readings.gospel.ref && <div style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>{readings.gospel.ref}</div>}
                </div>
                <span style={{ color: C.mutedGold, fontSize: "16px", transform: expanded.gospel ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>&#8250;</span>
              </button>
              {expanded.gospel && (
                <div style={{ padding: "0 16px 16px" }}>
                  <p style={{ fontSize: "14px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.8", margin: "0 0 12px" }}>{readings.gospel.text}</p>
                  {readings.gospel.text.length >= 1000 && (
                    <a href={"https://www.missalemeum.com/en/calendar/" + date.toISOString().split("T")[0]} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: C.blue, fontFamily: "Georgia, serif", display: "block", marginTop: "10px" }}>Full reading at missalemeum.com</a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Full propers link */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
            <a href={"https://www.missalemeum.com/en/calendar/" + date.toISOString().split("T")[0]} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "11px", borderRadius: "12px", border: "1px solid " + C.border, background: "transparent", color: C.mutedGold, fontFamily: "Georgia, serif", fontSize: "11px", textDecoration: "none" }}>
              Full propers (Missale Meum)
            </a>
            {guerangerUrl && (
              <a href={guerangerUrl} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "11px", borderRadius: "12px", border: "1px solid " + C.border, background: "transparent", color: C.mutedGold, fontFamily: "Georgia, serif", fontSize: "11px", textDecoration: "none" }}>
                Gueranger (Sensus Fidelium)
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DailyFeed({ feast, content, loading, date, onAskQuestion, rite, welcomeBanner, onFeastData }) {
  const [ageGroup, setAgeGroup] = useState("young");
  useEffect(() => { setTimeout(() => { document.querySelectorAll('.ck-scroll').forEach(el => { el.scrollTop = 0; }); }, 0); }, [date]);
  const theme = getTheme(feast?.season);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "16px 16px 24px" }}>

      {/* Welcome banner */}
      {welcomeBanner && <div style={{ marginBottom: "16px" }}>{welcomeBanner}</div>}

      {/* Feast banner */}
      <div style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.accent}88 100%)`, borderRadius: "18px", padding: "22px 22px 18px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: "90px", opacity: 0.08, lineHeight: 1 }}>✝</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{ fontSize: "11px", color: theme.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>{feast?.rankLabel}</div>
          {rite === "TLM" && <div style={{ fontSize: "9px", background: "rgba(255,255,255,0.15)", color: "#fff", padding: "2px 6px", borderRadius: "8px", letterSpacing: "0.05em" }}>1962</div>}
        </div>
        <div style={{ fontSize: feast?.name && feast.name.length > 35 ? "15px" : "20px", color: "#fff", fontWeight: "700", lineHeight: "1.2", marginBottom: "6px" }}>
          {feast?.name || `${dateStr.split(",")[0]} of ${feast?.season}`}
        </div>
        <div style={{ fontSize: "11px", color: theme.accent, marginBottom: "8px", fontFamily: "Georgia, serif", opacity: 0.9 }}>{theme.label}</div>
        {loading ? <Skeleton height={36} radius={8} /> : (
          <div style={{ fontSize: "12px", color: theme.textColor, lineHeight: "1.5", fontStyle: "italic", opacity: 0.9 }}>{content?.funFact}</div>
        )}
      </div>

      {/* Saint Story */}
      <Card icon="📖" label="Saint Story" accent={C.red}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "13px", color: C.midBrown, fontWeight: "600", fontFamily: "Georgia, serif" }}>{ageGroup === "young" ? "Ages 4-6" : "Ages 7-10"}</span>
          <AgeToggle selected={ageGroup} onChange={setAgeGroup} />
        </div>
        {loading ? <><Skeleton height={16} radius={4} /><div style={{ height: 8 }} /><Skeleton height={16} radius={4} /><div style={{ height: 8 }} /><Skeleton height={16} radius={4} /></> : (
          <p style={{ fontSize: "15px", color: C.text, lineHeight: "1.7", margin: 0, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            {ageGroup === "young" ? content?.storyYoung : content?.storyOlder}
          </p>
        )}
      </Card>

      <Card icon="🍽️" label="Dinner Table Question" accent={C.gold}>
        {loading ? <Skeleton height={50} radius={8} /> : (
          <p style={{ fontSize: "16px", color: C.text, lineHeight: "1.6", margin: 0, fontWeight: "500", fontFamily: "Georgia, serif" }}>"{content?.dinnerQuestion}"</p>
        )}
      </Card>

      <Card icon="🙏" label="Family Prayer Tonight" accent={C.green}>
        {loading ? <Skeleton height={50} radius={8} /> : (
          <p style={{ fontSize: "15px", color: "#1a2744", lineHeight: "1.7", margin: 0, fontStyle: "italic", fontFamily: "Georgia, serif" }}>"{content?.prayer}"</p>
        )}
      </Card>

      <Card icon="✏️" label="Feast Day Activity" accent={C.blue}>
        {loading ? <Skeleton height={50} radius={8} /> : (
          <p style={{ fontSize: "14px", color: "#1a2744", lineHeight: "1.6", margin: 0, fontFamily: "Georgia, serif" }}>
            <strong style={{ display: "block", marginBottom: "4px", color: "#1a2744" }}>{content?.activityTitle}</strong>
            {content?.activityDescription}
          </p>
        )}
      </Card>

      {/* Daily Readings from 1962 Missal */}
      <ReadingsSection date={date} feast={feast} rite={rite} onFeastData={onFeastData} />

      <button onClick={onAskQuestion} style={{ width: "100%", padding: "14px", borderRadius: "14px", border: `1.5px solid ${C.green}`, background: "#EDF4EF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
        <span style={{ fontSize: "16px" }}>💬</span>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: C.green, fontWeight: "600" }}>Did today's story spark a question?</span>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ASK SCREEN
// ═══════════════════════════════════════════════════════════

const AGE_BUCKETS = [
  { id: "young",  label: "Little ones",  range: "Ages 3-5", color: "#E8924A", bg: "#FEF3EB" },
  { id: "middle", label: "Growing up",   range: "Ages 6-8", color: C.green,   bg: "#EDF4EF" },
  { id: "older",  label: "Getting deep", range: "Ages 9-12",color: C.blue,    bg: "#EEF0FA" },
];

const EXAMPLE_QUESTIONS = {
  young:  ["Why can't we see God?", "Does Jesus love me even when I'm bad?", "Where is heaven?", "Why do we go to church?"],
  middle: ["Why did God let Jesus die?", "What happens when we die?", "Is God always listening?", "Why do bad things happen?"],
  older:  ["How do we know the Bible is true?", "Why does God allow suffering?", "What makes Catholics different?", "Why do we need a Pope?"],
};

function getBucket(age) {
  const n = parseInt(age);
  if (n <= 5) return AGE_BUCKETS[0];
  if (n <= 8) return AGE_BUCKETS[1];
  return AGE_BUCKETS[2];
}

function getAgePrompt(age) {
  const n = parseInt(age);
  if (n <= 5) return `The child is ${age}. Simple words, one concrete image, 4 sentences max.`;
  if (n <= 8) return `The child is ${age}. Everyday analogies, 4-5 sentences.`;
  return `The child is ${age}. Engage seriously, one theological concept explained simply, 5-6 sentences.`;
}

function ChildPill({ child, selected, onClick, onRemove }) {
  return (
    <div onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px 7px 10px", borderRadius: "20px", border: `2px solid ${selected ? C.red : C.border}`, background: selected ? "#EEF2FA" : "#fff", cursor: "pointer", userSelect: "none" }}>
      <span style={{ fontSize: "16px" }}>{child.avatar}</span>
      <span style={{ fontSize: "13px", fontFamily: "Georgia, serif", color: selected ? C.midBrown : C.mutedGold, fontWeight: selected ? "600" : "400" }}>{child.name}</span>
      <span style={{ fontSize: "11px", color: "#B8A090", fontFamily: "Georgia, serif" }}>{child.age}y</span>
      <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8B8A8", fontSize: "14px", padding: "0 0 0 2px" }}>×</button>
    </div>
  );
}

function AddChildForm({ onAdd, onCancel }) {
  const [name, setName] = useState(""); const [age, setAge] = useState(""); const [avatar, setAvatar] = useState("🧒");
  const AVATARS = ["🧒","👦","👧","🌟","🐑","✨","🕊️","🌿"];
  return (
    <div style={{ background: "#fff", border: `2px dashed ${C.gold}`, borderRadius: "16px", padding: "18px", marginBottom: "16px" }}>
      <p style={{ fontSize: "13px", color: C.mutedGold, fontFamily: "Georgia, serif", margin: "0 0 14px" }}>Add a child to get answers shaped just for them.</p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {AVATARS.map(a => <button key={a} onClick={() => setAvatar(a)} style={{ fontSize: "20px", padding: "4px 6px", borderRadius: "8px", border: `2px solid ${avatar === a ? C.red : "transparent"}`, background: avatar === a ? "#EEF2FA" : "transparent", cursor: "pointer" }}>{a}</button>)}
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input placeholder="Child's name" value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <input type="number" min="2" max="12" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} style={{ ...inputStyle, width: "70px" }} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => { if (name && age) onAdd({ name, age, avatar }); }} disabled={!name || !age} style={{ ...btnStyle, background: name && age ? C.red : "#D0C4BA", flex: 1 }}>Add {name || "child"}</button>
        <button onClick={onCancel} style={{ ...btnStyle, background: C.lightGold, color: C.midBrown }}>Cancel</button>
      </div>
    </div>
  );
}

function Bubble({ role, text, childName, age }) {
  const isUser = role === "user"; const bucket = getBucket(age);
  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: "10px", marginBottom: "14px", alignItems: "flex-end" }}>
      {!isUser && <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.darkBrown, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>✝</div>}
      <div style={{ maxWidth: "80%", padding: "12px 15px", borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isUser ? C.darkBrown : "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        {!isUser && <div style={{ fontSize: "10px", color: bucket.color, fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "5px", fontWeight: "600" }}>For {childName}, age {age} - {bucket.range}</div>}
        <p style={{ margin: 0, fontSize: isUser ? "14px" : "15px", color: isUser ? "#F5EDE4" : C.text, fontFamily: "Georgia, serif", lineHeight: "1.65", fontStyle: isUser ? "normal" : "italic" }}>{text}</p>
      </div>
    </div>
  );
}

function AskScreen({ children, setChildren, rite }) {
  const [selected, setSelected] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [convos, setConvos] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const child = children[selected];
  const key = child ? `${child.name}-${child.age}` : null;
  const messages = key ? (convos[key] || []) : [];
  const bucket = child ? getBucket(child.age) : AGE_BUCKETS[1];
  const riteNote = rite === "TLM" ? "Use traditional Catholic language (Our Lord, Blessed Virgin Mary, etc.)." : "";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(q) {
    if (!q.trim() || !child || loading) return;
    setInput("");
    const userMsg = { role: "user", text: q };
    const prev = convos[key] || [];
    setConvos(p => ({ ...p, [key]: [...(p[key] || []), userMsg] }));
    setLoading(true);
    try {
      const history = prev.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const res = await fetch("/api/anthropic", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000,
          system: `You are a warm, faithful Catholic faith guide. ${getAgePrompt(child.age)} ${riteNote} Be theologically sound, warm, never scary. End with a gentle thought. The child's name is ${child.name}.`,
          messages: [...history, { role: "user", content: q }] }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "Something went wrong.";
      setConvos(p => ({ ...p, [key]: [...(p[key] || []), userMsg, { role: "assistant", text }] }));
    } catch {
      setConvos(p => ({ ...p, [key]: [...(p[key] || []), userMsg, { role: "assistant", text: "Something went wrong. Please try again." }] }));
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="ck-light-bg" style={{ background: C.lightGold, borderBottom: `1px solid ${C.border}`, padding: "12px 18px", flexShrink: 0 }}>
        <div style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif", marginBottom: "8px" }}>Who's asking?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          {children.map((c, i) => <ChildPill key={i} child={c} selected={selected === i} onClick={() => setSelected(i)} onRemove={() => { const n = children.filter((_, j) => j !== i); setChildren(n); setSelected(Math.min(selected, n.length - 1)); }} />)}
          {!showAdd && <button onClick={() => setShowAdd(true)} style={{ padding: "7px 12px", borderRadius: "20px", border: `2px dashed ${C.gold}`, background: "transparent", color: C.mutedGold, fontFamily: "Georgia, serif", fontSize: "12px", cursor: "pointer" }}>+ Add child</button>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {showAdd && <AddChildForm onAdd={c => { setChildren(p => [...p, c]); setSelected(children.length); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />}
        {child && <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: bucket.bg, border: `1px solid ${bucket.color}30`, borderRadius: "20px", padding: "5px 12px", marginBottom: "16px" }}>
          <span>{child.avatar}</span>
          <span style={{ fontSize: "12px", color: bucket.color, fontFamily: "Georgia, serif", fontWeight: "600" }}>{child.name}, age {child.age}  --  {bucket.label} ({bucket.range})</span>
        </div>}
        {child && messages.length === 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", color: C.mutedGold, fontFamily: "Georgia, serif", marginBottom: "10px" }}>What is {child.name} wondering about?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {EXAMPLE_QUESTIONS[bucket.id].map((q, i) => <button key={i} onClick={() => send(q)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: "12px", border: `1.5px solid ${bucket.color}40`, background: bucket.bg, color: C.text, fontFamily: "Georgia, serif", fontSize: "14px", cursor: "pointer" }}>"{q}"</button>)}
            </div>
          </div>
        )}
        {messages.map((m, i) => <Bubble key={i} role={m.role} text={m.text} childName={child?.name} age={child?.age} />)}
        {loading && child && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px", alignItems: "flex-end" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.darkBrown, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>✝</div>
            <div style={{ padding: "12px 18px", borderRadius: "16px 16px 16px 4px", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "10px", color: bucket.color, fontFamily: "Georgia, serif", marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "600" }}>Thinking for {child.name}...</div>
              <div style={{ display: "flex", gap: "5px" }}>{[0,1,2].map(i => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.gold, animation: `typingDot 1.4s ${i * 0.2}s infinite ease-in-out` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: "#fff", borderTop: `1px solid ${C.border}`, padding: "12px 18px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea rows={1} placeholder={child ? `What is ${child.name} wondering?` : "Select a child above"} value={input} disabled={!child}
            onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            style={{ ...inputStyle, flex: 1, resize: "none", overflow: "hidden", minHeight: "42px", lineHeight: "1.5" }} />
          <button onClick={() => send(input)} disabled={!input.trim() || loading || !child} style={{ ...btnStyle, background: input.trim() && !loading && child ? C.red : "#D0C4BA", padding: "10px 16px", flexShrink: 0, fontSize: "18px" }}>↑</button>
        </div>
        <div style={{ fontSize: "11px", color: "#B8A090", fontFamily: "Georgia, serif", textAlign: "center", marginTop: "6px" }}>
          Answers shaped for {child ? `${child.name} (age ${child.age})` : "the selected child"} - Faithful to Catholic teaching
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PRAYER HUB
// ═══════════════════════════════════════════════════════════

const NIGHT_PRAYERS = {
  standard: [
    {
      title: "Act of Contrition",
      text: "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, Who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.",
      note: "Pray this together before bed  --  let each child name one thing they're sorry for.",
    },
    {
      title: "Guardian Angel Prayer",
      text: "Angel of God, my guardian dear, to whom God's love commits me here, ever this night be at my side, to light and guard, to rule and guide. Amen.",
      note: "A perfect prayer for little ones  --  remind them their angel is always watching.",
    },
    {
      title: "Night Prayer",
      text: "Visit, we beseech Thee, O Lord, this dwelling, and drive far from it all snares of the enemy. Let Thy holy angels dwell herein to preserve us in peace, and may Thy blessing be upon us evermore. Through Christ our Lord. Amen.",
      note: "From Compline  --  the Church's ancient night prayer.",
    },
  ],
  advent: [
    {
      title: "Advent Night Prayer",
      text: "Come, Lord Jesus. As we wait in joyful hope for Your coming, watch over our family this night. Keep us close to You in the darkness, as the world waits for Your light. Amen.",
      note: "Light one candle of your Advent wreath as you pray this together.",
    },
    {
      title: "O Antiphon Prayer (Dec 17-23)",
      text: "O come, O come, Emmanuel, and ransom captive Israel. Come, Lord, into our home and our hearts. Keep us in Your peace this night. Amen.",
      note: "During the final days of Advent, the Church prays the great O Antiphons.",
    },
  ],
  lent: [
    {
      title: "Lenten Night Prayer",
      text: "Lord Jesus, as we rest this night, we unite our small sacrifices to Your great sacrifice on the Cross. Forgive us our sins. Give us the grace to rise tomorrow renewed in love for You. Amen.",
      note: "Ask each child to name one small sacrifice they offered today.",
    },
    {
      title: "Act of Reparation",
      text: "Sweet Heart of Jesus, be my love. Sweet Heart of Mary, be my salvation. Lord, I am sorry. I love You. Amen.",
      note: "Short enough for the smallest children to memorize and pray from the heart.",
    },
  ],
};

const ROSARY_MYSTERIES = {
  Joyful: [
    {
      n: 1, title: "The Annunciation", scripture: "Luke 1:26-38", fruit: "Humility",
      artist: "Fra Angelico", year: "c. 1438-1445",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Fra_Angelico_-_Annunciation_-_WGA00608.jpg/800px-Fra_Angelico_-_Annunciation_-_WGA00608.jpg",
      meditation: "A young girl in Nazareth is visited by an angel. The most important moment in human history, and God asks. He does not command. He waits for her yes. Close your eyes  --  what does it feel like to say yes to God even when you don't fully understand?",
      childQuestion: "The angel said Mary was full of grace. What do you think grace feels like?",
    },
    {
      n: 2, title: "The Visitation", scripture: "Luke 1:39-45", fruit: "Love of Neighbor",
      artist: "Pontormo", year: "1528-1529",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Pontormo_-_Visitazione_%28Carmignano%29_01.jpg/800px-Pontormo_-_Visitazione_%28Carmignano%29_01.jpg",
      meditation: "Mary, barely pregnant herself, walks across the hill country to help her elderly cousin Elizabeth. She doesn't wait to be asked. She just goes. And when she arrives, the baby in Elizabeth's womb leaps for joy  --  he recognizes his Lord before he is even born.",
      childQuestion: "When someone in our family needs help, what stops us from going to them right away?",
    },
    {
      n: 3, title: "The Nativity", scripture: "Luke 2:1-20", fruit: "Poverty of Spirit",
      artist: "Botticelli", year: "c. 1475",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Botticelli-Nativity-detail.jpg/800px-Botticelli-Nativity-detail.jpg",
      meditation: "The Son of God comes into the world not in a palace but in a stable, not wrapped in silk but in swaddling clothes. The shepherds  --  the poorest men in the fields  --  are the first ones invited. God chooses smallness. He always chooses smallness.",
      childQuestion: "Why do you think God chose to be born in a stable instead of a palace?",
    },
    {
      n: 4, title: "The Presentation in the Temple", scripture: "Luke 2:22-38", fruit: "Obedience",
      artist: "Rembrandt", year: "1631",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Rembrandt_-_Simeon_in_the_Temple_-_WGA19105.jpg/800px-Rembrandt_-_Simeon_in_the_Temple_-_WGA19105.jpg",
      meditation: "An old man named Simeon had waited his whole life to see the Messiah. When Mary placed the infant Jesus in his arms, he wept and said he could now die in peace. He had waited, faithfully, for decades. God's timing is never early and never late.",
      childQuestion: "Is there something you are waiting and hoping for? How does it feel to wait?",
    },
    {
      n: 5, title: "The Finding in the Temple", scripture: "Luke 2:41-52", fruit: "Piety",
      artist: "Hofmann", year: "1881",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Christ_in_the_Temple_%28Hofmann%29.jpg/800px-Christ_in_the_Temple_%28Hofmann%29.jpg",
      meditation: "Mary and Joseph search for three days before finding Jesus  --  a twelve-year-old  --  sitting among the teachers in the Temple, listening and asking questions. He says simply: did you not know I must be about my Father's business? He was always at home in His Father's house.",
      childQuestion: "Jesus loved being in the Temple, in His Father's house. How do you feel when you're at Mass?",
    },
  ],
  Sorrowful: [
    {
      n: 1, title: "The Agony in the Garden", scripture: "Luke 22:39-46", fruit: "Contrition",
      artist: "El Greco", year: "c. 1590",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/El_Greco_-_The_Agony_in_the_Garden_-_WGA10554.jpg/800px-El_Greco_-_The_Agony_in_the_Garden_-_WGA10554.jpg",
      meditation: "It is the middle of the night. Jesus prays alone in a garden while his friends sleep nearby. He knows what is coming. His sweat falls like drops of blood. And still He says: not my will, but Thine. This is the prayer that saves the world.",
      childQuestion: "Have you ever had to do something hard even though you were frightened? What gave you courage?",
    },
    {
      n: 2, title: "The Scourging at the Pillar", scripture: "Mark 15:15", fruit: "Mortification",
      artist: "Caravaggio", year: "1607",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Caravaggio_-_Flagellazione.jpg/800px-Caravaggio_-_Flagellazione.jpg",
      meditation: "He who spoke the universe into existence stands bound to a pillar and does not speak a word. He takes this suffering for every sin ever committed, for every person who would ever live. He takes it for you. He takes it for me.",
      childQuestion: "Jesus suffered even though He had done nothing wrong. Has that ever happened to you? What did it feel like?",
    },
    {
      n: 3, title: "The Crowning with Thorns", scripture: "Mark 15:16-20", fruit: "Moral Courage",
      artist: "Titian", year: "c. 1542",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Tizian_081.jpg/800px-Tizian_081.jpg",
      meditation: "They mock Him as a king, pressing thorns into His head. Yet He is a king  --  the King of Kings. He accepts the mockery in silence. Every time we do what is right even when people laugh at us, we share in this mystery.",
      childQuestion: "Has anyone ever made fun of you for doing the right thing? What happened?",
    },
    {
      n: 4, title: "The Carrying of the Cross", scripture: "Luke 23:26-31", fruit: "Patience",
      artist: "El Greco", year: "c. 1580",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/El_Greco_-_Christ_Carrying_the_Cross_-_WGA10581.jpg/800px-El_Greco_-_Christ_Carrying_the_Cross_-_WGA10581.jpg",
      meditation: "He falls. He gets up. He falls again. Simon of Cyrene is pulled from the crowd to help carry the cross  --  a man who had no intention of being there. Sometimes God chooses us for things we did not plan. And the cross we carry together is lighter.",
      childQuestion: "When something is really heavy and hard, who helps you carry it?",
    },
    {
      n: 5, title: "The Crucifixion", scripture: "Luke 23:44-46", fruit: "Perseverance",
      artist: "Velázquez", year: "1632",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Velazquez-cristo.jpg/800px-Velazquez-cristo.jpg",
      meditation: "It is finished. Three hours of darkness, the veil of the Temple torn in two, the earth shaking. The centurion says: truly this was the Son of God. In the moment of total defeat, the greatest victory in history is won. Death itself begins to die.",
      childQuestion: "Jesus said 'It is finished.' What do you think He meant? What was finished?",
    },
  ],
  Glorious: [
    {
      n: 1, title: "The Resurrection", scripture: "Luke 24:1-12", fruit: "Faith",
      artist: "Piero della Francesca", year: "c. 1463",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Piero_della_Francesca_-_Resurrection_of_Christ_-_WGA17604.jpg/800px-Piero_della_Francesca_-_Resurrection_of_Christ_-_WGA17604.jpg",
      meditation: "Early on the first day of the week, before dawn, the women come to the tomb. The stone is rolled away. The tomb is empty. Two angels say: He is not here. He is risen. Everything changes. Death no longer has the last word. It never will again.",
      childQuestion: "If death isn't the end anymore, how does that change how we should live today?",
    },
    {
      n: 2, title: "The Ascension", scripture: "Acts 1:6-11", fruit: "Hope",
      artist: "Rembrandt", year: "1636",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Rembrandt_-_The_Ascension_of_Christ_-_WGA19145.jpg/800px-Rembrandt_-_The_Ascension_of_Christ_-_WGA19145.jpg",
      meditation: "He rises up from their sight into the clouds, and the disciples stand staring up into the sky. Two angels appear: why are you standing there looking up? He will come back the same way He left. Now go. There is work to do. His leaving is not an ending  --  it is a sending.",
      childQuestion: "The disciples must have been sad to see Jesus go. Why do you think He said it was better for Him to go?",
    },
    {
      n: 3, title: "The Descent of the Holy Ghost", scripture: "Acts 2:1-11", fruit: "Gifts of the Holy Ghost",
      artist: "El Greco", year: "c. 1600",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/El_Greco_-_Pentecost_-_WGA10581.jpg/800px-El_Greco_-_Pentecost_-_WGA10581.jpg",
      meditation: "They are gathered together, still frightened, behind locked doors. Then a sound like rushing wind fills the whole house, and tongues of fire come to rest on each of them. They go out into the streets and everyone hears them  --  in their own language. The Church is born.",
      childQuestion: "The Holy Ghost gives gifts  --  wisdom, courage, understanding. Which gift do you think your family needs most right now?",
    },
    {
      n: 4, title: "The Assumption of Our Lady", scripture: "Rev 12:1", fruit: "Grace of a Happy Death",
      artist: "Titian", year: "1516-1518",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Tizian_-_Assunta.jpg/800px-Tizian_-_Assunta.jpg",
      meditation: "At the end of her life on earth, Our Lady is taken body and soul into heaven. She did not have to wait for the resurrection  --  she is already there, wholly herself, body and soul, praying for us. She is our mother in heaven. She sees us right now.",
      childQuestion: "Our Lady is watching over our family right now from heaven. What would you want to say to her?",
    },
    {
      n: 5, title: "The Coronation of Our Lady", scripture: "Rev 12:1", fruit: "Trust in Mary's Intercession",
      artist: "Fra Angelico", year: "c. 1434-1435",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Fra_Angelico_-_Coronation_of_the_Virgin_-_WGA00619.jpg/800px-Fra_Angelico_-_Coronation_of_the_Virgin_-_WGA00619.jpg",
      meditation: "The humble girl from Nazareth who said yes to God is crowned Queen of Heaven and Earth. Every saint is there. All of heaven rejoices. This is where the rosary ends  --  not in sorrow but in triumph. And she is still our mother, interceding for each one of us by name.",
      childQuestion: "Our Lady is Queen of Heaven  --  and she is also your mother. How does it feel to know you have a mother in heaven?",
    },
  ],
};

// Traditional mystery assignments (no Luminous)
function getRosaryMystery(date) {
  const day = date.getDay(); // 0=Sun
  if (day === 0 || day === 3) return "Glorious"; // Sun & Wed
  if (day === 1 || day === 6) return "Joyful";   // Mon & Sat
  if (day === 2 || day === 5) return "Sorrowful"; // Tue & Fri
  return "Glorious"; // Thu
}

const ANGELUS = {
  title: "The Angelus",
  note: "Prayed at 6am, noon, and 6pm. The bell rings three times for each versicle.",
  verses: [
    { v: "V.", text: "The Angel of the Lord declared unto Mary:" },
    { v: "R.", text: "And she conceived of the Holy Ghost." },
    { v: "", text: "Hail Mary, full of grace..." },
    { v: "V.", text: "Behold the handmaid of the Lord:" },
    { v: "R.", text: "Be it done unto me according to Thy word." },
    { v: "", text: "Hail Mary, full of grace..." },
    { v: "V.", text: "And the Word was made Flesh:" },
    { v: "R.", text: "And dwelt among us." },
    { v: "", text: "Hail Mary, full of grace..." },
    { v: "V.", text: "Pray for us, O holy Mother of God:" },
    { v: "R.", text: "That we may be made worthy of the promises of Christ." },
  ],
  collect: "Pour forth, we beseech Thee, O Lord, Thy grace into our hearts; that we, to whom the Incarnation of Christ, Thy Son, was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection, through the same Christ Our Lord. Amen.",
};

const SEASONAL_PRAYERS = {
  Advent: {
    icon: "🕯️",
    title: "Advent Prayer",
    subtitle: "Maranatha  --  Come, Lord Jesus",
    prayers: [
      { title: "Come, Lord Jesus", text: "Come, Lord Jesus, do not delay; give new courage to your people who trust in your love. By your coming, raise us to the joy of your kingdom, where you live and reign with the Father and the Holy Spirit, one God, for ever and ever. Amen." },
      { title: "Rorate Caeli (Drop Down Dew)", text: "Drop down dew, ye heavens, from above, and let the clouds rain the Just One; let the earth be opened and bud forth a Saviour. Do not be angry, O Lord, and remember no longer our iniquity; behold, the city of Thy sanctuary is become a desert; Sion is made a desert, Jerusalem is desolate. Amen." },
    ],
  },
  Lent: {
    icon: "✝️",
    title: "Lenten Prayer",
    subtitle: "A season of penance and renewal",
    prayers: [
      { title: "Stations of the Cross Opening", text: "My Lord Jesus Christ, Thou hast made this journey to die for me with love unutterable, and I have so many times unworthily abandoned Thee; but now I love Thee with my whole heart, and because I love Thee I am sincerely sorry for ever having offended Thee. Pardon me, my God, and permit me to accompany Thee on this journey. Amen." },
      { title: "Prayer for a Fruitful Lent", text: "Lord, be with us this Lent. Help our family to fast with joy, to pray with attention, and to give with generosity. May these forty days draw us closer to You and to each other. Through Christ our Lord. Amen." },
    ],
  },
  Septuagesima: {
    icon: "🌿",
    title: "Pre-Lenten Prayer",
    subtitle: "Preparing our hearts",
    prayers: [
      { title: "Prayer for Preparation", text: "O Lord, as the Church prepares us for the sacred season of Lent, help our family to examine our hearts, set aside what distracts us from You, and grow in love. May these days of Septuagesima be a quiet preparation for the graces You have in store for us. Amen." },
    ],
  },
  Passiontide: {
    icon: "🩸",
    title: "Passiontide Prayer",
    subtitle: "The last two weeks before Easter",
    prayers: [
      { title: "Before a Crucifix", text: "Behold, O good and sweetest Jesus, I cast myself upon my knees in Thy sight, and with the most fervent desire of my soul I pray and beseech Thee that Thou wouldst impress upon my heart lively sentiments of faith, hope and charity, with true repentance for my sins and a firm desire of amendment. Amen." },
    ],
  },
  Easter: {
    icon: "✨",
    title: "Easter Prayer",
    subtitle: "He is risen  --  Alleluia!",
    prayers: [
      { title: "Easter Family Prayer", text: "Lord Jesus, You have conquered death and opened for us the gates of eternal life. Fill our home with Easter joy. May we live every day as people of the Resurrection  --  hopeful, joyful, and unafraid. Alleluia! Amen." },
    ],
  },
  Christmastide: {
    icon: "⭐",
    title: "Christmas Prayer",
    subtitle: "The Word made Flesh",
    prayers: [
      { title: "Before the Nativity Scene", text: "Lord Jesus, born for us in Bethlehem, we welcome You into our home and our hearts. As the shepherds and Magi came to adore You, may our family always seek Your face. Be the center of our home, now and always. Amen." },
    ],
  },
};

function PrayerSection({ icon, label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "#fff", borderRadius: "16px", marginBottom: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `3px solid ${C.gold}` }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>{icon}</span>
          <span style={{ fontSize: "14px", fontFamily: "Georgia, serif", fontWeight: "600", color: C.midBrown }}>{label}</span>
        </div>
        <span style={{ fontSize: "18px", color: C.mutedGold, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</span>
      </button>
      {open && <div style={{ padding: "0 20px 18px" }}>{children}</div>}
    </div>
  );
}

function BeadCounter({ beads, onBead, onReset }) {
  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>
          {beads === 0 ? "Tap each bead as you pray" : beads < 10 ? `${beads} of 10 Hail Marys` : "Decade complete"}
        </span>
        <button onClick={onReset} style={{ fontSize: "11px", color: C.mutedGold, background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif" }}>Reset</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        {Array.from({ length: 10 }, (_, i) => (
          <button key={i} onClick={() => i === beads && onBead()} style={{
            width: "28px", height: "28px", borderRadius: "50%", border: "none", cursor: i === beads ? "pointer" : "default",
            background: i < beads ? C.darkBrown : i === beads ? C.gold : C.lightGold,
            transition: "all 0.2s",
            boxShadow: i === beads ? `0 0 0 3px ${C.gold}44` : "none",
          }} />
        ))}
      </div>
      {beads >= 10 && (
        <div style={{ padding: "10px 14px", background: "#EDF4EF", borderRadius: "10px", fontSize: "13px", color: C.green, fontFamily: "Georgia, serif", fontWeight: "600", textAlign: "center" }}>
          ✓ Decade complete  --  Glory be to the Father...
        </div>
      )}
    </div>
  );
}

function MysteryCard({ m, isOpen, onToggle }) {
  const [beads, setBeads] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="ck-mystery-bg" style={{ marginBottom: "12px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", border: `1px solid ${C.border}` }}>
      {/* Mystery header */}
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: isOpen ? C.darkBrown : "#fff", border: "none", cursor: "pointer", transition: "background 0.2s" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: isOpen ? C.gold : C.darkBrown, display: "flex", alignItems: "center", justifyContent: "center", color: isOpen ? C.darkBrown : C.gold, fontSize: "13px", fontWeight: "700", fontFamily: "Georgia, serif", flexShrink: 0 }}>{m.n}</div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: isOpen ? "#fff" : C.midBrown, fontFamily: "Georgia, serif" }}>{m.title}</div>
          <div style={{ fontSize: "11px", color: isOpen ? C.gold : C.mutedGold, fontFamily: "Georgia, serif" }}>{m.scripture} - Fruit: {m.fruit}</div>
        </div>
        <span style={{ color: isOpen ? C.gold : C.mutedGold, fontSize: "18px", transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>›</span>
      </button>

      {isOpen && (
        <div>
          {/* Masterwork image */}
          {!imgError && (
            <div style={{ position: "relative", width: "100%", height: "220px", background: "#111b30", overflow: "hidden" }}>
              {!imgLoaded && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${C.gold}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                  <div style={{ fontSize: "11px", color: C.gold, fontFamily: "Georgia, serif", opacity: 0.7 }}>Loading artwork...</div>
                </div>
              )}
              <img
                src={m.img}
                alt={`${m.title} by ${m.artist}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s" }}
              />
              {imgLoaded && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.75))", padding: "20px 14px 10px" }}>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>{m.artist}, {m.year}</div>
                </div>
              )}
            </div>
          )}

          <div style={{ padding: "16px" }}>
            {/* Meditation */}
            <p style={{ fontSize: "15px", color: C.text, fontFamily: "Georgia, serif", lineHeight: "1.75", margin: "0 0 14px", fontStyle: "italic" }}>
              {m.meditation}
            </p>

            {/* Child question */}
            <div style={{ background: "#f0f4fa", borderRadius: "10px", padding: "12px 14px", marginBottom: "4px", borderLeft: `3px solid ${C.gold}` }}>
              <div style={{ fontSize: "10px", color: C.mutedGold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px", fontFamily: "Georgia, serif" }}>For the children</div>
              <p style={{ fontSize: "13px", color: C.midBrown, fontFamily: "Georgia, serif", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>{m.childQuestion}</p>
            </div>

            {/* Bead counter */}
            <BeadCounter beads={beads} onBead={() => setBeads(b => Math.min(b + 1, 10))} onReset={() => setBeads(0)} />
          </div>
        </div>
      )}
    </div>
  );
}

function PrayerHub({ rite, feast, selectedDate, nightMode = false, FS = 1 }) {
  const mystery = getRosaryMystery(selectedDate);
  const mysteries = ROSARY_MYSTERIES[mystery];
  const [activeMystery, setActiveMystery] = useState(null);
  const season = feast?.season || "Ordinary Time";
  const seasonalPrayer = SEASONAL_PRAYERS[season];

  const isAdvent = season === "Advent";
  const isLent = season === "Lent" || season === "Passiontide" || season === "Septuagesima";
  const nightPrayers = isAdvent ? [...NIGHT_PRAYERS.advent, ...NIGHT_PRAYERS.standard]
    : isLent ? [...NIGHT_PRAYERS.lent, ...NIGHT_PRAYERS.standard]
    : NIGHT_PRAYERS.standard;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div style={{ padding: "16px 16px 32px", overflowY: "auto", background: nightMode ? "#0d1117" : "transparent" }}>

      {/* Confession Guide — leads the Prayers tab */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
          <span style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sacrament of Penance</span>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
        </div>
        <ConfessionGuide rite={rite} nightMode={nightMode} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ flex: 1, height: "1px", background: C.border }} />
        <span style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Family Prayers</span>
        <div style={{ flex: 1, height: "1px", background: C.border }} />
      </div>

      {/* Tonight's Prayer */}
      <div style={{ background: `linear-gradient(135deg, #111b30 0%, #1a2744 100%)`, borderRadius: "18px", padding: "20px 22px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -15, right: -15, fontSize: "70px", opacity: 0.06 }}>🌙</div>
        <div style={{ fontSize: "11px", color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Tonight's Prayer</div>
        <div style={{ fontSize: "18px", color: "#fff", fontWeight: "700", marginBottom: "14px" }}>{nightPrayers[0].title}</div>
        <p style={{ fontSize: "14px", color: "#d4cfc8", lineHeight: "1.75", fontStyle: "italic", fontFamily: "Georgia, serif", margin: "0 0 12px" }}>
          "{nightPrayers[0].text}"
        </p>
        <div style={{ fontSize: "12px", color: C.gold, fontFamily: "Georgia, serif", fontStyle: "italic" }}>{nightPrayers[0].note}</div>
      </div>

      {/* More night prayers */}
      <PrayerSection icon="🌙" label="More Night Prayers">
        {nightPrayers.slice(1).map((p, i) => (
          <div key={i} style={{ marginBottom: i < nightPrayers.length - 2 ? "16px" : 0, paddingBottom: i < nightPrayers.length - 2 ? "16px" : 0, borderBottom: i < nightPrayers.length - 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: C.midBrown, fontFamily: "Georgia, serif", marginBottom: "6px" }}>{p.title}</div>
            <p style={{ fontSize: "13px", color: C.text, lineHeight: "1.7", fontStyle: "italic", fontFamily: "Georgia, serif", margin: "0 0 6px" }}>"{p.text}"</p>
            <div style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>{p.note}</div>
          </div>
        ))}
      </PrayerSection>

      {/* Rosary  --  artwork meditation experience */}
      <div className="ck-card" style={{ background: "#fff", borderRadius: "16px", marginBottom: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `3px solid ${C.gold}` }}>
        <div style={{ padding: "16px 20px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "18px" }}>📿</span>
            <span style={{ fontSize: "14px", fontFamily: "Georgia, serif", fontWeight: "600", color: C.midBrown }}>The Holy Rosary</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ fontSize: "12px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>
              {dayNames[selectedDate.getDay()]} - {mystery} Mysteries - Traditional
            </div>
          </div>
          <div style={{ fontSize: "12px", color: C.mutedGold, fontFamily: "Georgia, serif", marginTop: "8px", fontStyle: "italic" }}>
            Open each mystery for artwork, meditation, and a bead counter. The prayers you already know by heart.
          </div>
        </div>
        <div style={{ padding: "0 12px 12px" }}>
          {mysteries.map((m, i) => (
            <MysteryCard
              key={i}
              m={m}
              isOpen={activeMystery === i}
              onToggle={() => setActiveMystery(activeMystery === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* Angelus */}
      <PrayerSection icon="🔔" label="The Angelus">
        <div style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif", marginBottom: "12px", fontStyle: "italic" }}>{ANGELUS.note}</div>
        {ANGELUS.verses.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            {v.v && <span style={{ fontSize: "12px", fontWeight: "700", color: C.gold, fontFamily: "Georgia, serif", minWidth: "16px", paddingTop: "2px" }}>{v.v}</span>}
            <p style={{ fontSize: "13px", color: v.v ? C.text : C.mutedGold, fontFamily: "Georgia, serif", lineHeight: "1.6", margin: 0, fontStyle: v.v ? "normal" : "italic" }}>{v.text}</p>
          </div>
        ))}
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif", marginBottom: "6px" }}>Collect</div>
          <p style={{ fontSize: "13px", color: C.text, fontFamily: "Georgia, serif", lineHeight: "1.7", fontStyle: "italic", margin: 0 }}>"{ANGELUS.collect}"</p>
        </div>
      </PrayerSection>

      {/* Seasonal prayer */}
      {seasonalPrayer && (
        <PrayerSection icon={seasonalPrayer.icon} label={seasonalPrayer.title} defaultOpen={true}>
          <div style={{ fontSize: "12px", color: C.mutedGold, fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: "14px" }}>{seasonalPrayer.subtitle}</div>
          {seasonalPrayer.prayers.map((p, i) => (
            <div key={i} style={{ marginBottom: i < seasonalPrayer.prayers.length - 1 ? "16px" : 0, paddingBottom: i < seasonalPrayer.prayers.length - 1 ? "16px" : 0, borderBottom: i < seasonalPrayer.prayers.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: C.midBrown, fontFamily: "Georgia, serif", marginBottom: "8px" }}>{p.title}</div>
              <p style={{ fontSize: "13px", color: C.text, fontFamily: "Georgia, serif", lineHeight: "1.75", fontStyle: "italic", margin: 0 }}>"{p.text}"</p>
            </div>
          ))}
        </PrayerSection>
      )}


    </div>
  );
}



// ═══════════════════════════════════════════════════════════
// CONFESSION GUIDE
// ═══════════════════════════════════════════════════════════

const EXAM_DATA = {
  "6-7": {
    label: "First Confession",
    ageRange: "Ages 6-7",
    color: "#4A7C59",
    bg: "#EDF4EF",
    intro: "Before Confession, we look at our hearts and remember the times we chose wrong. Tap each thing that is true for you. Nobody else will see this.",
    categories: [
      { id: "god", label: "God and Prayer", icon: "praying_hands",
        items: [
          { id: "g1", text: "I forgot to say my prayers." },
          { id: "g2", text: "I missed Mass on Sunday." },
          { id: "g3", text: "I used God's name as a bad word." },
          { id: "g4", text: "I put games or screens before God." },
        ]
      },
      { id: "family", label: "My Family", icon: "house",
        items: [
          { id: "f1", text: "I disobeyed Mum or Dad." },
          { id: "f2", text: "I was rude or talked back to my parents." },
          { id: "f3", text: "I was mean to my brothers or sisters on purpose." },
        ]
      },
      { id: "others", label: "Other People", icon: "star",
        items: [
          { id: "o1", text: "I hit, kicked, or hurt someone on purpose." },
          { id: "o2", text: "I said something mean to make someone feel bad." },
          { id: "o3", text: "I left someone out or was unkind to them." },
        ]
      },
      { id: "truth", label: "Honesty", icon: "sparkles",
        items: [
          { id: "t1", text: "I told a lie to stay out of trouble." },
          { id: "t2", text: "I took something that was not mine." },
          { id: "t3", text: "I broke something and did not tell the truth about it." },
        ]
      },
    ],
    actOfContrition: "O my God, I am sorry for all my sins. I am sorry because sin offends You, and You are so good. With Your help, I will try not to sin again. Amen.",
    steps: [
      { n: "1", title: "Enter and kneel", body: "Kneel down. Make the Sign of the Cross." },
      { n: "2", title: "Begin", body: "Say: 'Bless me Father, for I have sinned. This is my first Confession.' (Or: 'My last Confession was ... ago.')" },
      { n: "3", title: "Tell your sins", body: "Read your list. Say each sin. You do not have to say every detail -- just what happened." },
      { n: "4", title: "Listen", body: "The priest will speak kindly to you. He will give you a penance -- some prayers to say." },
      { n: "5", title: "Act of Contrition", body: "The priest will ask you to say you are sorry. Pray your Act of Contrition slowly." },
      { n: "6", title: "Absolution", body: "The priest raises his hand. God forgives ALL your sins completely. Make the Sign of the Cross." },
      { n: "7", title: "Thank you", body: "Say 'Thank you Father.' Go back to your seat. Talk to God. Do your penance." },
    ],
  },
  "8-10": {
    label: "Growing in Conscience",
    ageRange: "Ages 8-10",
    color: "#5B6FA6",
    bg: "#EEF0FA",
    intro: "Take your time. Think about each question honestly. Tap everything that applies. Ask the Holy Ghost to help you see your heart clearly.",
    categories: [
      { id: "god", label: "God and Prayer", icon: "praying_hands",
        items: [
          { id: "g1", text: "I was not honest in my prayers -- just saying words without meaning them." },
          { id: "g2", text: "I missed Mass on Sunday or a Holy Day without a serious reason." },
          { id: "g3", text: "I used God's name carelessly or as a bad word." },
          { id: "g4", text: "I put something else before God -- games, a friend, anything." },
          { id: "g5", text: "I looked at or listened to things I knew were wrong." },
        ]
      },
      { id: "family", label: "My Family", icon: "house",
        items: [
          { id: "f1", text: "I disobeyed my parents, even when I thought they were wrong." },
          { id: "f2", text: "I was deliberately unkind to a brother or sister." },
          { id: "f3", text: "I was rude or disrespectful to my parents." },
          { id: "f4", text: "I did not do my duties -- chores, schoolwork -- as well as I could." },
        ]
      },
      { id: "words", label: "My Words", icon: "speaking",
        items: [
          { id: "w1", text: "I told a lie, even a small one." },
          { id: "w2", text: "I said something unkind or untrue about someone else." },
          { id: "w3", text: "I used bad language." },
          { id: "w4", text: "I broke a promise." },
        ]
      },
      { id: "actions", label: "My Actions", icon: "star",
        items: [
          { id: "a1", text: "I hurt someone physically on purpose." },
          { id: "a2", text: "I stole or took something without permission." },
          { id: "a3", text: "I left someone out or helped bully them." },
          { id: "a4", text: "I saw someone who needed help and looked away." },
        ]
      },
      { id: "heart", label: "My Heart", icon: "heart",
        items: [
          { id: "h1", text: "I had angry or hateful thoughts about someone." },
          { id: "h2", text: "I was proud and thought I was better than others." },
          { id: "h3", text: "I refused to forgive someone who hurt me." },
          { id: "h4", text: "I was jealous of what someone else had." },
          { id: "h5", text: "I had thoughts I knew were impure." },
        ]
      },
      { id: "omission", label: "Things I Failed to Do", icon: "praying_hands",
        items: [
          { id: "om1", text: "There was a good I could have done and chose not to." },
          { id: "om2", text: "Someone needed my kindness or courage and I stayed silent." },
          { id: "om3", text: "I hid my faith or was ashamed of being Catholic." },
        ]
      },
    ],
    actOfContrition: "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, Who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.",
    steps: [
      { n: "1", title: "Prepare your heart", body: "Before going in, ask the Holy Ghost: 'Come, Holy Ghost, help me make a good Confession.'" },
      { n: "2", title: "Enter and begin", body: "Kneel. Make the Sign of the Cross. Say: 'Bless me Father, for I have sinned. My last Confession was [how long ago]. These are my sins.'" },
      { n: "3", title: "Confess completely", body: "Read your list clearly. For serious sins, say what it was and roughly how many times. The priest is there to help you, not judge you." },
      { n: "4", title: "Accept your penance", body: "The priest gives you a penance. Accept it with gratitude and do it as soon as possible -- ideally before leaving the church." },
      { n: "5", title: "Act of Contrition", body: "Pray it slowly. Mean every word. Sorrow for love of God -- not just fear of punishment -- is the heart of a good Confession." },
      { n: "6", title: "Absolution", body: "'Ego te absolvo a peccatis tuis in nomine Patris et Filii et Spiritus Sancti.' Your sins are gone. Completely. Forever." },
      { n: "7", title: "Give thanks", body: "Thank the priest. Return to your seat. Speak to Our Lord. Do your penance. Go in peace." },
    ],
  },
};

const ICON_MAP = {
  praying_hands: "praying_hands",
  house: "house",
  star: "star",
  sparkles: "sparkles",
  speaking: "speaking",
  heart: "heart",
};

const ICON_EMOJI = {
  praying_hands: "prayer",
  house: "family",
  star: "others",
  sparkles: "honesty",
  speaking: "words",
  heart: "heart",
};


// ── Print helpers ──────────────────────────────────────────



function CopyPrintButtons({ onPrint, onCopy }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button onClick={onPrint} style={{
        display: "flex", alignItems: "center", gap: "4px",
        background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "20px", padding: "5px 11px", cursor: "pointer",
      }}>
        <span style={{ fontSize: "11px", color: "#fff", fontFamily: "Georgia, serif", fontWeight: "600" }}>Print</span>
      </button>
      <button onClick={handleCopy} style={{
        display: "flex", alignItems: "center", gap: "4px",
        background: copied ? "#4A7C59" : "#c9a96e",
        border: "none", borderRadius: "20px",
        padding: "5px 11px", cursor: "pointer", transition: "background 0.2s",
      }}>
        <span style={{ fontSize: "11px", color: "#1a2744", fontFamily: "Georgia, serif", fontWeight: "700" }}>
          {copied ? "Copied!" : "Copy"}
        </span>
      </button>
    </div>
  );
}

function copyConfessionList(items, actOfContrition) {
  const lines = ["MY SINS", "--------", ""];
  items.forEach(item => lines.push("+ " + item.text));
  lines.push("");
  lines.push("ACT OF CONTRITION");
  lines.push("-----------------");
  lines.push(actOfContrition);
  lines.push("");
  lines.push("(Tear up and destroy this paper after Confession.)");
  const text = lines.join("\n");
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand("copy");
    document.body.removeChild(el);
  });
}

function copyConfessionCard(data, rite) {
  const lines = ["HOW TO GO TO CONFESSION", "=======================", ""];
  data.steps.forEach(step => {
    lines.push(step.n + ". " + step.title.toUpperCase());
    lines.push(step.body);
    lines.push("");
  });
  lines.push("ACT OF CONTRITION");
  lines.push("-----------------");
  lines.push(data.actOfContrition);
  if (rite === "TLM") {
    lines.push("");
    lines.push("WORDS OF ABSOLUTION (Traditional Form)");
    lines.push('"Ego te absolvo a peccatis tuis in nomine Patris et Filii et Spiritus Sancti. Amen."');
    lines.push('"I absolve thee of thy sins in the Name of the Father, and of the Son, and of the Holy Ghost. Amen."');
  }
  lines.push("");
  lines.push('"There is more joy in heaven over one sinner who repents." -- Luke 15:7');
  const text = lines.join("\n");
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand("copy");
    document.body.removeChild(el);
  });
}

function printConfessionList(items, actOfContrition) {
  const rows = items.map(item =>
    '<div style="display:flex;gap:10px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px dashed #ccc;">' +
    '<span style="font-size:14px;color:#333;margin-top:2px;">+</span>' +
    '<p style="margin:0;font-size:14px;font-family:Georgia,serif;line-height:1.6;color:#1a1a1a;">' + item.text + '</p>' +
    '</div>'
  ).join('');

  const html = `<!DOCTYPE html><html><head><title>My Confession List</title>
  <style>
    body { font-family: Georgia, serif; max-width: 400px; margin: 40px auto; padding: 20px; }
    h2 { font-size: 18px; color: #1a2744; text-align: center; margin-bottom: 4px; }
    .sub { font-size: 11px; color: #9a8060; text-align: center; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 24px; }
    .contrition { margin-top: 20px; padding-top: 16px; border-top: 2px solid #e0d0b0; }
    .contrition-label { font-size: 10px; color: #9a8060; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
    .contrition-text { font-size: 13px; line-height: 1.75; font-style: italic; color: #1a1a1a; }
    .destroy { margin-top: 24px; font-size: 11px; color: #9a8060; text-align: center; font-style: italic; }
    @media print { .destroy { display: block; } }
  </style></head><body>
  <h2>My Sins</h2>
  <div class="sub">Private -- for Confession only</div>
  ${rows}
  <div class="contrition">
    <div class="contrition-label">Act of Contrition</div>
    <div class="contrition-text">${actOfContrition}</div>
  </div>
  <div class="destroy">Tear up and destroy this paper after Confession.</div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=500,height=700');
  if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
}

function printConfessionCard(data, rite) {
  const stepsHtml = data.steps.map(step =>
    '<div style="display:flex;gap:12px;margin-bottom:14px;">' +
    '<div style="width:26px;height:26px;border-radius:50%;background:#1a2744;color:#c9a96e;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">' + step.n + '</div>' +
    '<div><div style="font-size:13px;font-weight:700;color:#1a2744;margin-bottom:3px;">' + step.title + '</div>' +
    '<div style="font-size:12px;color:#444;line-height:1.6;">' + step.body + '</div></div>' +
    '</div>'
  ).join('');

  const absolution = rite === 'TLM' ? `
    <div style="background:#f0ebe0;border-radius:8px;padding:12px 14px;margin-top:14px;">
      <div style="font-size:10px;color:#9a8060;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:6px;">Words of Absolution</div>
      <div style="font-size:12px;font-style:italic;color:#1a2744;line-height:1.7;margin-bottom:6px;">"Ego te absolvo a peccatis tuis in nomine Patris et Filii et Spiritus Sancti. Amen."</div>
      <div style="font-size:11px;color:#7a7060;line-height:1.6;">"I absolve thee of thy sins in the Name of the Father, and of the Son, and of the Holy Ghost. Amen."</div>
    </div>` : '';

  const html = `<!DOCTYPE html><html><head><title>Confession Card</title>
  <style>
    body { font-family: Georgia, serif; max-width: 380px; margin: 30px auto; padding: 0; }
    .card { border: 2px solid #1a2744; border-radius: 12px; overflow: hidden; }
    .card-header { background: #1a2744; padding: 14px 18px; text-align: center; }
    .card-header h2 { margin: 0; font-size: 16px; color: #fff; }
    .card-header p { margin: 4px 0 0; font-size: 11px; color: #c9a96e; letter-spacing: 0.08em; text-transform: uppercase; }
    .card-body { padding: 18px 20px; }
    .divider { height: 1px; background: #e0d8c8; margin: 16px 0; }
    .label { font-size: 10px; color: #9a8060; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 8px; }
    .contrition { font-size: 12px; line-height: 1.75; font-style: italic; color: #1a1a1a; }
    .card-footer { background: #f5f0e8; padding: 10px 18px; text-align: center; border-top: 1px solid #e0d8c8; font-size: 11px; color: #9a8060; font-style: italic; }
    @media print { body { margin: 10px auto; } }
  </style></head><body>
  <div class="card">
    <div class="card-header">
      <p>The Sacrament of Penance</p>
      <h2>How to Go to Confession</h2>
    </div>
    <div class="card-body">
      ${stepsHtml}
      <div class="divider"></div>
      <div class="label">Act of Contrition</div>
      <div class="contrition">${data.actOfContrition}</div>
      ${absolution}
    </div>
    <div class="card-footer">"There is more joy in heaven over one sinner who repents." -- Luke 15:7</div>
  </div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=500,height=750');
  if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
}

function ConfessionGuide({ rite, nightMode }) {
  const [ageKey, setAgeKey] = useState("6-7");
  const [screen, setScreen] = useState("home");
  useEffect(() => {
    document.querySelectorAll(".ck-scroll").forEach(el => { el.scrollTop = 0; });
    let el = document.querySelector(".ck-scroll");
    while (el) { el.scrollTop = 0; el = el.parentElement; }
  }, [screen]);
  const [selected, setSelected] = useState({});
  const data = EXAM_DATA[ageKey];

  const nm = nightMode ? {
    bg: "#0d1117", surface: "#161b22", text: "#e6edf3",
    muted: "#8b949e", border: "#30363d", card: "#1c2128",
  } : {
    bg: "transparent", surface: "#fff", text: "#1a2744",
    muted: "#9a8060", border: "#E0D5C8", card: "#f5f0e8",
  };

  function toggleItem(catId, itemId) {
    const key = catId + ":" + itemId;
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function getSelectedItems() {
    return data.categories.flatMap(cat =>
      cat.items.filter(item => selected[cat.id + ":" + item.id])
        .map(item => ({ category: cat.label, text: item.text }))
    );
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  // HOME screen
  if (screen === "home") return (
    <div style={{ padding: "16px 16px 32px", background: nm.bg }}>
      <div style={{ background: "linear-gradient(135deg, #111b30 0%, #1a2744 100%)", borderRadius: "18px", padding: "20px 22px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: "80px", opacity: 0.07 }}>+</div>
        <div style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Sacrament of Penance</div>
        <div style={{ fontSize: "20px", color: "#fff", fontWeight: "700", marginBottom: "8px" }}>Confession Guide</div>
        <div style={{ fontSize: "13px", color: "#d4cfc8", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          "Be reconciled to God." -- 2 Cor 5:20
        </div>
      </div>

      {/* Age selector */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: nm.muted, fontFamily: "Georgia, serif", marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Who is preparing?</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {Object.entries(EXAM_DATA).map(([key, d]) => (
            <button key={key} onClick={() => { setAgeKey(key); setSelected({}); }} style={{
              flex: 1, padding: "12px 8px", borderRadius: "12px",
              border: "2px solid " + (ageKey === key ? d.color : nm.border),
              background: ageKey === key ? d.bg : nm.surface,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: ageKey === key ? d.color : nm.muted, fontFamily: "Georgia, serif" }}>{d.ageRange}</div>
              <div style={{ fontSize: "10px", color: ageKey === key ? d.color : nm.muted, fontFamily: "Georgia, serif", marginTop: "2px", opacity: 0.8 }}>{d.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Two paths */}
      <div style={{ fontSize: "11px", color: nm.muted, fontFamily: "Georgia, serif", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Choose a path</div>

      <button onClick={() => setScreen("examine")} style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", borderRadius: "16px", border: "2px solid " + data.color, background: data.bg, cursor: "pointer", marginBottom: "10px", textAlign: "left" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: data.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>+</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif", marginBottom: "3px" }}>Examination of Conscience</div>
          <div style={{ fontSize: "12px", color: nm.muted, fontFamily: "Georgia, serif" }}>Tap through questions, then print your private list to take to Confession</div>
        </div>
      </button>

      <button onClick={() => setScreen("card")} style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", borderRadius: "16px", border: "2px solid " + nm.border, background: nm.surface, cursor: "pointer", marginBottom: "16px", textAlign: "left" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#1a2744", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>+</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif", marginBottom: "3px" }}>Confession Card</div>
          <div style={{ fontSize: "12px", color: nm.muted, fontFamily: "Georgia, serif" }}>The steps and Act of Contrition to copy out and bring with you</div>
        </div>
      </button>

      {/* Parent note */}
      <div style={{ background: nm.card, borderRadius: "14px", padding: "16px 18px", borderLeft: "3px solid " + data.color }}>
        <div style={{ fontSize: "10px", color: data.color, fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px", fontFamily: "Georgia, serif" }}>For Parents</div>
        <p style={{ fontSize: "13px", color: nm.text, fontFamily: "Georgia, serif", lineHeight: "1.7", margin: 0, fontStyle: "italic" }}>
          Work through the examination together at home. Your child taps what applies, reviews the list, then copies it onto a small piece of paper to take into the confessional. Remind them: the paper gets destroyed after. God already knows -- the list is just so they don't forget anything.
        </p>
      </div>
    </div>
  );

  // EXAMINATION screen
  if (screen === "examine") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ background: "#1a2744", padding: "14px 18px", flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#c9a96e", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}><span style={{fontSize:"16px"}}>lt</span> Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>Examination of Conscience</div>
          <div style={{ fontSize: "11px", color: "#c9a96e", fontFamily: "Georgia, serif" }}>{data.ageRange} -- tap everything that applies</div>
        </div>
        {selectedCount > 0 && (
          <div style={{ background: data.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", color: "#fff", fontFamily: "Georgia, serif", fontWeight: "700" }}>{selectedCount}</div>
        )}
      </div>

      <div className="ck-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 16px 20px", background: nm.bg }}>
        <p style={{ fontSize: "13px", color: nm.muted, fontFamily: "Georgia, serif", lineHeight: "1.6", margin: "0 0 16px", fontStyle: "italic" }}>{data.intro}</p>

        {data.categories.map(cat => (
          <div key={cat.id} style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: data.color, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "Georgia, serif", marginBottom: "8px", paddingLeft: "4px" }}>{cat.label}</div>
            {cat.items.map(item => {
              const key = cat.id + ":" + item.id;
              const checked = !!selected[key];
              return (
                <button key={item.id} onClick={() => toggleItem(cat.id, item.id)} style={{
                  width: "100%", display: "flex", alignItems: "flex-start", gap: "12px",
                  padding: "13px 14px", borderRadius: "12px", border: "none",
                  background: checked ? data.bg : nm.surface,
                  cursor: "pointer", marginBottom: "6px", textAlign: "left",
                  outline: checked ? "2px solid " + data.color : "2px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                    border: "2px solid " + (checked ? data.color : nm.border),
                    background: checked ? data.color : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {checked && <span style={{ color: "#fff", fontSize: "13px", fontWeight: "700", lineHeight: 1 }}>ok</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: checked ? "#1a2744" : nm.text, fontFamily: "Georgia, serif", lineHeight: "1.55", fontWeight: checked ? "500" : "400" }}>{item.text}</p>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom action */}
      <div style={{ padding: "12px 16px 16px", background: nightMode ? "#161b22" : "#fff", borderTop: "1px solid " + nm.border, flexShrink: 0 }}>
        <button onClick={() => setScreen("list")} style={{
          width: "100%", padding: "14px", borderRadius: "14px", border: "none",
          background: selectedCount > 0 ? "#1a2744" : "#d0c4ba",
          color: selectedCount > 0 ? "#c9a96e" : "#fff",
          fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "700", cursor: selectedCount > 0 ? "pointer" : "default",
        }}>
          {selectedCount === 0 ? "Tap your sins above" : "See my Confession list -- " + selectedCount + " item" + (selectedCount !== 1 ? "s" : "")}
        </button>
      </div>
    </div>
  );

  // MY CONFESSION LIST screen
  if (screen === "list") {
    const items = getSelectedItems();
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ background: "#1a2744", padding: "14px 18px", flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setScreen("examine")} style={{ background: "none", border: "none", color: "#c9a96e", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif", padding: 0 }}>&#8249; Back</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>My Confession List</div>
            <div style={{ fontSize: "11px", color: "#c9a96e", fontFamily: "Georgia, serif" }}>Copy this -- bring it -- destroy it after</div>
          </div>
<CopyPrintButtons
            onPrint={() => printConfessionList(items, data.actOfContrition)}
            onCopy={() => copyConfessionList(items, data.actOfContrition)}
          />
        </div>

        <div className="ck-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px", background: nm.bg }}>

          {/* The list - styled like a piece of paper */}
          <div style={{ background: "#fffef8", borderRadius: "16px", padding: "20px 22px", marginBottom: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", border: "1px solid #e8e0cc" }}>
            <div style={{ fontSize: "13px", color: "#9a8060", fontFamily: "Georgia, serif", textAlign: "center", marginBottom: "16px", letterSpacing: "0.06em", textTransform: "uppercase" }}>My Sins</div>

            {items.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#9a8060", fontFamily: "Georgia, serif", textAlign: "center", fontStyle: "italic" }}>No sins selected yet. Go back and tap what applies.</p>
            ) : (
              <>
                {items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "12px", paddingBottom: "12px", borderBottom: i < items.length - 1 ? "1px dashed #e0d8c8" : "none" }}>
                    <div style={{ fontSize: "14px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: 1, marginTop: "3px" }}>+</div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.55" }}>{item.text}</p>
                  </div>
                ))}
                <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "2px solid #e0d8c8" }}>
                  <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>Act of Contrition</div>
                  <p style={{ fontSize: "13px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.75", margin: 0, fontStyle: "italic" }}>{data.actOfContrition}</p>
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div style={{ background: nm.surface, borderRadius: "14px", padding: "16px 18px", border: "1px solid " + nm.border, marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>What to do</div>
            {["Copy this list onto a small piece of paper in your own words.", "Fold it up and put it in your pocket.", "Take it into the confessional with you.", "After Confession, tear it up and throw it away."].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#1a2744", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#c9a96e", fontWeight: "700", flexShrink: 0 }}>{i + 1}</div>
                <p style={{ margin: 0, fontSize: "13px", color: nm.text, fontFamily: "Georgia, serif", lineHeight: "1.5" }}>{step}</p>
              </div>
            ))}
          </div>

          <button onClick={() => setScreen("card")} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "2px solid #1a2744", background: "transparent", color: "#1a2744", fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            Also see the Confession Card
          </button>
        </div>
      </div>
    );
  }

  // CONFESSION CARD screen
  if (screen === "card") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: "#1a2744", padding: "14px 18px", flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#c9a96e", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif", padding: 0 }}>&#8249; Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>Confession Card</div>
          <div style={{ fontSize: "11px", color: "#c9a96e", fontFamily: "Georgia, serif" }}>Copy this out -- you can keep it</div>
        </div>
<CopyPrintButtons
          onPrint={() => printConfessionCard(data, rite)}
          onCopy={() => copyConfessionCard(data, rite)}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: nm.bg }}>

        {/* Card - styled like a prayer card */}
        <div style={{ background: "#fffef8", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", border: "1px solid #e8e0cc", marginBottom: "14px" }}>

          {/* Card header */}
          <div style={{ background: "#1a2744", padding: "14px 18px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>The Sacrament of Penance</div>
            <div style={{ fontSize: "17px", color: "#fff", fontWeight: "700", fontFamily: "Georgia, serif" }}>How to Go to Confession</div>
          </div>

          <div style={{ padding: "18px 20px" }}>

            {/* Steps */}
            {data.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1a2744", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a96e", fontSize: "12px", fontWeight: "700", fontFamily: "Georgia, serif", flexShrink: 0, marginTop: "1px" }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif", marginBottom: "2px" }}>{step.title}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#5a5a5a", fontFamily: "Georgia, serif", lineHeight: "1.6" }}>{step.body}</p>
                </div>
              </div>
            ))}

            {/* Divider */}
            <div style={{ height: "1px", background: "#e0d8c8", margin: "16px 0" }} />

            {/* Act of Contrition */}
            <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>Act of Contrition</div>
            <p style={{ fontSize: "13px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.75", margin: "0 0 16px", fontStyle: "italic" }}>{data.actOfContrition}</p>

            {/* TLM absolution */}
            {rite === "TLM" && (
              <div style={{ background: "#f0ebe0", borderRadius: "10px", padding: "14px 16px" }}>
                <div style={{ fontSize: "10px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>Words of Absolution (Traditional Form)</div>
                <p style={{ fontSize: "12px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.7", margin: "0 0 8px", fontStyle: "italic" }}>
                  "Ego te absolvo a peccatis tuis in nomine Patris et Filii et Spiritus Sancti. Amen."
                </p>
                <p style={{ fontSize: "11px", color: "#7a7060", fontFamily: "Georgia, serif", lineHeight: "1.6", margin: 0 }}>
                  "I absolve thee of thy sins in the Name of the Father, and of the Son, and of the Holy Ghost. Amen."
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ background: "#f5f0e8", padding: "12px 18px", textAlign: "center", borderTop: "1px solid #e0d8c8" }}>
            <p style={{ fontSize: "12px", color: "#9a8060", fontFamily: "Georgia, serif", margin: 0, fontStyle: "italic" }}>
              "There is more joy in heaven over one sinner who repents." -- Luke 15:7
            </p>
          </div>
        </div>

        <div style={{ background: nm.surface, borderRadius: "14px", padding: "14px 16px", border: "1px solid " + nm.border }}>
          <div style={{ fontSize: "10px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>How to use this card</div>
          <p style={{ fontSize: "13px", color: nm.text, fontFamily: "Georgia, serif", lineHeight: "1.6", margin: 0, fontStyle: "italic" }}>Copy the steps and the Act of Contrition onto a small card. You can keep this card -- it is not private. Some children laminate it. It is yours to use every time you go to Confession.</p>
        </div>
      </div>
    </div>
  );

  return null;
}



// ═══════════════════════════════════════════════════════════
// SACRAMENT PREP TRACKER
// ═══════════════════════════════════════════════════════════

const SACRAMENT_DATA = {
  confession: {
    id: "confession",
    name: "First Confession",
    subtitle: "First Penance & Reconciliation",
    icon: "confession",
    color: "#8B1A1A",
    bg: "#FDF5F0",
    quote: "Go and sin no more.",
    quoteRef: "John 8:11",
    theology: "In the Sacrament of Penance, Christ Himself forgives sins through the ministry of the priest. For a child, First Confession is a profound moment -- their first personal encounter with God's mercy. The grace of this sacrament is real and transforming. Prepare for it with joy, not anxiety.",
    milestones: [
      {
        id: "m1",
        title: "Understanding sin and conscience",
        description: "Your child can name right from wrong and understands that some choices hurt their friendship with God.",
        activities: [
          { title: "Bedtime examination", body: "Use the Confession Guide's bedtime examination for ages 4-6 for two weeks before moving on. Make it a gentle nightly habit." },
          { title: "The two choices", body: "Talk about how every choice either moves us toward God or away from Him. Use concrete examples from your child's week." },
          { title: "Read the Prodigal Son together", body: "Luke 15:11-32. Ask: how did the father react when his son came home? That is how God reacts when we go to Confession." },
        ],
      },
      {
        id: "m2",
        title: "Learning the Act of Contrition",
        description: "Your child has memorized the Act of Contrition and can say it with understanding.",
        activities: [
          { title: "Memorize together", body: "Learn it line by line over a week. Say it together each night before bed. Talk about what each phrase means." },
          { title: "Heart vs. words", body: "Explain the difference between saying the words and meaning them. Ask: what does it feel like to really be sorry?" },
          { title: "Practice aloud", body: "Have your child say it to you as if they were in the confessional. Speak it slowly, not rushed." },
        ],
      },
      {
        id: "m3",
        title: "Practicing the rite",
        description: "Your child has walked through the steps of Confession and knows what to expect.",
        activities: [
          { title: "Use the Confession Card", body: "Open the Confession tab and go through the card together step by step. Practice what to say at each moment." },
          { title: "Role play", body: "Gently practice with your child. You play the priest. Let them walk through the whole rite from beginning to end." },
          { title: "Visit the confessional", body: "If possible, visit your church when it is empty and let your child kneel at the kneeler. Familiarity removes fear." },
        ],
      },
      {
        id: "m4",
        title: "First Confession received",
        description: "Your child has received the Sacrament of Penance for the first time.",
        activities: [
          { title: "Celebrate", body: "This is a feast day. Mark it with something special -- a meal, a small gift, a family prayer of thanksgiving." },
          { title: "The moment after", body: "Give your child quiet time in the pew after Confession before speaking to them. The grace is real. Let them sit with it." },
          { title: "Begin the habit", body: "Establish monthly Confession as a family rhythm. Let your child see you going too." },
        ],
      },
    ],
  },

  communion: {
    id: "communion",
    name: "First Holy Communion",
    subtitle: "First Reception of the Eucharist",
    icon: "communion",
    color: "#C9A96E",
    bg: "#FDF8EE",
    quote: "I am the living bread which came down from heaven.",
    quoteRef: "John 6:51",
    theology: "The Eucharist is the source and summit of the Christian life. At First Holy Communion, your child receives Jesus Christ -- Body, Blood, Soul, and Divinity -- for the first time. No preparation can be too careful, too reverent, or too joyful for this moment. Everything else in Catholic life flows from and leads back to this.",
    milestones: [
      {
        id: "m1",
        title: "Understanding the Real Presence",
        description: "Your child believes and can explain that Jesus is truly present in the Eucharist -- not a symbol, but really Him.",
        activities: [
          { title: "The miracle of the Mass", body: "Explain that at the moment of Consecration, the bread and wine truly become Jesus. The appearance does not change, but the reality does. This is called transubstantiation." },
          { title: "Visit the tabernacle", body: "Bring your child to the church outside of Mass. Point to the tabernacle. Say: Jesus is there right now, in the tabernacle, waiting for us. Kneel together and be still." },
          { title: "Read John 6 together", body: "John 6:48-58. Jesus says 'This is My body' four times and refuses to take it back when people leave. Ask: why do you think He was so clear about this?" },
          { title: "Spiritual Communion", body: "Teach your child to make a Spiritual Communion when they cannot receive -- especially at weekday Masses. 'My Jesus, I believe that Thou art truly present...'" },
        ],
      },
      {
        id: "m2",
        title: "Learning the prayers",
        description: "Your child knows the prayers before and after Communion, and the Anima Christi.",
        activities: [
          { title: "Memorize the Anima Christi", body: "Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me... Learn this prayer together. It is the great post-Communion prayer of the saints." },
          { title: "Before Communion", body: "'Lord, I am not worthy that Thou shouldst enter under my roof, but only say the word and my soul shall be healed.' Explain each phrase." },
          { title: "Thanksgiving after Mass", body: "Establish the practice of remaining for a few minutes after Mass in silent thanksgiving. Model this yourself -- do not rush to the car." },
        ],
      },
      {
        id: "m3",
        title: "Receiving worthily",
        description: "Your child understands the importance of being in a state of grace and has made their First Confession.",
        activities: [
          { title: "State of grace", body: "Explain that we receive Holy Communion only when our soul is clean -- free from serious sin. This is why First Confession comes first." },
          { title: "Fasting", body: "Teach the Eucharistic fast: nothing to eat or drink (except water and medicine) for one hour before receiving. Explain why: we prepare our body to receive Our Lord." },
          { title: "How to receive", body: "Practice the posture and gesture. On the tongue kneeling (traditional) or on the hand (ordinary form). Reverence is everything. Walk slowly. Say Amen with conviction." },
        ],
      },
      {
        id: "m4",
        title: "First Holy Communion received",
        description: "Your child has received Jesus in the Eucharist for the first time.",
        activities: [
          { title: "The great feast", body: "First Communion is one of the most important days of a Catholic life. Celebrate with the whole family. Frame a photo. Mark the date each year." },
          { title: "A letter from Jesus", body: "Some parents write a letter to their child on First Communion day to be opened years later. Consider this gift." },
          { title: "Begin weekly Mass as a family", body: "If you are not already attending Mass weekly as a family, let First Communion be the day this begins in earnest." },
        ],
      },
    ],
  },

  confirmation: {
    id: "confirmation",
    name: "Confirmation",
    subtitle: "Completion of Baptismal Grace",
    icon: "confirmation",
    color: "#5B6FA6",
    bg: "#EEF0FA",
    quote: "You shall receive power when the Holy Ghost has come upon you.",
    quoteRef: "Acts 1:8",
    theology: "Confirmation perfects the grace of Baptism. The confirmed person receives the fullness of the Holy Ghost and is strengthened to live the faith with courage and witness it to others. It is not a graduation from the Church -- it is a deeper commissioning into it. The gifts of the Holy Ghost given at Confirmation are real, operative, and transforming.",
    milestones: [
      {
        id: "m1",
        title: "Choosing a Confirmation saint",
        description: "Your child has chosen a patron saint for Confirmation and can explain why.",
        activities: [
          { title: "The saint name", body: "The Confirmation name is not arbitrary -- it is a choosing of a heavenly patron and intercessor. Help your child research saints who share their interests, struggles, or calling." },
          { title: "Study the chosen saint", body: "Read a biography together. Know the saint's life, their sufferings, their virtues, their death. The saint should feel like a real person, not a name on a card." },
          { title: "Pray to the patron saint", body: "Begin a daily prayer to the chosen saint. Ask for their intercession in your child's Confirmation preparation." },
          { title: "Write a letter to the saint", body: "Have your child write a letter to their chosen saint explaining why they chose them and what they are asking for their intercession." },
        ],
      },
      {
        id: "m2",
        title: "Understanding the seven gifts",
        description: "Your child knows and can explain the seven gifts of the Holy Ghost.",
        activities: [
          { title: "The seven gifts", body: "Wisdom, Understanding, Counsel, Fortitude, Knowledge, Piety, Fear of the Lord. Take one gift per week. Talk about what it means and where you see it in the saints." },
          { title: "Gifts in action", body: "For each gift, find an example from a saint's life where that gift was clearly operative. St. Thomas More had Fortitude. St. Therese had Piety. Make them concrete." },
          { title: "Which gift does your child need most?", body: "Ask your child honestly: which of the seven gifts do you think you need most right now? Pray for that gift together each day of preparation." },
          { title: "Come Holy Ghost", body: "Memorize the Veni Sancte Spiritus together. This is the great prayer for the gifts of the Holy Ghost and should be prayed daily during preparation." },
        ],
      },
      {
        id: "m3",
        title: "The sponsor relationship",
        description: "A sponsor has been chosen who is a practicing Catholic, confirmed, and committed to supporting your child's faith.",
        activities: [
          { title: "Choosing well", body: "The sponsor is not ceremonial -- they are a spiritual companion. Choose someone who actually lives the faith, not just someone who is family. This matters." },
          { title: "Sponsor conversation", body: "Have your child meet with their sponsor to talk about their faith journey, their chosen saint, and what Confirmation means to them." },
          { title: "Pray together", body: "Sponsor and candidate should pray together at least once before Confirmation. Suggest they visit a church together for Adoration or Confession." },
        ],
      },
      {
        id: "m4",
        title: "Confirmation received",
        description: "Your child has been confirmed by the bishop and received the fullness of the Holy Ghost.",
        activities: [
          { title: "The bishop's strike", body: "The gentle strike on the cheek from the bishop is a reminder that the confirmed person is now a soldier of Christ, called to suffer for the faith if necessary. Discuss this seriously." },
          { title: "Celebrate as soldiers", body: "Confirmation is not a graduation party -- it is a commissioning. Celebrate the gravity and the joy together. Ask your child: what will you do differently now?" },
          { title: "The ongoing gifts", body: "The gifts of the Holy Ghost given at Confirmation remain. Help your child identify how they will cultivate them over the coming year." },
        ],
      },
    ],
  },
};

// Progress ring SVG
function ProgressRing({ progress, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - progress * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E0D5C8" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} />
    </svg>
  );
}

function ActivityCard({ activity, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "8px", borderRadius: "10px", overflow: "hidden", border: "1px solid #E0D5C8" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", background: open ? "#f5f0e8" : "#fff", border: "none", cursor: "pointer" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#1a2744", fontFamily: "Georgia, serif" }}>{activity.title}</span>
        <span style={{ color: "#9a8060", fontSize: "14px", transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>&#8250;</span>
      </button>
      {open && (
        <div style={{ padding: "8px 14px 14px 30px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#3a3a3a", fontFamily: "Georgia, serif", lineHeight: "1.7", fontStyle: "italic" }}>{activity.body}</p>
        </div>
      )}
    </div>
  );
}

function MilestoneCard({ milestone, index, completed, onToggle, color, bg }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: "12px", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: completed ? "2px solid " + color : "2px solid #E0D5C8", transition: "border 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: completed ? bg : "#fff" }}>
        <button onClick={onToggle} style={{
          width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer",
          background: completed ? color : "transparent",
          outline: "2px solid " + (completed ? color : "#C0B8A8"),
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          {completed && <span style={{ color: "#fff", fontSize: "14px", fontWeight: "700", lineHeight: 1 }}>ok</span>}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", color: color, fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2px", fontWeight: "600" }}>Step {index + 1}</div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif" }}>{milestone.title}</div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8060", fontSize: "20px", padding: "0 0 0 8px", transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>&#8250;</button>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", background: completed ? bg : "#fff" }}>
          <p style={{ fontSize: "13px", color: "#5a5a5a", fontFamily: "Georgia, serif", lineHeight: "1.65", margin: "0 0 14px", fontStyle: "italic" }}>{milestone.description}</p>
          <div style={{ fontSize: "11px", color: color, fontFamily: "Georgia, serif", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Home Activities</div>
          {milestone.activities.map((act, i) => (
            <ActivityCard key={i} activity={act} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

function SacramentDetail({ sacramentKey, childName, onBack, rite, scrollToTop = () => {} }) {
  const data = SACRAMENT_DATA[sacramentKey];
  const curriculum = PREP_CURRICULUM[sacramentKey];
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollToTop();
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [sacramentKey]);
  const storageKey = "sacrament_" + sacramentKey + "_" + childName;
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); }
    catch { return {}; }
  });
  const [targetDate, setTargetDate] = useState(() => {
    try { return localStorage.getItem(storageKey + "_date") || ""; }
    catch { return ""; }
  });
  const [showTheology, setShowTheology] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [weeksCompleted, setWeeksCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey + "_weeks") || "{}"); }
    catch { return {}; }
  });

  function toggleWeek(weekNum) {
    const next = { ...weeksCompleted, [weekNum]: !weeksCompleted[weekNum] };
    setWeeksCompleted(next);
    try { localStorage.setItem(storageKey + "_weeks", JSON.stringify(next)); } catch {}
  }

  // If a lesson is active, show it full screen
  if (activeLesson !== null && curriculum) {
    return (
      <WeeklyLesson
        key={activeLesson}
        lesson={curriculum.weeks[activeLesson]}
        color={data.color}
        bg={data.bg}
        onClose={() => { setActiveLesson(null); scrollToTop(); }}
      />
    );
  }

  function toggleMilestone(id) {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }

  function saveDate(d) {
    setTargetDate(d);
    try { localStorage.setItem(storageKey + "_date", d); } catch {}
  }

  const completedCount = data.milestones.filter(m => completed[m.id]).length;
  const progress = completedCount / data.milestones.length;

  // Days remaining
  let daysNote = null;
  if (targetDate) {
    const diff = Math.ceil((new Date(targetDate) - new Date()) / 86400000);
    if (diff > 0) daysNote = diff + " days remaining";
    else if (diff === 0) daysNote = "Today is the day";
    else daysNote = Math.abs(diff) + " days ago";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ background: "#1a2744", padding: "14px 18px", flexShrink: 0, display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#c9a96e", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif", padding: 0 }}>&#8249; Sacraments</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>{data.name}</div>
          <div style={{ fontSize: "11px", color: "#c9a96e", fontFamily: "Georgia, serif" }}>{childName}</div>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProgressRing progress={progress} color={data.color} size={52} />
          <div style={{ position: "absolute", fontSize: "11px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>{Math.round(progress * 100)}%</div>
        </div>
      </div>

      <div ref={scrollRef} className="ck-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 32px" }}>

        {/* Quote banner */}
        <div style={{ background: "linear-gradient(135deg, #111b30 0%, #1a2744 100%)", borderRadius: "16px", padding: "18px 20px", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -15, right: -15, fontSize: "70px", opacity: 0.07 }}>+</div>
          <p style={{ fontSize: "16px", color: "#fff", fontFamily: "Georgia, serif", lineHeight: "1.55", margin: "0 0 6px", fontStyle: "italic" }}>"{data.quote}"</p>
          <div style={{ fontSize: "11px", color: "#c9a96e", fontFamily: "Georgia, serif" }}>{data.quoteRef}</div>
        </div>

        {/* Target date */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "14px 16px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>Target date</div>
            <input type="date" value={targetDate} onChange={e => saveDate(e.target.value)} style={{ fontSize: "14px", fontFamily: "Georgia, serif", color: "#1a2744", border: "none", outline: "none", background: "transparent", width: "100%" }} />
          </div>
          {daysNote && (
            <div style={{ fontSize: "12px", color: data.color, fontFamily: "Georgia, serif", fontWeight: "600", textAlign: "right", flexShrink: 0 }}>{daysNote}</div>
          )}
        </div>

        {/* Progress summary */}
        <div style={{ background: data.bg, borderRadius: "14px", padding: "14px 16px", marginBottom: "14px", border: "1px solid " + data.color + "40", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif", marginBottom: "2px" }}>{completedCount} of {data.milestones.length} milestones complete</div>
            <div style={{ fontSize: "12px", color: "#9a8060", fontFamily: "Georgia, serif" }}>{completedCount === data.milestones.length ? "Ready to receive the sacrament" : "Tap each milestone to expand activities"}</div>
          </div>
        </div>

        {/* Theology — collapsible */}
        <div style={{ background: "#fff", borderRadius: "14px", marginBottom: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <button onClick={() => setShowTheology(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif" }}>About this sacrament</span>
            <span style={{ color: "#9a8060", fontSize: "18px", transform: showTheology ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>&#8250;</span>
          </button>
          {showTheology && (
            <div style={{ padding: "0 16px 16px" }}>
              <p style={{ fontSize: "13px", color: "#3a3a3a", fontFamily: "Georgia, serif", lineHeight: "1.75", margin: 0, fontStyle: "italic" }}>{data.theology}</p>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>Milestones</div>
        {data.milestones.map((m, i) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            index={i}
            completed={!!completed[m.id]}
            onToggle={() => toggleMilestone(m.id)}
            color={data.color}
            bg={data.bg}
          />
        ))}

        {/* Confession guide link */}
        {sacramentKey === "confession" && (
          <div style={{ background: data.bg, borderRadius: "14px", padding: "14px 16px", marginTop: "4px", border: "1px solid " + data.color + "40", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: data.color, fontFamily: "Georgia, serif", fontStyle: "italic" }}>The full Confession Guide with examination of conscience and confession card is in the Prayers tab.</div>
          </div>
        )}

        {/* 12-Week Curriculum */}
        {curriculum && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ flex: 1, height: "1px", background: "#E0D5C8" }} />
              <span style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>12-Week Preparation</span>
              <div style={{ flex: 1, height: "1px", background: "#E0D5C8" }} />
            </div>
            <div style={{ background: data.bg, borderRadius: "12px", padding: "12px 14px", marginBottom: "12px", border: "1px solid " + data.color + "30" }}>
              <p style={{ fontSize: "12px", color: "#5a5a5a", fontFamily: "Georgia, serif", lineHeight: "1.6", margin: 0, fontStyle: "italic" }}>
                Weekly stories, theology notes, conversations, prayers, and "notice this week" prompts -- written to be read aloud together as a family. One lesson per week in the lead-up to the sacrament.
              </p>
            </div>
            {curriculum.weeks.map((lesson, i) => {
              const done = !!weeksCompleted[lesson.week];
              return (
                <div key={i} style={{ background: "#fff", borderRadius: "14px", marginBottom: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: done ? "2px solid " + data.color : "1px solid #E0D5C8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px" }}>
                    <button onClick={() => toggleWeek(lesson.week)} style={{
                      width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer",
                      background: done ? data.color : "transparent",
                      outline: "2px solid " + (done ? data.color : "#C0B8A8"),
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    }}>
                      {done && <span style={{ color: "#fff", fontSize: "12px", fontWeight: "700" }}>ok</span>}
                    </button>
                    <div onClick={() => { setActiveLesson(i); scrollToTop(); }} style={{ flex: 1, cursor: "pointer" }}>
                      <div style={{ fontSize: "11px", color: data.color, fontFamily: "Georgia, serif", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1px" }}>Week {lesson.week}</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif" }}>{lesson.theme}</div>
                      <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif" }}>{lesson.partTitle}</div>
                    </div>
                    <button onClick={() => { setActiveLesson(i); scrollToTop(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8060", fontSize: "20px", padding: "0" }}>&#8250;</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

function SacramentHub({ rite, nightMode, children, scrollToTop = () => {} }) {
  const [screen, setScreen] = useState("home"); // home | detail
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  useEffect(() => { setTimeout(() => { document.querySelectorAll('.ck-scroll').forEach(el => { el.scrollTop = 0; }); }, 0); }, [screen]);

  const nm = nightMode ? {
    bg: "#0d1117", surface: "#161b22", text: "#e6edf3", muted: "#8b949e", border: "#30363d",
  } : {
    bg: "transparent", surface: "#fff", text: "#1a2744", muted: "#9a8060", border: "#E0D5C8",
  };

  if (screen === "detail" && selectedSacrament && selectedChild) {
    return (
      <SacramentDetail
        sacramentKey={selectedSacrament}
        childName={selectedChild}
        onBack={() => setScreen("home")}
        rite={rite}
        scrollToTop={scrollToTop}
      />
    );
  }

  const sacramentOrder = ["confession", "communion", "confirmation"];

  return (
    <div style={{ padding: "16px 16px 32px", background: nm.bg }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #111b30 0%, #1a2744 100%)", borderRadius: "18px", padding: "20px 22px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: "80px", opacity: 0.07 }}>+</div>
        <div style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Initiation into the Church</div>
        <div style={{ fontSize: "20px", color: "#fff", fontWeight: "700", marginBottom: "8px" }}>Sacrament Prep</div>
        <div style={{ fontSize: "13px", color: "#d4cfc8", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          Choose a child and a sacrament to begin tracking their journey.
        </div>
      </div>

      {/* Child selector */}
      {children && children.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: nm.muted, fontFamily: "Georgia, serif", marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Who is preparing?</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {children.map((child, i) => (
              <button key={i} onClick={() => setSelectedChild(child.name)} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 14px", borderRadius: "20px",
                border: "2px solid " + (selectedChild === child.name ? "#1a2744" : nm.border),
                background: selectedChild === child.name ? "#1a2744" : nm.surface,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: "16px" }}>{child.avatar}</span>
                <span style={{ fontSize: "13px", fontFamily: "Georgia, serif", fontWeight: "600", color: selectedChild === child.name ? "#c9a96e" : nm.text }}>{child.name}</span>
                <span style={{ fontSize: "11px", color: selectedChild === child.name ? "#c9a96e" : nm.muted, fontFamily: "Georgia, serif" }}>{child.age}y</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sacrament cards */}
      {!selectedChild && children && children.length > 0 && (
        <div style={{ background: nm.surface, borderRadius: "14px", padding: "16px 18px", marginBottom: "14px", border: "2px dashed " + nm.border, textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: nm.text, fontFamily: "Georgia, serif", marginBottom: "4px" }}>Tap a child's name above to begin</div>
          <div style={{ fontSize: "12px", color: nm.muted, fontFamily: "Georgia, serif" }}>The sacrament cards will activate once you select who is preparing</div>
        </div>
      )}
      {(!children || children.length === 0) && (
        <div style={{ background: nm.surface, borderRadius: "14px", padding: "16px 18px", marginBottom: "14px", border: "2px dashed " + nm.border, textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: nm.text, fontFamily: "Georgia, serif", marginBottom: "4px" }}>No children added yet</div>
          <div style={{ fontSize: "12px", color: nm.muted, fontFamily: "Georgia, serif" }}>Go to Settings to add your children first</div>
        </div>
      )}
      <div style={{ fontSize: "11px", color: nm.muted, fontFamily: "Georgia, serif", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {selectedChild ? "Select a sacrament for " + selectedChild : ""}
      </div>

      {sacramentOrder.map(key => {
        const s = SACRAMENT_DATA[key];
        // Get progress for selected child
        let progress = 0;
        let completedCount = 0;
        if (selectedChild) {
          try {
            const stored = JSON.parse(localStorage.getItem("sacrament_" + key + "_" + selectedChild) || "{}");
            completedCount = s.milestones.filter(m => stored[m.id]).length;
            progress = completedCount / s.milestones.length;
          } catch {}
        }
        const started = completedCount > 0;

        return (
          <button key={key} onClick={() => {
            if (!selectedChild) return;
            setSelectedSacrament(key);
            setScreen("detail");
          }} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "16px",
            padding: "18px 18px", borderRadius: "16px", marginBottom: "10px",
            border: "2px solid " + (started ? s.color : nm.border),
            background: started ? s.bg : nm.surface,
            cursor: selectedChild ? "pointer" : "not-allowed",
            opacity: selectedChild ? 1 : 0.35,
            textAlign: "left", transition: "all 0.15s",
          }}>
            {/* Progress ring */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ProgressRing progress={progress} color={s.color} size={52} />
              <div style={{ position: "absolute", fontSize: "10px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif" }}>
                {started ? Math.round(progress * 100) + "%" : "+"}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif", marginBottom: "2px" }}>{s.name}</div>
              <div style={{ fontSize: "12px", color: nm.muted, fontFamily: "Georgia, serif", marginBottom: started ? "4px" : 0 }}>{s.subtitle}</div>
              {started && (
                <div style={{ fontSize: "11px", color: s.color, fontFamily: "Georgia, serif", fontWeight: "600" }}>{completedCount} of {s.milestones.length} milestones complete</div>
              )}
            </div>
            <span style={{ color: nm.muted, fontSize: "20px" }}>&#8250;</span>
          </button>
        );
      })}

      {/* Note */}
      <div style={{ background: nm.surface, borderRadius: "14px", padding: "14px 16px", border: "1px solid " + nm.border, marginTop: "6px" }}>
        <p style={{ fontSize: "12px", color: nm.muted, fontFamily: "Georgia, serif", lineHeight: "1.6", margin: 0, fontStyle: "italic" }}>
          Your progress is saved on this device. Each child's journey is tracked separately. Milestones can be marked complete and reopened at any time.
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// SACRAMENT PREP  --  36 WEEKS OF CONTENT
// Full lesson plans: story, theology note, conversation, prayer, notice prompt
// ═══════════════════════════════════════════════════════════

const PREP_CURRICULUM = {

  confession: {
    title: "First Confession",
    color: "#8B1A1A",
    bg: "#FDF5F0",
    weeks: [

      // ── PART ONE: WHAT IS SIN AND CONSCIENCE (Weeks 1-3) ──

      {
        week: 1,
        theme: "The Window",
        partTitle: "What Sin Does to the Soul",
        story: `There is a window in our house that faces the morning sun. When it is clean, the light comes pouring through  --  warm and golden, filling the whole room. But when the window gets dirty  --  fingerprints, dust, smudges  --  the light still comes through, but dimly. The room feels different. Darker. A little sad.

Your soul is like that window.

God made your soul to let His light shine through you  --  into your home, your friendships, your whole life. When your soul is clean, His light comes through clearly, and people can feel something good and warm when they are near you.

But when we sin  --  when we choose to lie, or hurt someone, or disobey on purpose  --  it is like pressing your fingers against the glass. The light does not stop completely. God does not stop loving you. But something is dimmer. Something is smudged.

Here is the wonderful thing about Confession: it is like someone washing the window until it is perfectly clean again. Not just a little cleaner. Perfectly clean. The light comes flooding back in, and you can feel it.

That is what we are preparing for.`,
        theologyNote: `The tradition of the Church distinguishes between mortal sin (which kills sanctifying grace in the soul entirely) and venial sin (which weakens but does not destroy it). For children preparing for First Confession, the key concept is simpler: sin damages our friendship with God and our capacity to receive His grace. The window analogy avoids making sin sound like a legal transaction while preserving the reality that it has consequences. Sanctifying grace  --  the life of God in the soul  --  is the light. Confession restores it fully.`,
        conversation: `"When you are in a room with a dirty window, you might not notice right away that the light is different. Can you think of a time when you did something wrong and things just felt... off? Not just because you got in trouble. But inside?"`,
        prayer: `Lord, You made my soul to shine with Your light. Help me to see clearly when I have smudged the window, and give me the courage to bring it to You to be made clean. Amen.`,
        notice: `This week, find a window in your house. Look at the light coming through. Every time you see it, say a quiet prayer: "Lord, keep my soul clean."`
      },

      {
        week: 2,
        theme: "The Voice Inside",
        partTitle: "What a Conscience Is",
        story: `In the story of Pinocchio, a small cricket named Jiminy is appointed to be Pinocchio's conscience. Every time Pinocchio is about to do something foolish or wrong, Jiminy appears  --  sometimes ignored, sometimes listened to, always telling the truth.

Jiminy Cricket is a funny little image of something very real inside each one of us.

God gave every person a conscience. It is not a cricket. It is not a voice you can hear with your ears. But it is real  --  a kind of knowing, deep inside, that whispers: this is right, or this is wrong. When you are about to tell a lie to stay out of trouble, something inside you hesitates. That is your conscience speaking.

Here is something important: a conscience needs to be trained, like a musician trains their ear. A musician who never listens to good music slowly loses the ability to hear when a note is off. A conscience that is never used  --  never listened to  --  gradually becomes quieter. Harder to hear.

But a conscience that is fed well  --  with prayer, with truth, with the sacraments  --  becomes clearer and stronger over time. Like a muscle. Like a well-tuned instrument.

That is part of what we are doing in these weeks together. We are tuning the instrument.`,
        theologyNote: `The conscience is the proximate norm of morality  --  the immediate guide to right action. But conscience is not infallible; it must be formed according to objective truth. The Church distinguishes between a certain conscience, a doubtful conscience, and an erroneous conscience. For children, the key point is that conscience is real, God-given, and must be listened to and formed. The Pinocchio reference is in the public domain (the original Collodi novel, 1883) and the Disney adaptation can be referenced for the familiar imagery without quoting directly.`,
        conversation: `"Has there ever been a moment when you were about to do something wrong and something inside you said: don't? What did that feel like? Did you listen?"`,
        prayer: `Lord, You gave me a conscience so I would always have a guide close to my heart. Help me to listen to it, to keep it honest, and to feed it with prayer. Amen.`,
        notice: `This week, whenever you are about to make a choice  --  even a small one  --  pause for just a moment and listen. What does the quiet voice inside say?`
      },

      {
        week: 3,
        theme: "The Prodigal Son",
        partTitle: "How God Sees Our Sin",
        story: `Jesus told this story Himself, and it is one of the greatest stories ever told.

There was a father with two sons. The younger son came to his father one day and said something that would have felt, in that time, like a slap in the face: "Give me my share of the inheritance now." In other words: I wish you were already dead. I want your money. I'm leaving.

And the father  --  astonishingly  --  gave it to him.

The son went far away and wasted everything. Every coin. Every friend. Every scrap of dignity. He ended up feeding pigs  --  the most unclean animals imaginable to a Jewish boy  --  and was so hungry that the pig food looked good to him.

And then he came to his senses. He thought: even the servants in my father's house have enough to eat. I will go home. I will not ask to be a son again  --  I don't deserve that. I will ask to be a servant.

He began the long walk home.

Here is the part that matters most for what we are learning. The father  --  who had been watching the road, every day  --  saw his son when he was still a long way off. And he ran. The father ran. He did not wait for his son to arrive and make his speech. He ran down the road, threw his arms around him, and kissed him.

Before the son could finish his apology, the father was calling for a feast.

This is how God sees you when you come to Confession. He has been watching the road. He sees you when you are still far off. He runs.`,
        theologyNote: `Luke 15:11-32. This parable is sometimes called the Parable of the Prodigal Son but more accurately the Parable of the Merciful Father  --  it is the father who is the central character, not the son. The father's running was culturally significant: a patriarch would never run; it was undignified. Jesus uses this detail deliberately to show the extravagance of God's mercy. The son's speech is never actually completed  --  the father interrupts it with the command for the feast. Key doctrine: God's mercy is not passive but active; He meets us on the road. Contrition (genuine sorrow) opens the door; God's mercy floods through it.`,
        conversation: `"The son was rehearsing his speech the whole way home. He had a plan for what he would say. But the father interrupted him before he could finish. What does that tell you about how God listens when we are sorry?"`,
        prayer: `Father, when I have wandered far from You, You are already watching the road. Help me always to turn around and come home  --  knowing that You will run to meet me. Amen.`,
        notice: `This week, when you see someone in your family do something wrong and then say sorry, watch how the forgiveness happens. Is there a moment when the sorry is met with welcome before it is even finished?`
      },

      // ── PART TWO: GOD'S MERCY AND WHY HE FORGIVES (Weeks 4-6) ──

      {
        week: 4,
        theme: "The Debt",
        partTitle: "Why Forgiveness Costs Something",
        story: `Imagine you are at school and you accidentally knock over your friend's project  --  weeks of work, a beautiful model of a castle, smashed on the floor. You did not mean to do it. But it is broken.

Now imagine your friend says: "It's fine, don't worry about it." That sounds kind. But it is not quite right, is it? The castle is still broken. Someone still has to pick up the pieces. Someone still has to spend the hours rebuilding it. When your friend says "it's fine," what they are really doing is taking the cost of your accident onto themselves. They are absorbing it. It does not disappear  --  it just moves.

This is what forgiveness always involves. Real forgiveness  --  not just pretending nothing happened  --  always costs the person who forgives. They are choosing to carry what you owe.

Now think about sin. Real sin is not just a mistake. It is a broken castle, a real debt. When God forgives us in Confession, He is not pretending nothing happened. He is absorbing the cost Himself. He already did this on the Cross, where Jesus took every sin of every person who ever lived  --  every broken castle  --  and paid for it in full.

Confession is not where the forgiveness is purchased. It was purchased on Calvary. Confession is where we receive it.`,
        theologyNote: `This week introduces the concept of satisfaction  --  that sin creates a real debt which must be addressed. The atonement is not merely juridical (legal) in Catholic theology, but also ontological: sin damages the right order of creation and this disorder must be healed. Christ's death is the meritorious cause of our justification. The key distinction for children: God's forgiveness is free, but it was not cheap. It cost the Cross. Confession is not a vending machine  --  it is the moment we receive what Christ already purchased. This prepares children to receive penance with seriousness rather than resentment.`,
        conversation: `"When you say sorry to someone, what do you hope happens next? And when someone says sorry to you, what does it cost you to forgive them  --  even if it is hard?"`,
        prayer: `Lord Jesus, You paid a price I could never pay. Help me to understand what it cost You to forgive me, and to receive that forgiveness with a grateful heart. Amen.`,
        notice: `This week, when someone apologizes to you for something, notice what it takes to genuinely forgive them. That little effort inside you is a tiny echo of what God does for us.`
      },

      {
        week: 5,
        theme: "Aslan and Edmund",
        partTitle: "The Deeper Magic",
        story: `In C.S. Lewis's story The Lion, the Witch and the Wardrobe, there is a boy named Edmund who betrays his family to the White Witch. He does it for Turkish Delight  --  enchanted candy that makes you want more and more and is never satisfying. He trades his family's safety for sweets.

Edmund is captured. The White Witch has a claim on him  --  an ancient law, written into the world at its foundation, that says every traitor belongs to her. The claim is real. It cannot simply be dismissed.

Aslan  --  the great Lion who rules Narnia  --  meets with the Witch privately. We do not know what is said. But afterward, the Witch releases Edmund. And that night, Aslan goes alone to the Stone Table and gives his life.

The Witch is exultant. She has killed the Lion. But she does not know about the Deeper Magic  --  a law older and more fundamental than the one she cited. It says that when an innocent person willingly gives their life for a guilty one, the table itself will crack and death will work backward.

The Stone Table breaks. Aslan returns. Edmund is free  --  not because his guilt was ignored, but because someone who loved him paid the price in full.

This is the truest story Lewis ever told, because he was telling the true story. The real Edmund is you. The real Aslan is Jesus. The real Deeper Magic is the Resurrection.

And the reason Confession works  --  the reason your sins can actually be forgiven  --  is because the Stone Table already cracked.`,
        theologyNote: `C.S. Lewis wrote The Lion, the Witch and the Wardrobe (1950) as a deliberate fictional retelling of the Passion and Resurrection. The "Deep Magic" is the Moral Law  --  divine justice. The "Deeper Magic" is the principle that innocent self-sacrifice for the guilty transcends death  --  Lewis's way of rendering the doctrine of atonement accessible to children. The copyright status: the novel is still under copyright but we are retelling and summarizing, not quoting. Key Catholic note: Lewis was Anglican, not Catholic, and his theology of atonement is slightly different from Catholic satisfaction theory, but for this purpose the analogy is sound and has been used by Catholic catechists for decades.`,
        conversation: `"Edmund did something genuinely terrible. He endangered everyone who loved him  --  for candy. And yet Aslan died for him specifically. Not for everyone in general  --  for Edmund. Does knowing that Jesus died for you specifically  --  not just for everyone  --  change how it feels?"`,
        prayer: `Lord Jesus, You are the real Aslan. You took my place when I deserved the consequence of my own choices. Help me to never forget what that cost You. Amen.`,
        notice: `This week, if you see the word "sacrifice" anywhere  --  in a book, at Mass, in conversation  --  stop and think about what it actually means. Someone giving up something real so that someone else does not have to.`
      },

      {
        week: 6,
        theme: "The Lost Sheep",
        partTitle: "You Are the One He Leaves to Find",
        story: `Jesus asked a question once that sounds simple but is actually astonishing.

"Which of you, having a hundred sheep and losing one of them, does not leave the ninety-nine in the wilderness and go after the one that is lost, until he finds it?"

The answer  --  if you think about it  --  is: any sensible shepherd would not do this. Ninety-nine sheep are fine. One has wandered off. It is unfortunate, but you do not risk ninety-nine for one.

Unless, of course, the sheep matters more than the math.

Jesus says that when the shepherd finds the lost sheep, he does not scold it, does not drag it back, does not make it limp home on its own. He lays it on his shoulders  --  the place of honor, the place of a conqueror's trophy  --  and carries it home rejoicing.

And then Jesus says something extraordinary: there is more joy in heaven over one sinner who repents than over ninety-nine righteous people who need no repentance.

More joy. Not equal joy. More.

You were made for this  --  not just to be forgiven, but to be the occasion of heaven's rejoicing. Every time you come to Confession genuinely sorry, something happens in heaven. The angels celebrate. God Himself rejoices  --  not politely, not quietly, but with the joy of a shepherd who found what was lost.

You are the one He leaves everything to find.`,
        theologyNote: `Luke 15:4-7. This parable is the first of three in Luke 15  --  the Lost Sheep, the Lost Coin, the Prodigal Son  --  all making the same point with escalating intimacy: God seeks us actively. The shepherd's leaving the ninety-nine was considered by early Christian commentators to represent Christ leaving the angelic host (the ninety-nine who have not sinned) to seek fallen humanity (the one). The joy in heaven is not metaphorical in Church teaching  --  the communion of saints means our return genuinely affects the whole Body of Christ. This week's theme helps children see Confession not as shameful but as the occasion of heaven's celebration.`,
        conversation: `"Jesus says there is more joy in heaven over one sinner who repents than over ninety-nine who do not need to. Does that surprise you? Why do you think that is?"`,
        prayer: `Good Shepherd, I am the sheep You left everything to find. Thank You for not doing the math and deciding I was not worth it. Help me to never wander so far that I forget You are looking for me. Amen.`,
        notice: `This week, notice moments when someone is found after being lost  --  a child who wandered in a shop, a pet that went missing, something misplaced for days. Pay attention to the joy when it is found. That joy is a small echo of something much larger.`
      },

      // ── PART THREE: THE ROLE OF THE PRIEST AND THE RITE (Weeks 7-9) ──

      {
        week: 7,
        theme: "The Ambassador",
        partTitle: "Why We Need a Priest",
        story: `Imagine you are a citizen of a country that has done something to offend a great king. Not you personally  --  your whole country. And now relations between your country and the king's kingdom are damaged.

Your country sends an ambassador  --  a representative with full authority to speak on behalf of the nation, to negotiate, to receive the king's response, and to carry it back. The ambassador does not make up the terms of peace. He brings them from the king himself. And when he speaks, it is as if the whole nation speaks.

Now turn it around. The king wants to send a message back. He sends his own representative  --  someone with full authority to speak the king's words, to offer his terms, to declare the treaty binding.

This is something like what happens in the Sacrament of Confession.

The priest is not there because he is holier than you, or wiser, or because God cannot hear you without a middleman. The priest is there because Jesus established it this way. On the night of His Resurrection, He breathed on His apostles and said: "Receive the Holy Ghost. Whose sins you forgive, they are forgiven. Whose sins you retain, they are retained."

He gave them  --  and through them, the priests of the Church  --  the authority to declare forgiveness in His name. When the priest says "I absolve you," he is not expressing a personal opinion. He is speaking with the voice of Christ Himself.

The priest is the ambassador. And the message he carries is peace.`,
        theologyNote: `John 20:22-23  --  the "Johannine Pentecost." This is the scriptural foundation for the sacrament of Confession. Catholic theology distinguishes between God as the primary cause of forgiveness and the priest as the instrumental cause  --  God forgives through the priest's absolution, not instead of it. The key concept for children: the priest's authority is not his own, it is delegated by Christ. This is important because children sometimes hesitate at Confession because they are embarrassed to tell a human being their sins. The answer: you are not telling a human being your sins as if for his personal knowledge  --  you are telling Christ through His representative.`,
        conversation: `"If you could apologize directly to God without the priest, why do you think Jesus set it up so that there would be a priest in the middle? What might be the reason?"`,
        prayer: `Lord Jesus, You gave Your priests the authority to speak Your forgiveness in Your name. Help me to trust that when the priest says 'I absolve you,' it is truly Your voice I am hearing. Amen.`,
        notice: `This week at Mass, watch the priest carefully. Every gesture he makes  --  the way he holds his hands, the words he says  --  is not his own invention. He is following an authority that was given to him. Notice that.`
      },

      {
        week: 8,
        theme: "The Doctor",
        partTitle: "The Priest Is Not the Judge  --  He Is the Healer",
        story: `When you go to a doctor because something is wrong, you tell the doctor things you would not tell most people. You describe your symptoms honestly  --  even the embarrassing ones, even the ones that are strange or hard to say out loud  --  because if you do not tell the doctor what is actually wrong, the doctor cannot help you.

The doctor does not judge you for being sick. He is not sitting across from you thinking: what a foolish patient. He is thinking: how do I help this person get well?

The priest in Confession is a doctor of souls. When you come to Confession, you are not walking into a courtroom where a judge will determine your guilt. You are walking into a surgery where a healer will address a wound.

This is important, because many people are afraid of Confession because they imagine the priest sitting behind the screen with crossed arms thinking badly of them. In reality, the priest has heard everything. Not as gossip  --  but as a doctor hears patient histories. He is not shocked. He is not recording your sins to tell others. The seal of Confession  --  the absolute, sacred, inviolable privacy of what you say  --  is one of the most profound commitments in the Catholic Church.

A priest would rather die than reveal a sin told in Confession.

And there have been priests who did exactly that.`,
        theologyNote: `St. John Nepomucene (1393) was martyred for refusing to reveal the contents of a confession made by the Queen of Bohemia to the king who demanded to know what she had said. He was thrown from the Charles Bridge in Prague. The seal of Confession (sigillum confessionis) is absolute in Canon Law  --  a priest who reveals a penitent's sins is automatically excommunicated. This history helps children understand that their privacy in Confession is not just a policy  --  it is a sacred obligation backed by martyrdom. The physician analogy comes from the early Church fathers and is used explicitly in the Catechism.`,
        conversation: `"Is there anything about Confession that makes you nervous or that feels hard? Let's talk about it honestly. What is the hardest part of the idea of telling someone what you have done wrong?"`,
        prayer: `Lord, help me to see the priest in Confession not as a judge looking for my faults but as a doctor who already knows I am wounded and wants only to help me heal. Amen.`,
        notice: `This week, think of a time when you told someone the truth about something difficult. How did it feel before? How did it feel after? Let that remind you of why honesty in Confession matters.`
      },

      {
        week: 9,
        theme: "The Steps",
        partTitle: "Walking Through the Rite Together",
        story: `There is a moment in Tolkien's story of Frodo and the Ring when Frodo, standing at the Council of Elrond, says the words that define his character: "I will take the Ring, though I do not know the way."

He does not know how. He does not know what lies ahead. He knows only that the task is real and that it belongs to him. And he stands up.

Preparing for Confession is something like this. The task ahead  --  entering the confessional, kneeling, speaking your sins to a priest  --  might feel large and unfamiliar. You may not know exactly what to expect. You may feel a little afraid.

But here is what I want you to know: every saint who ever lived was once where you are right now. St. Francis of Assisi knelt for his first Confession. St. Therese of Lisieux walked into a confessional as a child just as you will. St. Thomas More, who would one day die rather than betray his faith, once was a small boy preparing for this same sacrament.

They did not wait until they felt ready. They stood up.

So tonight, let us walk through every step together  --  not quickly, not as a list to memorize, but slowly, so that when you stand at the door of the confessional, you will know what comes next, and nothing will surprise you.

And then  --  we will practice.`,
        theologyNote: `The Tolkien reference is to The Fellowship of the Ring, "The Council of Elrond" chapter  --  Frodo's offer to bear the Ring is one of literature's great images of courage in the face of the unknown. The text is still under copyright but the reference and paraphrase are used fairly. This week's session is primarily practical rather than doctrinal  --  it is the rehearsal session. Parents should use the Confession Guide in the app (available in the Prayers tab) to walk through the steps of the Traditional form with their child. The key emotion to address is anticipatory anxiety, which is normal and should be normalized rather than minimized.`,
        conversation: `"Is there a step in the Confession process that feels most unfamiliar or most difficult? Let's talk about exactly that part until it feels smaller."`,
        prayer: `Lord, I stand at the door of something I have not done before. Give me the courage of Frodo  --  to stand up even when I do not know the way. You will be there when I kneel. Amen.`,
        notice: `This week, practice the Act of Contrition every night before bed. Say it slowly, meaning every word. By the time your First Confession comes, it should feel like breathing.`
      },

      // ── PART FOUR: LIVING DIFFERENTLY AFTER (Weeks 10-12) ──

      {
        week: 10,
        theme: "The Garden",
        partTitle: "Why We Go to Confession Regularly",
        story: `There is a garden behind a house on a quiet street. One spring, the family who lived there spent three full weekends pulling every weed  --  every dandelion, every thistle, every invasive vine  --  until the soil was clean and dark and beautiful.

They were very pleased with themselves.

By midsummer, the weeds were back.

Not because they had done anything wrong. Not because the garden was bad soil. Simply because that is the nature of a garden left without regular attention. Weeds do not need an invitation. They are always there, waiting. The garden needs tending  --  not once, but all the time.

Your soul is a garden that God planted. Confession is not a one-time clearing that lasts forever. It is part of the regular tending  --  the honest, humble, weekly or monthly look at what has grown up that should not be there.

The saints understood this. St. John Vianney  --  the great Cure of Ars, who spent sixteen hours a day in the confessional  --  went to Confession himself every single day. Not because he was a great sinner, but because he understood that the soul, like a garden, thrives with attention.

Confession is not a crisis measure. It is maintenance. It is the regular practice of turning toward God and asking Him to help you see what you cannot see yourself.

We go not because we have done something terrible. We go because we are human. And the garden needs tending.`,
        theologyNote: `The recommendation of frequent Confession is found throughout the Church's tradition. The Council of Trent encouraged monthly Confession for the faithful. St. Pius X, who lowered the age of First Communion to the age of reason, also encouraged frequent Communion and frequent Confession together. The Catechism notes that regular Confession of venial sins helps form the conscience, fights evil inclinations, and opens us to the grace of God. For children, the key shift is from Confession as emergency measure to Confession as spiritual hygiene  --  something that belongs to the rhythm of Catholic life alongside Sunday Mass.`,
        conversation: `"If you only cleaned your bedroom once a year because it was clean after the big clean, what would happen? How is Confession like cleaning your room  --  but for your soul?"`,
        prayer: `Lord, help me to treat Confession not as something I only need when things are terrible, but as a regular part of how I live close to You. Keep my garden tended. Amen.`,
        notice: `This week, notice when something in your house is maintained regularly  --  dishes, laundry, brushing teeth. These things are done not because there is a crisis, but because they belong to a healthy life. Confession belongs there too.`
      },

      {
        week: 11,
        theme: "The Woman at the Well",
        partTitle: "Confession Changes How You See Yourself",
        story: `There was a woman in the Gospel of John who came to a well at noon. Not in the morning, when all the other women came together, chatting and filling their jars in company. At noon. Alone. The middle of the day, the hottest hour  --  because she did not want to be seen.

She had a history. She had been married five times. The man she was living with now was not her husband. The other women knew. And she had decided that the way to survive this was to become invisible.

Then a Jewish man she had never met sat down at the well and asked her for water. And then  --  astonishing thing  --  He told her everything she had ever done.

Not to condemn her. Not to make her feel worse about herself than she already did. He told her because He saw her  --  completely and truly  --  and still sat down at the well. Still spoke to her. Still offered her, of all people, living water.

She left her jar at the well and ran back to the village. The woman who had come at noon to avoid being seen ran through the streets saying: Come and see a man who told me everything I ever did.

Confession is not about feeling worse about yourself. It is about being seen  --  truly seen, all the way through  --  by Someone who already knows, who loves you anyway, and who offers you living water.

After Confession, you can run.`,
        theologyNote: `John 4:4-42. The Samaritan Woman at the Well is one of the longest recorded conversations Jesus has with anyone in the Gospels, and notably with a woman, a Samaritan, and a sinner  --  three categories of person a Jewish rabbi was not expected to speak with. The detail that she came at noon (instead of morning) is a narrative clue to her social isolation. After her encounter with Jesus, she becomes effectively an apostle  --  the first person in John's Gospel to proclaim the Messiah. This reversal is significant: the person most defined by shame becomes the person most willing to be seen. Confession has this same dynamic  --  the encounter with Christ's truth brings freedom rather than deeper shame.`,
        conversation: `"The woman at the well was hiding. After she met Jesus, she ran into the streets to tell people about Him. What do you think changed inside her between the well and the streets?"`,
        prayer: `Lord Jesus, You see everything I have ever done and You still sit down at the well and ask to speak with me. After Confession, help me to run. Amen.`,
        notice: `This week, pay attention to moments when someone is hiding  --  keeping quiet in case they say the wrong thing, staying at the back, not wanting to be noticed. Think about what it would take to set them free.`
      },

      {
        week: 12,
        theme: "The First Confession",
        partTitle: "What Happens After",
        story: `Tomorrow  --  or soon  --  you will walk into a confessional for the first time.

I want to tell you something about what will happen after.

You will come back to your seat. And if you sit quietly for a moment  --  not rushing to find your family, not immediately thinking about what comes next  --  you may notice something. A stillness. A lightness. Something that is hard to put into words because it is not an emotion exactly, though it may feel like one.

What you are experiencing is grace. Real grace  --  the life of God  --  fully present in your soul in a way it could not be while you were carrying what you just laid down.

You are clean. Not mostly clean. Not somewhat clean. Clean.

St. John Vianney could see this. People would come to him after Confession and he could look at them and see the difference. He called it the beauty of a soul in the state of grace. He said it was the most beautiful thing he knew.

That will be you, sitting in that pew.

And then you have a choice. You can stand up and walk out as if this were a routine appointment. Or you can stay for one extra minute  --  just one  --  and speak to God as a friend speaks to a friend. Tell Him you love Him. Thank Him. Ask Him what He wants you to do with this clean soul He has given you.

The second way is better.

What happens after Confession is as important as what happens in it. God gives you the grace. You decide what to do with it.`,
        theologyNote: `This final session of the First Confession curriculum is deliberately pastoral rather than doctrinal. The key teaching is the thanksgiving after the sacrament  --  what the Church calls the "post-sacramental devotion." St. John Vianney (Jean-Baptiste-Marie Vianney, 1786-1859, Cure of Ars) was renowned for his insight into souls, reportedly able to discern the spiritual state of penitents. His testimony about the beauty of a soul in grace is recorded in multiple sources about his life. The parent should make a plan now for how they will mark this occasion  --  quietly, reverently, with joy.`,
        conversation: `"After your First Confession, we are going to celebrate. But the real celebration happens before the cake  --  it happens in that pew, in that minute of quiet. What do you want to say to God in that minute?"`,
        prayer: `Lord, I am almost ready. Be with me when I walk in. Be with me while I speak. Be with me when I walk out. And help me to stay  --  just for a moment  --  to thank You. Amen.`,
        notice: `This week, think about one thing you want to do differently after your First Confession. Not a huge resolution. Just one small, real thing. Write it down somewhere private.`
      }

    ]
  },

  communion: {
    title: "First Holy Communion",
    color: "#C9A96E",
    bg: "#FDF8EE",
    weeks: [

      // ── PART ONE: THE MASS (Weeks 1-3) ──

      {
        week: 1,
        theme: "The Same Fire",
        partTitle: "What the Mass Actually Is",
        story: `There is a candle that burns in every Catholic church in the world, in a red glass near the tabernacle. It is called the sanctuary lamp, and it is never extinguished. It has been burning, in one form or another, for two thousand years.

When you light one candle from another, you have not made a copy of the first flame. You have taken the actual fire  --  the same fire  --  and carried it forward. The first flame and the new flame are the same fire. Not a reproduction. Not an imitation. The same.

The Mass is something like this.

Two thousand years ago, on a Thursday night, Jesus took bread and wine at a table in Jerusalem and said words that changed everything: "This is My Body. This is My Blood. Do this in memory of Me." The next day, He went to the Cross and offered Himself to the Father  --  one perfect sacrifice for the sins of the whole world.

Every Mass that has ever been celebrated, anywhere in the world, in any century, in any language  --  is not a copy of that sacrifice. It is the same sacrifice, made present again. The same fire carried forward.

When you come to Mass, you are not watching a commemoration of something that happened a long time ago. You are standing at the foot of the Cross. The same Cross. The same Jesus. The same offering.

You will receive this  --  truly receive Him  --  at your First Communion.`,
        theologyNote: `The doctrine here is the Sacrifice of the Mass as a re-presentation (not re-enactment or repetition) of the one sacrifice of Calvary. The Council of Trent defined this against the Protestant reformers who argued the Mass was either a mere memorial or a second sacrifice implying Christ's death was insufficient. Catholic theology holds that Christ's sacrifice on Calvary is numerically one and eternally complete, but its application to souls continues through the Mass  --  the same sacrifice made sacramentally present in time. "Anamnesis"  --  the Greek word for memorial used in the Eucharistic Prayer  --  means not mere remembrance but making-present. The sanctuary lamp detail is historically accurate and pedagogically useful.`,
        conversation: `"If the Mass is not a copy but the same sacrifice, that means Jesus is actually offering Himself right now at every Mass happening anywhere in the world. How does that change the way you feel about sitting in the pew?"`,
        prayer: `Lord Jesus, every time I am at Mass, help me to remember that I am not watching a memory. I am standing at Your Cross. Give me the reverence this deserves. Amen.`,
        notice: `This week at Mass, when the bell rings at the Consecration, remember: this is the moment. The sacrifice of Calvary is made present. Try to be very still for that moment.`
      },

      {
        week: 2,
        theme: "The Burning Bush",
        partTitle: "Something Hidden Inside Something Ordinary",
        story: `Moses was doing something ordinary  --  tending his father-in-law's flock in the desert  --  when he saw it. A bush that was burning, but not burning up. The fire was real. The bush was real. But the bush was not being consumed by the fire.

He turned aside to look. And from the middle of the ordinary burning bush, God spoke.

God had hidden Himself inside something ordinary  --  a thornbush in the Sinai desert  --  and made it extraordinary from within, without destroying the ordinary thing.

This is one of the oldest images of what will happen at your First Communion.

The bread on the altar looks like bread. It feels like bread. It smells like bread. Every physical thing about it that your senses can detect is bread. But at the moment of Consecration  --  the moment the priest says the words of Christ over it  --  what it is changes completely. The bread is gone. What remains looks like bread, but it is the Body, Blood, Soul, and Divinity of Jesus Christ.

Not partly. Not symbolically. Entirely.

The burning bush was not on fire in the ordinary way. The Eucharist is not bread in the ordinary way. God hides inside what looks ordinary and fills it with Himself.

This is why we kneel. This is why we are silent. This is why nothing else in the church compares to the tabernacle, where He waits.`,
        theologyNote: `Exodus 3:1-6. The burning bush as an image of the Eucharist comes from the writings of Gregory of Nyssa (4th century) and has been used in Catholic catechetics for centuries. The technical doctrine is transubstantiation  --  defined by the Fourth Lateran Council (1215) and reaffirmed by Trent. The substance (what a thing truly is) changes; the accidents (what it appears to be  --  color, shape, taste, texture) remain. This is not physically verifiable, which is why it is an object of faith. John 6 is the key scriptural text; Jesus uses the word "trogo" (to gnaw, to munch  --  a word used for real physical eating) when insisting His flesh is real food.`,
        conversation: `"Why do you think God would choose to hide inside something as ordinary as bread? He could have chosen something more dramatic  --  something gold, or glowing, or impossible to miss. Why bread?"`,
        prayer: `Lord Jesus, I believe You are truly present in the Eucharist  --  not as a symbol, but as Yourself. Help me to treat the tabernacle the way I would treat You if I could see You standing there. Amen.`,
        notice: `This week, look at ordinary things  --  a glass of water, a handful of soil, a candle flame  --  and think about how God hides inside ordinary things to reveal Himself. The Eucharist is the fullest version of this, but creation is full of hints.`
      },

      {
        week: 3,
        theme: "The Emmaus Road",
        partTitle: "Where He Is Recognized",
        story: `The day of the Resurrection, two of Jesus's disciples were walking from Jerusalem to a village called Emmaus  --  about seven miles. They were sad, confused, their hopes destroyed. They had believed He was the Messiah. Now He was dead.

A stranger joined them on the road. They did not recognize Him. He walked with them for seven miles, and He talked about the Scriptures  --  explaining everything that the prophets had written about the Messiah, opening it up so their hearts burned within them. Seven miles of the most profound conversation they had ever had.

And still they did not recognize Him.

They arrived at Emmaus and invited the stranger to stay for supper. He sat at the table. He took the bread. He blessed it. He broke it. He gave it to them.

And in the breaking of the bread  --  their eyes were opened, and they recognized Him.

He vanished from their sight.

And they got up immediately, in the dark, and walked seven miles back to Jerusalem to tell the others.

You have heard the Gospel read at Mass many times. Perhaps it has sometimes seemed slow, or hard to follow, or distant. The Emmaus story is showing you something: His voice opens the Scriptures, but it is at the breaking of the bread that eyes are opened. The Mass is those two things  --  the Liturgy of the Word and the breaking of the bread. Both together. Neither alone is the full encounter.

Your First Communion will be the first time your eyes are opened in this way.`,
        theologyNote: `Luke 24:13-35. The Emmaus account is the clearest narrative in Scripture of the Mass as a two-part structure: Liturgy of the Word (the exposition of the Scriptures on the road) and Liturgy of the Eucharist (the breaking of the bread at supper). This is not a later theological imposition  --  Luke's narrative pattern mirrors the liturgical structure of the early Church. The detail that the disciples did not recognize Jesus during seven miles of conversation, but recognized Him immediately in the breaking of the bread, is a catechetical text used by the early Church to defend the Real Presence.`,
        conversation: `"The disciples walked seven miles with Jesus and didn't recognize Him  --  even though their hearts were burning. They only knew who He was when He broke the bread. What do you think that tells us about where Jesus especially wants to be found?"`,
        prayer: `Lord Jesus, open my eyes at the breaking of the bread. Let me not walk seven miles beside You without knowing You are there. Amen.`,
        notice: `This week, pay attention to both parts of the Mass  --  the readings and the Eucharist. See if you can feel the connection between the two: the Word preparing you to receive the Word made flesh.`
      },

      // ── PART TWO: THE REAL PRESENCE (Weeks 4-6) ──

      {
        week: 4,
        theme: "This Is My Body",
        partTitle: "The Words Jesus Would Not Take Back",
        story: `In the sixth chapter of John's Gospel, Jesus gives what is called the Bread of Life discourse. He is speaking to a large crowd near the Sea of Galilee  --  people who had just seen Him multiply loaves and fish for five thousand. They were impressed. They followed Him to the other side of the lake looking for more.

And Jesus said: "I am the bread of life... the bread that I shall give is My flesh, for the life of the world."

The crowd immediately divided. Some said: this is a hard saying. Who can accept it? Others began to murmur among themselves, asking how this man could give them his flesh to eat.

And here is the moment that matters most for what we are learning: Jesus did not clarify. He did not say: I was speaking symbolically, of course. He did not soften the teaching. He turned to the crowd and said it again, more emphatically: "Unless you eat the flesh of the Son of Man and drink His blood, you do not have life in you."

Many of His disciples left. Not just a few uncomfortable people. Many walked away.

Jesus turned to the twelve apostles and asked: "Will you also go away?"

Peter answered for them all: "Lord, to whom shall we go? You have the words of eternal life."

They did not understand. But they stayed. And at the Last Supper, they understood why: He took bread, broke it, and said  --  "This is My Body."

He was not speaking symbolically. He never said He was.`,
        theologyNote: `John 6:22-69 is the central Eucharistic text of Scripture. The key exegetical point for parents: when Jesus is speaking symbolically or metaphorically in John's Gospel, and listeners misunderstand, He always clarifies. (Example: Nicodemus misunderstands "born again"; Jesus clarifies in John 3.) When the crowd in John 6 misunderstands  --  they hear His words about eating His flesh as literal  --  Jesus does not clarify. Instead He emphasizes. The Greek verb changes from "phago" (to eat) to "trogo" (to gnaw/munch), making the physical realism more, not less, explicit. The disciples who leave do so because they understand He means what He says. This is the strongest scriptural argument for the Real Presence.`,
        conversation: `"When many disciples left because of the hard teaching, Jesus did not run after them to explain it away. He let them go. What does that tell you about how seriously He meant what He said?"`,
        prayer: `Lord Jesus, You said "This is My Body" and You did not take it back even when people walked away. Help me to believe You  --  simply, completely, without needing it to make sense to me first. Amen.`,
        notice: `This week, read John 6 together  --  the whole Bread of Life discourse. It may take twenty minutes. Notice how many times Jesus repeats the same teaching, each time more clearly.`
      },

      {
        week: 5,
        theme: "The Wedding Feast at Cana",
        partTitle: "His Presence Changes Things",
        story: `The first miracle Jesus performed  --  the first sign of His divine power  --  was at a wedding in a small village called Cana in Galilee.

The wine ran out. A social catastrophe for the family hosting the feast. His mother Mary noticed and came to Jesus: "They have no wine." His response is strange: "My hour has not yet come." But His mother turns to the servants and says simply: "Do whatever He tells you."

Jesus tells the servants to fill six stone water jars with water. Each jar holds between twenty and thirty gallons. They fill them to the brim. Then He says: draw some out and take it to the head waiter.

The head waiter tastes it. He does not know where it came from. But he calls the bridegroom and says: everyone serves the good wine first, and when people have drunk freely, then the poor wine. But you have kept the good wine until now.

The water had not been mixed with wine. The water had not been treated. The water had been transformed  --  at His word, through the hands of servants who simply obeyed  --  into the best wine of the feast.

This is what the Eucharist is. Bread and wine, placed in the hands of a priest who does whatever Jesus tells him, transformed by the words of Christ into something entirely different. What comes out is not a mixture. It is not an improvement. It is Him.

Wherever Jesus is truly present, things are changed. At Cana, ordinary water became extraordinary wine. At the altar, ordinary bread and wine become Him.`,
        theologyNote: `John 2:1-11. Cana is John's first sign  --  miracles in John are called "signs" because they point to something beyond themselves. The transformation of water into wine is a sign of the Eucharist: the complete transformation of matter by the word of Christ. Mary's instruction to the servants  --  "Do whatever He tells you"  --  is her only recorded command in all of Scripture, and it is essentially a catechetical instruction for the Church about the Eucharist: do what He says, and the transformation will happen. The "good wine kept until the end" is also read by Church Fathers as pointing to the Eucharist  --  the supreme gift kept for the fullness of time.`,
        conversation: `"The servants had to do two things: fill the jars (do the ordinary work) and trust that what came out would be different. How is receiving Communion like this  --  doing something ordinary (walking up, opening your mouth) and trusting that what you receive is something extraordinary?"`,
        prayer: `Lord Jesus, Mary said 'Do whatever He tells you.' Help me to do whatever You tell me  --  at Mass, in life, every day. And when I do, transform what is ordinary in me into something more. Amen.`,
        notice: `This week, notice moments when following instructions exactly leads to something unexpected or better than expected. A recipe followed carefully, directions that turn out to be exactly right. Trust and obedience produce things surprise cannot.`
      },

      {
        week: 6,
        theme: "The Hem of His Garment",
        partTitle: "Why We Kneel and Why It Matters",
        story: `In the Gospels, there are twelve years of hemorrhage. A woman who had been ill for twelve years  --  who had spent everything she had on doctors and grown worse  --  came up behind Jesus in a crowd and touched the hem of His garment.

Not His hand. Not His shoulder. The hem. The lowest, outermost edge of His clothing. She reached through the crowd and touched the fringe of His robe.

And she was immediately healed.

Jesus stopped. He asked who had touched Him. The disciples were confused  --  the crowd was pressing in on all sides, dozens of people jostling. But Jesus knew: power had gone out from Him.

The woman came, trembling, and fell at His feet.

She had believed that even the hem  --  the very edge of proximity to Him  --  would be enough. She was right.

When we kneel to receive Communion, or bow our heads, or receive on the tongue, we are doing something like what she did. We are not pretending. We are not performing reverence as a show. We are saying, with our bodies, what she said by reaching through the crowd: even the hem is enough. You are so far beyond what I deserve that the most I can do is reach out humbly and ask for the grace.

And He stops. And power goes out from Him. And He asks who has touched Him.

Your reverence at Communion is the way you reach through the crowd.`,
        theologyNote: `Mark 5:25-34, Luke 8:43-48. The woman with the hemorrhage is one of the most theologically rich healing narratives in the Gospels  --  she is healed not by Jesus's deliberate act but by her faith-filled contact, after which Jesus identifies that power has gone out from Him. This has been read by theologians as a prototype of sacramental grace: grace that flows from Christ's person, received through faith-filled contact rather than merely cognitive assent. The posture of reception (kneeling, on the tongue in the Traditional form) is not mere rubric but an embodied theology: the body expresses what the soul believes. St. John Paul II wrote extensively on this in Theology of the Body.`,
        conversation: `"The woman believed that even the hem of His garment would be enough. When you receive Communion, you are receiving not the hem but the whole Person. How should that change the way you walk up to receive?"`,
        prayer: `Lord, I reach through the crowd to touch even the hem of Your garment, trembling, hoping it is enough. And You stop. Thank You for stopping. Amen.`,
        notice: `This week, pay attention to how you hold your body when you are in the presence of something or someone you deeply respect. Notice that your body knows what your mind believes.`
      },

      // ── PART THREE: RECEIVING WORTHILY (Weeks 7-9) ──

      {
        week: 7,
        theme: "The King's Table",
        partTitle: "What It Means to Be Ready",
        story: `Imagine you have been invited to dinner at the home of the greatest person you have ever heard of. Not a celebrity  --  someone of genuine greatness and goodness. You know that they know everything about you. Nothing is hidden.

How would you prepare?

You would not arrive in muddy clothes. You would not come without thinking about what you were doing and why. You would come having thought carefully about whether you were someone the great person would want to welcome to their table  --  not because they are unkind, but because the invitation is a serious thing and you take it seriously.

The Eucharist is an invitation to the King's table. Not a metaphorical king  --  the actual King of the universe, Who is also your Father, Who loves you more than you can comprehend.

The Church asks two things for receiving worthily: that you believe what the Eucharist is, and that your soul is in a state of grace  --  free from serious sin.

This is why Confession comes first. Not as a bureaucratic requirement. But because it would be strange  --  and not actually a kindness to you  --  to come to the King's table in muddy clothes when He has offered you the chance to be clean first.

The invitation is real. The preparation honors it.`,
        theologyNote: `1 Corinthians 11:27-29  --  "Whoever eats the bread or drinks the cup of the Lord unworthily will be guilty of the Body and Blood of the Lord... For one who eats and drinks without discerning the body eats and drinks judgment upon himself." This is the scriptural foundation for the requirement of a state of grace for reception. The two conditions for worthy reception: (1) Catholic faith in the Real Presence, and (2) freedom from mortal sin (if uncertain, Confession first). The Eucharistic fast  --  one hour from solid food and beverages except water  --  is a discipline of preparation, not a doctrine.`,
        conversation: `"The Church says we should be in a state of grace to receive Communion. Some people think this is too strict. But if Jesus is truly present in the Eucharist, does the preparation seem too strict or not strict enough?"`,
        prayer: `Lord, I want to come to Your table worthily  --  not because I think I deserve it, but because You deserve to be received with my best effort at cleanliness and preparation. Help me to prepare well. Amen.`,
        notice: `This week, think about how you prepare for things you consider important  --  a big game, a performance, a special occasion. Let that help you think about how to prepare for Communion.`
      },

      {
        week: 8,
        theme: "The Eucharistic Fast",
        partTitle: "Why the Body Prepares Too",
        story: `In the ancient world, before someone went to see the king, they would fast. Not forever  --  but for a time before the audience. The emptying of the body was a way of saying: I am not coming to You for what You can give me to eat. I am coming for You.

The Church has always asked those receiving Holy Communion to come with an empty stomach. Not a long fast  --  in the traditional practice, three hours; in the current practice, one hour. A small fast. A brief hunger.

Why?

Because your body is not separate from your soul. When you kneel at the communion rail, every part of you is receiving  --  not just your spirit, but the body that will one day share in the resurrection. The fast is the body's way of saying: I am hungry for something that no ordinary food can give me.

There is also a practical mysticism to it. When you walk up to receive Communion with an empty stomach, you feel it differently. Your physical hunger becomes a kind of prayer. You are not distracted by what you just ate. You are present in a particular way  --  empty, receptive, waiting.

Fasting is an ancient and beautiful discipline. It is not a punishment. It is preparation. And it begins the night before your First Communion.`,
        theologyNote: `The Eucharistic fast was historically a complete fast from midnight until reception  --  a discipline maintained until the early 20th century. St. Pius X reduced it for the sick and elderly. Paul VI reduced the general fast to one hour of solid food before reception (water and medicine excepted). The traditional practice of three hours is still recommended by many spiritual directors. The theological principle: the body participates in the sacrament; therefore the body prepares. This connects to the broader Catholic understanding of the body as integral to the human person rather than incidental to spiritual life.`,
        conversation: `"The next morning when you wake up hungry before your First Communion, that hunger is going to mean something. What will you say to yourself in that moment to remind yourself of why you are hungry?"`,
        prayer: `Lord, teach my body to fast and my soul to hunger. Let the emptiness of my stomach on that morning be filled with expectation for You. Amen.`,
        notice: `This week, try a small fast. Miss a snack you usually have, or wait a little longer than usual before a meal. Notice what hunger feels like, and then turn it into a prayer: this is what my soul feels when it is far from God.`
      },

      {
        week: 9,
        theme: "The Anima Christi",
        partTitle: "The Prayer You Will Say After",
        story: `After Holy Communion  --  after the greatest moment of your life so far  --  there will be a few minutes of quiet in the pew. The Mass will continue around you, but for a brief time, Jesus is present in you in a way that is unique, immediate, and passing.

He does not leave you when the species dissolves. But this particular moment of His immediate Eucharistic presence is brief. The saints called it the most precious time of the day.

What do you say to God when He is that close?

There is a prayer that the Church has used for centuries  --  scholars think it dates to the thirteenth or fourteenth century, though some attribute it to St. Ignatius of Loyola who made it famous. It is called the Anima Christi  --  Soul of Christ.

Soul of Christ, sanctify me.
Body of Christ, save me.
Blood of Christ, inebriate me.
Water from the side of Christ, wash me.
Passion of Christ, strengthen me.
O good Jesus, hear me.
Within Thy wounds hide me.
Let me never be separated from Thee.
From the malignant enemy defend me.
At the hour of death call me.
And bid me come to Thee,
That with Thy saints I may praise Thee
Forever and ever. Amen.

This is what you say to Someone who is that close.

Memorize it this week. It belongs to you now.`,
        theologyNote: `The Anima Christi is in the public domain  --  it dates from the 14th century, predating Ignatius of Loyola by roughly 200 years, though he used it so frequently that it became associated with him. It is included in many Catholic prayer books and is considered one of the finest post-Communion prayers in the tradition. Key phrase for catechesis: "Within Thy wounds hide me"  --  the image of finding refuge in the wounds of Christ comes from mystical theology and connects to the Sacred Heart devotion. "Inebriate me" means to fill me to overflowing  --  as wine fills a person, let Your Blood fill me.`,
        conversation: `"'Within Thy wounds hide me'  --  that is a strange and beautiful thing to ask. What do you think it means to hide in Christ's wounds?"`,
        prayer: `Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. O good Jesus, hear me. Amen.`,
        notice: `This week, memorize the Anima Christi. Say it every morning when you wake up, as practice for saying it after Communion. Let it become something you know by heart.`
      },

      // ── PART FOUR: EUCHARISTIC LIVING (Weeks 10-12) ──

      {
        week: 10,
        theme: "Spiritual Communion",
        partTitle: "When You Cannot Receive",
        story: `There were times in the history of the Church when Catholics could not get to Mass. Times of persecution, when priests were hunted and Masses were said in secret, in private homes, in forests, in prisons. Times of illness. Times of war. Times when the distance was simply too great.

And yet the saints of those times grew, somehow, in Eucharistic devotion  --  not despite the separation, but perhaps partly because of it.

They had learned to make what is called a Spiritual Communion  --  an act of desire, a reaching of the soul toward Jesus in the Eucharist even when physical reception is impossible. St. Thomas Aquinas, St. Teresa of Avila, and countless others describe its power: the soul that longs for Jesus with genuine desire receives something real from that longing, even without the sacrament.

St. Teresa of Avila wrote that when she could not receive Communion, she would make a Spiritual Communion so fervently that she felt the same effects  --  the warmth, the peace, the sense of His presence  --  as after actual reception.

There is a simple prayer for this: "My Jesus, I believe that You are truly present in the Most Holy Sacrament. I love You above all things, and I desire to receive You into my soul. Since I cannot now receive You sacramentally, come at least spiritually into my heart..."

You can say this at any Mass where you cannot receive Communion. You can say it at home when you pass a church. You can say it anywhere, anytime, as a way of turning toward Him.

After your First Communion, this becomes part of how you live.`,
        theologyNote: `The doctrine of Spiritual Communion is rooted in the teaching that the sacraments work ex opere operato (by the act performed) but also require the faith and desire of the recipient. When sacramental reception is impossible, genuine desire for the sacrament receives some of its grace. This is not a diminished version of the Eucharist but a distinct act of devotion. St. Teresa of Avila's testimony (Interior Castle, various works) about the effects of Spiritual Communion is among the most detailed in Catholic mystical literature. Spiritual Communion is particularly relevant for children who will attend weekday Masses without receiving Communion.`,
        conversation: `"If you could make a Spiritual Communion anywhere, anytime  --  on the school bus, in the middle of dinner, lying in bed  --  when do you think you might want to do that?"`,
        prayer: `My Jesus, I believe You are truly present in the Most Holy Sacrament. I love You above all things, and I desire to receive You. Come spiritually into my heart. Amen.`,
        notice: `This week, every time you pass a church, say the Spiritual Communion prayer. The tabernacle is in there. He is in there. Acknowledge Him.`
      },

      {
        week: 11,
        theme: "The Loaves and Fishes",
        partTitle: "What He Does With What You Bring",
        story: `Thousands of people had been with Jesus all day in a remote place, and they were hungry. His disciples came to Him anxious: we have nothing here but five loaves and two fish. The situation is impossible. Send them away.

Jesus said: bring them to Me.

He took what was brought  --  the pitifully small, the clearly insufficient, the not-enough  --  looked up to heaven, blessed it, broke it, and gave it to the disciples to distribute.

And there was enough. More than enough. Twelve baskets left over, one for each apostle.

Notice what He did not do: He did not produce the loaves and fishes out of nothing. He started with what the disciples had and transformed it. What was not enough became more than enough when it passed through His hands.

After your First Communion  --  after you have given yourself to Him and received Him in return  --  something similar happens to your ordinary life. The moments of patience that feel like not enough, the small kindnesses you feel are too small to matter, the prayers that feel too short and too weak  --  when you bring them to Him, they pass through His hands.

The Eucharist does not make you perfect. It makes you different. It changes what you are able to give, in the same way that the five loaves became enough for five thousand.

What you bring is never enough. What He gives back to you is.`,
        theologyNote: `Matthew 14:13-21, Mark 6:30-44, Luke 9:10-17, John 6:1-14. The multiplication of the loaves is the only miracle (other than the Resurrection) recorded in all four Gospels, which indicates its centrality to the kerygma. In John's Gospel it immediately precedes the Bread of Life discourse  --  the connection is deliberate and catechetical. The Eucharistic language  --  "took, blessed, broke, gave"  --  is the exact same sequence used at the Last Supper. The early Church read this miracle as a foreshadowing of the Eucharist. The lesson about insufficiency becoming sufficiency in His hands is a central Eucharistic spirituality.`,
        conversation: `"What is something in your life right now that feels like not enough  --  not enough patience, not enough kindness, not enough courage? How could you bring that to Him at Mass?"`,
        prayer: `Lord, I bring You my not-enough. My small five loaves. My two fish. Take them, bless them, break them, and give them back to me  --  enough for whatever You ask. Amen.`,
        notice: `This week, when something feels insufficient  --  your patience runs out, you feel too tired to be kind  --  say: Lord, I am bringing You five loaves and two fish. Please multiply.`
      },

      {
        week: 12,
        theme: "The First Communion",
        partTitle: "What This Day Is",
        story: `Today  --  or soon  --  something will happen that has never happened before in the history of the world.

God, who spoke the universe into existence, who holds every atom in being by an act of His will, who is infinite and eternal and beyond all comprehension  --  will enter your body.

Not symbolically. Not as a memory. Actually, really, truly  --  Him.

Theologians call this the hypostatic union: God and man united in the Person of Jesus. At your First Communion, something analogous and equally astonishing happens: the God-Man unites Himself to you, personally. He enters your body the way fire enters a piece of iron heated in the forge  --  the iron does not become fire, but it glows.

You will not look different walking out of the church. No one can take a photograph of grace. But something will have happened that is real  --  more real than anything that has ever happened to you.

Here is what the saints say about this moment: receive Him as if it were the last time you would ever receive. And receive Him as if it were the first time He had ever come to anyone.

Both of those things are true of your First Communion.

After Mass, we will celebrate. But first  --  sit in the pew. Be still. Let Him be there. He has waited for this day longer than you have.`,
        theologyNote: `St. John Chrysostom wrote: "I wish to become fire, and to go up to heaven." The image of iron heated in the forge  --  becoming fire-like without ceasing to be iron  --  is a patristic image of the soul transformed by the Eucharist while remaining itself. The instruction to "receive as if for the last time and as if for the first time" is attributed to various saints in various forms; it reflects the mystical principle that each Communion is unique and unrepeatable. Parents should plan a meaningful celebration but ensure that the priority is given to the time of thanksgiving after reception  --  the quiet pew time before anything else.`,
        conversation: `"Before we go in today, is there one thing you want to say to Jesus before you receive Him for the first time? Just one thing. Say it now."`,
        prayer: `Lord Jesus, I am not worthy that You should enter under my roof. But only say the word, and my soul shall be healed. Come. I have been waiting for You. Amen.`,
        notice: `After your First Communion: sit still in the pew. Before anything else. Before looking for your family, before thinking about the party, before everything. Just sit. He is there.`
      }

    ]
  },

  confirmation: {
    title: "Confirmation",
    color: "#5B6FA6",
    bg: "#EEF0FA",
    weeks: [

      // ── PART ONE: BAPTISM COMPLETED (Weeks 1-3) ──

      {
        week: 1,
        theme: "The Sealed Letter",
        partTitle: "What Baptism Gave You and What Confirmation Perfects",
        story: `When a king in the ancient world sent an ambassador to another king, the message carried his seal. The seal was pressed into warm wax before it dried  --  the king's own ring, pressed down with his authority, making the letter official. Without the seal, the letter was just words. With the seal, it was binding.

At your Baptism, something like this happened to your soul. You were claimed by God. The Holy Trinity  --  Father, Son, and Holy Ghost  --  made a home in your soul. You were sealed with the seal of faith, marked as belonging to Christ. This mark is permanent  --  it cannot be removed by sin, by time, or by anything else. Even if you walked away from the faith, the seal would remain.

But Baptism is, in a sense, the letter that has been written and sealed but not yet sent. The grace is real. The claim is real. The life of God is in your soul. But you have not yet been fully equipped for the mission.

Confirmation is the sending.

At Confirmation, the bishop  --  the successor of the apostles  --  lays his hand on your head and anoints you with chrism. And the Holy Ghost comes, not for the first time, but more fully. More powerfully. With gifts that are specifically for the work you are being sent to do.

The letter is not just sealed. It is delivered.`,
        theologyNote: `The sacramental character of Baptism is one of three permanent marks on the soul (the others being Confirmation and Holy Orders). CCC 1272-1274. Confirmation completes Baptism by bestowing the fullness of the Holy Ghost for mission  --  it is sometimes called the "sacrament of Christian maturity" though this language can mislead. The Catechism is clear that Confirmation is not a mere coming-of-age ritual; it is the perfecting of baptismal grace for witness. The laying on of hands by the bishop connects directly to Acts 8:17 and the apostolic tradition.`,
        conversation: `"At Baptism you were claimed by God. The seal is permanent. But Confirmation adds something  --  the sending, the equipping. What do you think God might be sending you to do, specifically?"`,
        prayer: `Holy Ghost, You came to me at Baptism and claimed me. Come again at Confirmation and send me. I want to be used. Tell me what I am for. Amen.`,
        notice: `This week, find something that has a seal on it  --  an official letter, a document, a wax seal if you can. Look at it and think about what the seal means: this belongs to someone. This is authorized. This is real.`
      },

      {
        week: 2,
        theme: "The Chrysalis",
        partTitle: "Something That Was Already There, Made More",
        story: `A caterpillar does not become a butterfly because something from outside is added to it. The butterfly was always there  --  contained, compressed, waiting  --  inside the caterpillar. The chrysalis is the process by which what was potential becomes actual. What was hidden becomes visible.

Confirmation is something like this for the grace of Baptism.

The Holy Ghost already lives in your soul if you are baptized and in a state of grace. The gifts are already there, in seed form. Confirmation does not bring something completely foreign  --  it brings what is already there to fullness, like a seed into a full-grown tree, like a chrysalis opening.

This matters because some people treat Confirmation as if it were graduation  --  as if, once confirmed, they have finished something. But Confirmation is not a finishing. It is a becoming.

The butterfly does not emerge and sit still. It was made to fly.

After your Confirmation, the question is not: what have I completed? The question is: what am I now capable of that I was not before? What does God want me to do with these fully-given gifts?

The wings are not for looking at.`,
        theologyNote: `The metaphor of the chrysalis was used by early Christian writers to describe the relationship between Baptism and Confirmation, and between the present life and the resurrection. The key doctrinal point: Confirmation does not add new theological virtues (faith, hope, charity were given at Baptism); it strengthens them and adds the seven gifts of the Holy Ghost in their fullness. The traditional formula at Confirmation  --  "Be sealed with the Gift of the Holy Spirit"  --  indicates a perfecting of what was begun.`,
        conversation: `"What do you think you are capable of after Confirmation that you are not fully capable of now  --  not because of age, but because of the gifts?"`,
        prayer: `Holy Ghost, I am a chrysalis. What You are making me into is more than I can see right now. Help me not to stay still when the wings are given. Amen.`,
        notice: `This week, find a chrysalis if you can, or look at photographs of one. Sit with the image of something that looks finished but is actually in the middle of becoming.`
      },

      {
        week: 3,
        theme: "Pentecost",
        partTitle: "What Happened to the Apostles Is What Will Happen to You",
        story: `On the day of Pentecost, the apostles were gathered in a room  --  the same room where they had hidden after the Crucifixion, the same room where the risen Jesus had come to them twice.

They were afraid. Not as afraid as before  --  they had seen the Risen Lord. But still uncertain. Still asking: what do we do now? Still very much the same frightened men they had been on Good Friday.

Then came the sound like a rushing wind, filling the whole house. Then came the tongues of fire, coming to rest on each of them. Then Peter  --  who had denied Christ three times to a servant girl  --  stood up in front of thousands of people and preached with a force and clarity that had never been in him before.

Three thousand people were baptized that day.

This is the same Peter who had been hiding in a locked room fifty days earlier.

The Holy Ghost does not work around our weakness. He works through it. The apostles were not made brave by becoming less afraid  --  they were made brave by receiving Someone who was brave inside them.

At Confirmation, the same Holy Ghost who descended on those twelve men in Jerusalem will come to you. Not to make you someone different. To make you more completely who you already are  --  but with fire.`,
        theologyNote: `Acts 2:1-41. Pentecost is the birthday of the Church and the scriptural model for Confirmation. The transformation of Peter is the clearest evidence of the Spirit's action: the same person, radically different in courage and clarity. Key for children: the Spirit does not replace the person  --  He fills the person. The same Peter remains; his essential character (impetuous, passionate, warm) is not destroyed but directed. Confirmation does not make you a different person; it makes your gifts available to God in a new way.`,
        conversation: `"Peter denied Jesus three times, then preached to thousands fifty days later. He was not a different person  --  he was the same person with the Holy Ghost. What in you do you think the Holy Ghost wants to use?"`,
        prayer: `Come, Holy Ghost, fill my heart with fire. Take my weakness and make it the place where Your strength is most visible. Let my Pentecost come. Amen.`,
        notice: `This week, read Acts 2  --  the whole chapter. Notice the before and after. Fifty days between Good Friday Peter and Pentecost Peter. What changed? Just one thing.`
      },

      // ── PART TWO: THE HOLY GHOST AND HIS GIFTS (Weeks 4-6) ──

      {
        week: 4,
        theme: "The Seven Gifts",
        partTitle: "What You Are Being Given",
        story: `When a craftsman trains an apprentice, he does not simply tell the apprentice what to make and leave them to it. He gives them tools. The right tools for the right work  --  a hammer for driving nails, a chisel for shaping stone, a level for checking what is true.

The seven gifts of the Holy Ghost are like this. They are not decorations. They are tools for the work of a Christian life.

Wisdom: the ability to see life from God's perspective  --  to know what truly matters and what does not.

Understanding: the ability to see into the truth of things  --  to grasp what faith means, to understand the teachings of the Church from the inside rather than just the outside.

Counsel: knowing what to do in the particular moment  --  the right action, the right word, the right path, in a situation that cannot be solved by rules alone.

Fortitude: the strength to do what is right when it is hard, dangerous, lonely, or costly.

Knowledge: the ability to see creation rightly  --  to understand the world as it truly is in relation to God, and not to mistake creatures for the Creator.

Piety: a tender, filial love for God  --  not the fear of a slave but the love of a child for a father.

Fear of the Lord: not terror, but awe  --  the recognition that God is infinitely great and holy, and that this should shape everything.

These are given at Confirmation. They are not automatic. They must be used.`,
        theologyNote: `Isaiah 11:2-3 lists the gifts of the Spirit as resting on the Messiah. The traditional seven gifts of the Holy Ghost (CCC 1831) are given at Confirmation and develop throughout the Christian life. They are distinct from the theological virtues (faith, hope, charity  --  gifts at Baptism) and from the charismatic gifts (1 Corinthians 12  --  given as needed for the common good). The gifts perfect the virtues by enabling them to respond to the movements of the Holy Ghost rather than merely to natural reason. Thomas Aquinas's treatment in the Summa Theologiae (I-II, q.68) is the classic exposition.`,
        conversation: `"Of the seven gifts, which one do you think you already have a seed of  --  something you can see in yourself? And which one do you think you need most?"`,
        prayer: `Come, Holy Ghost, with Your seven gifts. Give me Wisdom to see what matters. Fortitude to do what is right. Piety to love God as a child loves a father. Give me what I need for the work You have planned for me. Amen.`,
        notice: `This week, take one gift  --  just one  --  and look for it in the people around you. Look for Fortitude in someone who does the right thing when it is hard. Look for Piety in someone who prays with genuine tenderness.`
      },

      {
        week: 5,
        theme: "Thomas More",
        partTitle: "Fortitude  --  The Gift That Costs the Most",
        story: `Thomas More was the most powerful man in England after the king. He was Chancellor  --  the equivalent of prime minister  --  brilliant, beloved, rich, trusted. He had a family he adored, a house filled with books and laughter and guests, a life that looked from the outside like the happiest life imaginable.

And then the king asked him to sign a document.

The document said the king's marriage was valid when the Church said it was not. It said the king, not the Pope, was head of the Church in England. It was a lie, and Thomas More knew it was a lie.

He did not argue. He did not rebel. He simply refused to sign. Quietly, firmly, without drama.

For this, he was imprisoned in the Tower of London. His books were taken. His family was not allowed to see him. His friends signed. His colleagues signed. Everyone he knew signed.

He did not sign.

On the scaffold before his execution, he told the crowd he was dying as the king's good servant  --  but God's first.

Thomas More was not a warrior. He was a scholar, a lawyer, a husband, a father. He did not want to die. He was afraid. He loved his life.

But he had the gift of Fortitude. And it held.

Fortitude is not the absence of fear. It is doing what is right while afraid.`,
        theologyNote: `St. Thomas More (1478-1535) was canonized by Pius XI in 1935. His execution on July 6, 1535  --  for refusing to take the Oath of Supremacy acknowledging Henry VIII as head of the Church in England  --  is among the most documented acts of martyrdom in Catholic history. His words on the scaffold ("The king's good servant, but God's first") are historical. For Confirmation candidates, Thomas More is significant because he was not a monk or priest  --  he was a layman in the world, a family man, a politician, a man whose faith cost him everything ordinary people value most.`,
        conversation: `"Thomas More didn't want to die. He loved his life. But he loved God more than his life. Is there something  --  a friendship, a reputation, a comfort  --  that you would find it hardest to give up for the truth?"`,
        prayer: `St. Thomas More, pray for me. You were a father, a husband, a man with everything to lose  --  and you lost it rather than lie. Give me a fraction of your fortitude in my smaller moments of courage. Amen.`,
        notice: `This week, find one moment where telling the truth costs you something small  --  admitting a mistake, standing with someone who is being excluded, saying what you actually think. Practice fortitude in the small things.`
      },

      {
        week: 6,
        theme: "The Wind and the Fire",
        partTitle: "How the Holy Ghost Actually Works",
        story: `There is a great moment in the story of Elijah  --  one of the most dramatic prophets of the Old Testament  --  where he is hiding in a cave on Mount Horeb, exhausted and discouraged. And God tells him to come out of the cave and stand on the mountain.

Then comes a great wind  --  so powerful it tears the rocks apart. But God is not in the wind.

Then comes an earthquake. But God is not in the earthquake.

Then comes a fire. But God is not in the fire.

And after the fire  --  a still, small voice. A gentle whisper.

And Elijah hears it. And he knows it is God.

People sometimes expect the Holy Ghost to be dramatic. They expect to feel something at Confirmation  --  a great wind, a visible fire, an earthquake in the soul. And sometimes He does come that way. But more often, the Holy Ghost is the still, small voice. The gentle pressure toward the right thing. The quiet certainty when everything else is uncertain. The peace that does not belong to the situation.

Learning to recognize the Holy Ghost is one of the great tasks of the Christian life. He is not always loud. He is not always obvious. But He is always speaking.

After Confirmation, begin to listen for the whisper.`,
        theologyNote: `1 Kings 19:9-13. The "still, small voice" (Hebrew: qol demamah daqah  --  literally "the sound of sheer silence") is one of Scripture's most profound theologies of divine communication. The gifts of the Holy Ghost, particularly Counsel, function precisely as this interior guidance. The spiritual tradition of discernment of spirits  --  developed most systematically by St. Ignatius of Loyola  --  is built on the assumption that the Holy Ghost speaks interiorly and that the faithful can learn to recognize His voice. This week introduces the concept that life after Confirmation involves developing this attentiveness.`,
        conversation: `"Have you ever had a moment where a quiet thought or feeling turned out to be exactly right  --  where something inside you knew something before you could explain it? That might have been the Holy Ghost. What was it?"`,
        prayer: `Holy Ghost, teach me to hear Your whisper. When the winds and earthquakes of my life are loud, help me to stand still enough to hear the still, small voice that comes after. Amen.`,
        notice: `This week, practice five minutes of silence each morning. Not prayer necessarily  --  just silence. Notice what comes into that silence. Begin to learn what the quiet sounds like.`
      },

      // ── PART THREE: SOLDIER OF CHRIST (Weeks 7-9) ──

      {
        week: 7,
        theme: "The Shire and the World",
        partTitle: "Why the Confirmed Person Cannot Stay Home",
        story: `In Tolkien's story, Frodo Baggins lives in the Shire  --  a beautiful, comfortable, peaceful place where nothing much happens and the hobbits are happy with it that way. Hobbits, as a rule, do not go on adventures. They do not want to.

And then Gandalf comes.

Frodo does not choose the adventure. The adventure chooses him  --  specifically because of something he has been given without deserving it: the Ring. The task falls to the most unlikely person.

And Frodo goes. Not because he is brave. Because the task is real, and there is no one else, and he is the one who has it.

There is a Shire quality to many comfortable Catholic lives  --  beautiful, peaceful, regular at Mass, loving, but oriented mainly inward. Toward the family, toward the home, toward the people already inside the circle of faith.

Confirmation changes this. The gifts of the Holy Ghost are not given for the Shire. They are given for the mission beyond it  --  for the world that does not know what the confirmed person knows, for the people who are lost in a dark forest with no guide, for the culture that has forgotten the truths that the confirmed person now carries more fully than before.

You have been given something. The question after Confirmation is: what are you going to do with it, beyond the Shire?`,
        theologyNote: `The missionary dimension of Confirmation is central to CCC 1285, 1316. Confirmation makes the recipient a full member of the Church with the full equipment for mission. The "soldier of Christ" language  --  used in the traditional Confirmation rite  --  reflects this outward orientation. For children, the key is to expand their horizon beyond the domestic church (as important as that is) to the world. The Tolkien reference: The Lord of the Rings is under copyright but can be referenced and paraphrased. The Shire/world contrast is a pedagogically powerful way to introduce the concept of mission.`,
        conversation: `"The Shire is good. Loving your family and community is good. But Confirmation sends you further. Where is the 'beyond the Shire' in your life right now  --  who are the people, what are the places, where is the mission?"`,
        prayer: `Lord, I like the Shire. Comfort and safety are good things. But You are sending me further. Give me the courage to go where You send me, even when I would rather stay home. Amen.`,
        notice: `This week, look for one person outside your usual circle  --  someone who seems lost, or lonely, or far from faith  --  and do one small thing for them. Not to convert them. Just to be the kind of person who notices.`
      },

      {
        week: 8,
        theme: "David and Jonathan",
        partTitle: "The Sponsor  --  A Friendship That Costs Something",
        story: `In the First Book of Samuel, there is a friendship that stands as one of the great friendships in all of literature. Jonathan, the son of King Saul, and David, the shepherd who killed Goliath and would one day be king.

Jonathan knew that David was destined for the throne that should have been his. He knew it clearly. And he loved David anyway  --  more than that, he protected David from his own father's murderous jealousy, risked his life for him, warned him when danger came, and wept when they were parted.

He gave David his robe and his weapons  --  the symbols of his status and his power  --  as a sign of the covenant between them.

Jonathan loved David as his own soul.

Your sponsor at Confirmation is meant to be something like this. Not just a nice Catholic adult who was available. Not just a family member fulfilling an obligation. A person who takes responsibility for your soul  --  who will pray for you, check in with you, be honest with you, and stand with you in the hard moments.

The sponsor's role does not end at the Confirmation ceremony. It is a covenant  --  the handing over of a robe and weapons.

If your sponsor is simply going through the motions, have an honest conversation with them about what you actually need. You deserve the real thing.`,
        theologyNote: `1 Samuel 18-23. The David-Jonathan friendship is one of Scripture's great models of covenant friendship  --  not romantic but deeply committed, at personal cost. Jonathan's giving of his robe and armor (18:4) is a covenantal act: he is transferring his own status and protection to David. The sponsor at Confirmation (Canon 892-893) must be a confirmed Catholic in good standing, at least 16 years old, not a parent of the candidate. Their canonical role: to present the candidate and take responsibility for their continued growth in the faith. In practice this responsibility is often neglected; this week's lesson helps the candidate understand what they have a right to expect.`,
        conversation: `"What do you actually want from your sponsor  --  not just for the ceremony, but for the years after? If you could ask them for three things, what would they be?"`,
        prayer: `Lord, send me a Jonathan. Someone who will stand with me when it is costly, who will be honest when I need it, who will take my soul seriously. And help me to be a Jonathan for others. Amen.`,
        notice: `This week, reach out to your sponsor with a real question  --  not about the ceremony, but about their faith. Ask them something genuine. See what happens.`
      },

      {
        week: 9,
        theme: "The Patron Saint",
        partTitle: "You Are Choosing a Guardian",
        story: `When you choose your Confirmation name, you are not choosing a favorite. You are entering into a relationship.

In the Catholic tradition, choosing a patron saint at Confirmation is a serious act of spiritual alliance. You are saying to this person  --  who has already completed the journey, who is now in the presence of God, who can pray for you with a clarity and force that no living person can match  --  I choose you. I am putting myself under your protection. I want to learn from you. I need your help.

The saints in heaven are not distant historical figures. They are alive  --  more alive than anyone on earth, because they are with God. They hear the prayers addressed to them. They intercede. Their intercession has changed things in this world  --  healings, conversions, moments of grace at the point of death.

When you choose your patron saint, you should feel what you feel when you choose a friend. Not casual comfort. Genuine recognition  --  this person knows something I need to know. This person faced something I face. This person is who I want to become a little more like.

Study them. Pray to them. Read about their life. Write them a letter. Ask them to stand with you at your Confirmation.

On the day of your Confirmation, they will be there.`,
        theologyNote: `The doctrine of the communion of saints (CCC 946-962) holds that the saints in heaven are genuinely alive and their prayers are efficacious. The Catholic practice of seeking the intercession of saints is not prayer "to" them as if they were gods, but prayer "through" them  --  asking them to pray to God on our behalf, as we might ask a living friend to pray for us. The patron saint at Confirmation has been part of the rite since the Middle Ages. Key: the relationship with the patron saint is meant to be ongoing, not ceremonial.`,
        conversation: `"Who is your Confirmation saint, and why did you choose them? Tell me one thing about their life that made you feel: this person is for me."`,
        prayer: `[Name of patron saint], I have chosen you  --  or perhaps you have chosen me. Pray for me. Stand with me at my Confirmation and in every year after. I want to become what you became. Amen.`,
        notice: `This week, read one chapter of a biography of your patron saint. Not a summary  --  a real chapter. Let them become a person to you.`
      },

      // ── PART FOUR: THE MISSION (Weeks 10-12) ──

      {
        week: 10,
        theme: "Salt and Light",
        partTitle: "What the Confirmed Person Is For",
        story: `Jesus said two things about His disciples that are simple and demanding.

"You are the salt of the earth." Salt in the ancient world was not a seasoning you added if you felt like it. It was a preservative  --  the thing that kept meat from rotting in the heat. Without salt, things decayed. With salt, they lasted. You are the thing that keeps the world from rotting.

"You are the light of the world." A city built on a hill cannot be hidden. A candle is not lit to be put under a basket. You are not given this light for yourself. You are given it so that people who are in the dark can find their way.

Notice that Jesus does not say: you could be salt, if you try hard enough. He says: you ARE salt. It is not an aspiration. It is a description of what you already are, what Baptism made you, what Confirmation is now fully equipping you to be.

The question after Confirmation is not: should I try to be salt and light? The question is: where am I being salt? Where is my light shining? Because if salt loses its saltiness, Jesus says, it is good for nothing. And a candle under a basket does not light the room.

You are not being sent to be noticed. You are being sent to preserve and illuminate. Two quiet, essential, unglamorous things.

That is your mission.`,
        theologyNote: `Matthew 5:13-16. Salt (halas) in first-century Palestine was a preservative and a purifying agent  --  it was used in Temple sacrifices and in salting meat to prevent spoilage. Jesus's audience would have understood the preservation image immediately. Light was the symbol of the Torah  --  Jewish tradition held that the Torah was light. Jesus transfers this symbol to His disciples: they are now the light to the world that Torah was to Israel. The confirming of this identity at Confirmation is the full equipping for what was begun at Baptism.`,
        conversation: `"Where in your actual daily life  --  your school, your friendships, your activities  --  are you the salt? And where is it possible that you are under a basket, where the light is not doing anything?"`,
        prayer: `Lord, You have called me salt and light. Not someday  --  now. Help me to be salty where the world is bland and rotting, and to shine where the world is dark. Without drama. Without hesitation. Amen.`,
        notice: `This week, look for salt in an unexpected place  --  not on the table, but doing its real work. Preserving. Purifying. And let it remind you of who you are.`
      },

      {
        week: 11,
        theme: "The Sword of the Spirit",
        partTitle: "What You Are Armed With",
        story: `In the letter to the Ephesians, St. Paul describes the armor of a Christian  --  piece by piece, using the equipment of a Roman soldier as his image.

The belt of truth. The breastplate of righteousness. The shield of faith. The helmet of salvation. The sword of the Spirit, which is the Word of God.

Notice that almost everything in this list is defensive. The belt holds things together. The breastplate protects the heart. The shield deflects attacks. The helmet protects the mind.

But the sword is the one offensive weapon. And it is the Word of God.

A confirmed Catholic who knows their faith  --  who has read Scripture, who understands what the Church teaches and why, who can explain the Real Presence, who can say why the Resurrection is not a fairy tale, who can answer the question "why do you believe?"  --  carries a sword.

Not to wound people. But to defend against lies. To cut through confusion. To offer something sharp and true in a world full of vague and comfortable half-truths.

You are being confirmed at a time when the Catholic faith is in particular need of people who can pick up the sword of the Spirit and use it. Not aggressively  --  with gentleness and respect, as St. Peter says. But use it.

This requires study. The sword must be sharpened.`,
        theologyNote: `Ephesians 6:10-17  --  the "Armor of God" passage. The sword (machaira) is the short Roman sword used for close combat  --  not the great sword of a warrior, but the practical weapon of a soldier. "The Word of God" as the sword connects to Hebrews 4:12: "The word of God is living and effective, sharper than any two-edged sword." The practical implication: the confirmed person has a responsibility to know their faith  --  not just to feel it. This is the bridge to the apologetics-adjacent content of Test the Faith (another app in the Gloria Dei Technologies suite).`,
        conversation: `"If someone at school asked you why you believe in God  --  not to be mean, genuinely wanting to know  --  what would you say? Let's practice. Ask me, and I will be the questioner."`,
        prayer: `Lord, give me the sword of the Spirit  --  the Word of God  --  and help me to know it well enough to use it. Not to wound but to offer something true in a world full of confusion. Amen.`,
        notice: `This week, learn one thing about your faith that you did not know before. One thing you could explain to someone else. Add it to your sword.`
      },

      {
        week: 12,
        theme: "The Confirmation",
        partTitle: "What Happens Today",
        story: `Today the bishop will come to you.

He is the successor of the apostles  --  connected by an unbroken chain of ordinations back to the men who walked with Jesus. When he lays his hands on your head, he is continuing an action that began in the Upper Room in Jerusalem, on the night after the Resurrection, when Jesus breathed on His disciples and said: Receive the Holy Ghost.

He will anoint your forehead with Chrism  --  oil that has been consecrated by the bishop at the Mass of the Chrism on Holy Thursday, blended with balsam, fragrant and ancient in its symbolism. Kings were anointed. Priests were anointed. Prophets were anointed. You will be anointed.

He will say: Be sealed with the Gift of the Holy Spirit.

And something will be completed that began at your Baptism. The grace that was given then will be given its fullness. The gifts that were planted will be set ablaze. The seal will be pressed in.

You will not feel the wind of Pentecost necessarily. You may not feel anything dramatic at all. But something real will have happened. The Holy Ghost will have come to you more fully.

Walk out of that church knowing what you carry.

Walk out as someone who has been sent.`,
        theologyNote: `The rite of Confirmation in the Traditional form uses Sacred Chrism (a mixture of olive oil and balsam, consecrated by the bishop), the laying on of hands, and the formula "Accipe Signaculum Doni Spiritus Sancti"  --  Receive the Seal of the Gift of the Holy Spirit. The gentle strike on the cheek (or cheek in the Traditional form) is a reminder of the battles of Christian life and the need for fortitude. The connection to royal, priestly, and prophetic anointing in Scripture is explicit in the Catechism (CCC 1241, 1289-1292). The candidate should know that the absence of strong feeling does not indicate the absence of grace  --  the sacraments work ex opere operato.`,
        conversation: `"Before we go in: what is the one thing you want to do differently after today  --  not a huge resolution, just one real thing that reflects who you are now becoming?"`,
        prayer: `Come, Holy Ghost, fill the hearts of Your faithful and kindle in them the fire of Your love. Send forth Your Spirit and they shall be created, and You shall renew the face of the earth. Amen.`,
        notice: `After your Confirmation: find a moment today  --  in the car, at the party, before you sleep  --  to be quiet for one minute and say: Holy Ghost, I received You more fully today. Show me what to do with it.`
      }

    ]
  }
};



// ── Weekly Lesson Viewer ────────────────────────────────────

function WeeklyLesson({ lesson, color, bg, onClose }) {
  const [section, setSection] = useState("story");
  const topRef = useRef(null);
  const scrollRef = useRef(null);
  useEffect(() => {
    // Try every possible scroll target
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    document.querySelectorAll('.ck-scroll, [style*="overflow"]').forEach(el => { el.scrollTop = 0; });
    // Walk up the DOM from topRef and reset any scrollable parent
    let el = topRef.current;
    while (el) { el.scrollTop = 0; el = el.parentElement; }
    setTimeout(() => {
      if (topRef.current) topRef.current.scrollIntoView({ behavior: "instant", block: "start" });
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 150);
  }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [section]);
  const sections = [
    { id: "story", label: "Story" },
    { id: "theology", label: "For Parents" },
    { id: "conversation", label: "Talk" },
    { id: "prayer", label: "Prayer" },
    { id: "notice", label: "Notice" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={topRef} style={{ height: 0, overflow: "hidden" }} />
      {/* Header */}
      <div style={{ background: "#1a2744", padding: "14px 18px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#c9a96e", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif", padding: "0 0 8px" }}>&#8249; Tracker</button>
        <div style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2px", fontFamily: "Georgia, serif" }}>Week {lesson.week} -- {lesson.partTitle}</div>
        <div style={{ fontSize: "18px", color: "#fff", fontWeight: "700", fontFamily: "Georgia, serif" }}>{lesson.theme}</div>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #E0D5C8", overflowX: "auto", flexShrink: 0 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            padding: "10px 14px", border: "none", background: "none", cursor: "pointer",
            fontFamily: "Georgia, serif", fontSize: "12px", fontWeight: section === s.id ? "700" : "400",
            color: section === s.id ? color : "#9a8060",
            borderBottom: section === s.id ? "2px solid " + color : "2px solid transparent",
            whiteSpace: "nowrap", transition: "all 0.15s",
          }}>{s.label}</button>
        ))}
      </div>

      {/* Content */}
      <div ref={scrollRef} className="ck-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 18px 32px" }}>

        {section === "story" && (
          <div>
            <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px" }}>Read aloud together -- about 5 minutes</div>
            {lesson.story.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontSize: "15px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.85", margin: "0 0 16px" }}>{para}</p>
            ))}
          </div>
        )}

        {section === "theology" && (
          <div>
            <div style={{ background: bg, borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", border: "1px solid " + color + "40" }}>
              <div style={{ fontSize: "10px", color: color, fontFamily: "Georgia, serif", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Theology Note for Parents</div>
              <p style={{ fontSize: "13px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.75", margin: 0 }}>{lesson.theologyNote}</p>
            </div>
          </div>
        )}

        {section === "conversation" && (
          <div>
            <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px" }}>After the story -- one question</div>
            <div style={{ background: bg, borderRadius: "14px", padding: "20px 18px", border: "2px solid " + color + "40" }}>
              <p style={{ fontSize: "17px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.65", margin: 0, fontWeight: "500" }}>{lesson.conversation}</p>
            </div>
            <p style={{ fontSize: "12px", color: "#9a8060", fontFamily: "Georgia, serif", margin: "12px 0 0", fontStyle: "italic" }}>Let the conversation go wherever it goes. This question is a door, not a destination.</p>
          </div>
        )}

        {section === "prayer" && (
          <div>
            <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px" }}>Pray together</div>
            <div style={{ background: "linear-gradient(135deg, #111b30 0%, #1a2744 100%)", borderRadius: "16px", padding: "22px 20px" }}>
              <p style={{ fontSize: "15px", color: "#e8e0d0", fontFamily: "Georgia, serif", lineHeight: "1.85", margin: 0, fontStyle: "italic" }}>{lesson.prayer}</p>
            </div>
          </div>
        )}

        {section === "notice" && (
          <div>
            <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px" }}>This week -- notice this</div>
            <div style={{ background: "#fff", borderRadius: "14px", padding: "18px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid " + color }}>
              <p style={{ fontSize: "14px", color: "#1a2744", fontFamily: "Georgia, serif", lineHeight: "1.75", margin: 0 }}>{lesson.notice}</p>
            </div>
            <p style={{ fontSize: "12px", color: "#9a8060", fontFamily: "Georgia, serif", margin: "12px 0 0", fontStyle: "italic" }}>The best sacrament prep happens in ordinary moments, not just in formal lessons. This is the homework that lives in the week.</p>
          </div>
        )}
      </div>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════
// NOTIFICATION ENGINE
// ═══════════════════════════════════════════════════════════

// Generates notification content for any given date + app state
// In production this runs server-side and feeds to APNs
// Here it previews exactly what each notification will say

function getNotificationContent(date, feast, rite, children, activePrep) {
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const feastName = feast?.name || (feast?.season + " Weekday");

  // ── Morning Feast Notification ──
  const morningNotif = (() => {
    const rank = feast?.rankLabel || "";
    const isMajor = feast?.rank === "solemnity" || feast?.rank === "double_1" || feast?.rank === "double_2";

    let title, body;

    if (isMajor) {
      title = feastName;
      body = "A major feast day. Your family's story, prayer, and dinner question are ready.";
    } else if (feast?.name) {
      title = feastName;
      body = "Your family's saint story, dinner question, and prayer are waiting for today.";
    } else {
      title = dateStr + " -- " + (feast?.season || "Ordinary Time");
      body = "Open Spiritu for today's family story, prayer, and dinner question.";
    }

    return { title, body, time: "7:00 AM" };
  })();

  // ── Dinner Table Notification ──
  // Uses the actual dinner question content - parent reads it at the table
  const dinnerNotif = (() => {
    // These are the actual questions for key feasts
    // In production, fetched from the same content engine as the app
    const DINNER_QUESTIONS = {
      "solemnity": "Tonight at dinner: What is one thing about our faith you have always wanted to understand better?",
      "double_1": "Tonight at dinner: What is one thing about our faith you have always wanted to understand better?",
      "easter": "Tonight at dinner: If death is not the end, how should that change how we live today?",
      "advent": "Tonight at dinner: What are we waiting for? What does it feel like to wait for something important?",
      "lent": "Tonight at dinner: What is one small sacrifice we could offer together as a family this week?",
      "default": "Your Spiritu dinner table question is ready for tonight.",
    };

    const season = feast?.season?.toLowerCase() || "";
    let question = DINNER_QUESTIONS.default;
    if (feast?.rank === "solemnity" || feast?.rank === "double_1") question = DINNER_QUESTIONS["solemnity"];
    else if (season.includes("easter")) question = DINNER_QUESTIONS["easter"];
    else if (season.includes("advent")) question = DINNER_QUESTIONS["advent"];
    else if (season.includes("lent") || season.includes("passion")) question = DINNER_QUESTIONS["lent"];

    return {
      title: "Dinner table question",
      body: question,
      time: "6:00 PM",
    };
  })();

  // ── Weekly Curriculum Notification ──
  const curriculumNotif = (() => {
    if (!activePrep) return null;
    const { sacrament, week, childName } = activePrep;
    const sacNames = { confession: "First Confession", communion: "First Communion", confirmation: "Confirmation" };
    const sacName = sacNames[sacrament] || sacrament;

    // Get week theme from curriculum data
    const weekData = PREP_CURRICULUM?.[sacrament]?.weeks?.[week - 1];
    const theme = weekData?.theme || "This week's lesson";
    const partTitle = weekData?.partTitle || "";

    return {
      title: sacName + " -- Week " + week,
      body: "This week: " + theme + (partTitle ? " -- " + partTitle + "." : ".") + (childName ? " Read it aloud with " + childName + " tonight." : " Read it aloud together tonight."),
      time: "Sunday 7:00 PM",
    };
  })();

  return { morning: morningNotif, dinner: dinnerNotif, curriculum: curriculumNotif };
}

// ── Toggle component ──
function Toggle({ value, onChange, color }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: "48px", height: "28px", borderRadius: "14px",
        background: value ? (color || "#1a2744") : "#d0c8bc",
        cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: "3px",
        left: value ? "23px" : "3px",
        width: "22px", height: "22px", borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "left 0.2s",
      }} />
    </div>
  );
}

// ── Settings row ──
function SettingRow({ label, sublabel, children, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: last ? "none" : "1px solid #E0D5C8",
    }}>
      <div style={{ flex: 1, paddingRight: "16px" }}>
        <div style={{ fontSize: "15px", color: "#1a2744", fontFamily: "Georgia, serif", fontWeight: "500" }}>{label}</div>
        {sublabel && <div style={{ fontSize: "12px", color: "#9a8060", fontFamily: "Georgia, serif", marginTop: "2px", lineHeight: "1.5" }}>{sublabel}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Settings card ──
function SettingsCard({ title, icon, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", marginBottom: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ padding: "14px 18px 0", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E0D5C8", paddingBottom: "12px" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a8060", fontFamily: "Georgia, serif", fontWeight: "600" }}>{title}</span>
      </div>
      <div style={{ padding: "0 18px" }}>{children}</div>
    </div>
  );
}

// ── Time picker ──
function TimePicker({ value, onChange }) {
  const times = ["6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM"];
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "6px 10px", borderRadius: "10px",
        border: "1.5px solid #E0D5C8", fontFamily: "Georgia, serif",
        fontSize: "13px", color: "#1a2744", background: "#f5f0e8",
        outline: "none", cursor: "pointer",
      }}
    >
      {times.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

// ── Notification preview card ──
function NotifPreview({ notif, icon }) {
  if (!notif) return null;
  return (
    <div style={{
      background: "#f0f4fa", borderRadius: "14px", padding: "14px 16px",
      marginTop: "12px", border: "1px solid #d8e0f0",
    }}>
      <div style={{ fontSize: "10px", color: "#5B6FA6", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Georgia, serif", marginBottom: "8px", fontWeight: "600" }}>
        {icon} Preview
      </div>
      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif", marginBottom: "4px" }}>{notif.title}</div>
      <div style={{ fontSize: "12px", color: "#5a6070", fontFamily: "Georgia, serif", lineHeight: "1.6" }}>{notif.body}</div>
      <div style={{ fontSize: "11px", color: "#9a8060", fontFamily: "Georgia, serif", marginTop: "8px" }}>Sends at {notif.time}</div>
    </div>
  );
}

// ── Main Settings Screen ──
function SettingsScreen({ rite, onRiteChange, nightMode, onNightMode, fontSize, onFontSize, children, setChildren }) {
  const [notifMorning, setNotifMorning] = useState(true);
  const [notifDinner, setNotifDinner] = useState(true);
  const [notifCurriculum, setNotifCurriculum] = useState(true);
  const [morningTime, setMorningTime] = useState("7:00 AM");
  const [dinnerTime, setDinnerTime] = useState("6:00 PM");
  const [showAddChild, setShowAddChild] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newAvatar, setNewAvatar] = useState("🧒");

  const AVATARS = ["🧒","👦","👧","🌟","🐑","✨","🕊️","🌿","⭐","🦁"];

  // Generate notification previews for today
  const today = new Date();
  const todayFeast = rite === "TLM" ? getLiturgicalDayTLM(today) : getLiturgicalDayNO(today);

  // Find first active prep
  const activePrep = (() => {
    for (const sac of ["confession", "communion", "confirmation"]) {
      for (const child of children) {
        try {
          const stored = JSON.parse(localStorage.getItem("sacrament_" + sac + "_" + child.name + "_weeks") || "{}");
          const done = Object.values(stored).filter(Boolean).length;
          if (done > 0 && done < 12) return { sacrament: sac, week: done + 1, childName: child.name };
        } catch {}
      }
    }
    return null;
  })();

  const previews = getNotificationContent(today, todayFeast, rite, children, activePrep);

  function addChild() {
    if (!newName.trim() || !newAge) return;
    setChildren(prev => [...prev, { name: newName.trim(), age: newAge, avatar: newAvatar }]);
    setNewName(""); setNewAge(""); setNewAvatar("🧒"); setShowAddChild(false);
  }

  return (
    <div style={{ padding: "16px 16px 40px", overflowY: "auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", color: "#9a8060", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Georgia, serif", marginBottom: "4px" }}>Gloria Dei Technologies</div>
        <div style={{ fontSize: "24px", fontWeight: "700", color: "#1a2744", fontFamily: "Georgia, serif" }}>Settings</div>
      </div>

      {/* Notifications */}
      <SettingsCard title="Notifications" icon="🔔">

        <SettingRow
          label="Morning feast"
          sublabel={"Daily reminder at " + morningTime + " with today's saint and feast"}
        >
          <Toggle value={notifMorning} onChange={setNotifMorning} color="#1a2744" />
        </SettingRow>

        {notifMorning && (
          <div style={{ paddingBottom: "14px", borderBottom: "1px solid #E0D5C8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#9a8060", fontFamily: "Georgia, serif" }}>Send at</span>
              <TimePicker value={morningTime} onChange={setMorningTime} />
            </div>
            <NotifPreview notif={previews.morning} icon="🌅" />
          </div>
        )}

        <SettingRow
          label="Dinner table question"
          sublabel="Sends the actual question to your lock screen at 6 PM -- read it at the table"
        >
          <Toggle value={notifDinner} onChange={setNotifDinner} color="#4A7C59" />
        </SettingRow>

        {notifDinner && (
          <div style={{ paddingBottom: "14px", borderBottom: "1px solid #E0D5C8" }}>
            <NotifPreview notif={previews.dinner} icon="🍽️" />
          </div>
        )}

        <SettingRow
          label="Weekly curriculum"
          sublabel={activePrep ? "Active: " + activePrep.sacrament + " prep, Week " + activePrep.week : "Sends Sunday evenings when a sacrament prep is active"}
          last={!notifCurriculum}
        >
          <Toggle value={notifCurriculum} onChange={setNotifCurriculum} color="#5B6FA6" />
        </SettingRow>

        {notifCurriculum && (
          <div style={{ paddingBottom: "14px" }}>
            <NotifPreview notif={previews.curriculum || { title: "No active preparation", body: "Start a sacrament prep journey in the Sacraments tab to activate weekly curriculum reminders.", time: "Sunday 7:00 PM" }} icon="📚" />
          </div>
        )}
      </SettingsCard>

      {/* Calendar */}
      <SettingsCard title="Liturgical Calendar" icon="✝️">
        <SettingRow label="Ordinary Form" sublabel="Novus Ordo · General Roman Calendar">
          <Toggle value={rite === "NO"} onChange={v => v && onRiteChange("NO")} color="#1a2744" />
        </SettingRow>
        <SettingRow label="Traditional Form" sublabel="1962 Missal · Extraordinary Form" last>
          <Toggle value={rite === "TLM"} onChange={v => v && onRiteChange("TLM")} color="#1a2744" />
        </SettingRow>
      </SettingsCard>

      {/* Display */}
      <SettingsCard title="Display" icon="☀️">
        <SettingRow label="Night mode" sublabel="Dark background for evening reading">
          <Toggle value={nightMode} onChange={onNightMode} color="#1a2744" />
        </SettingRow>
        <SettingRow label="Text size" sublabel="Applies throughout the app" last>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { id: "sm", label: "A", size: "13px" },
              { id: "md", label: "A", size: "16px" },
              { id: "lg", label: "A", size: "20px" },
            ].map(s => (
              <button key={s.id} onClick={() => onFontSize(s.id)} style={{
                width: "36px", height: "36px", borderRadius: "10px", border: "none",
                background: fontSize === s.id ? "#1a2744" : "#f0ebe3",
                color: fontSize === s.id ? "#c9a96e" : "#9a8060",
                fontSize: s.size, fontFamily: "Georgia, serif", fontWeight: "700",
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{s.label}</button>
            ))}
          </div>
        </SettingRow>
      </SettingsCard>

      {/* Family */}
      <SettingsCard title="Your Family" icon="👨‍👩‍👧‍👦">
        {children.map((child, i) => (
          <SettingRow key={i} label={child.name} sublabel={"Age " + child.age} last={i === children.length - 1 && !showAddChild}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>{child.avatar}</span>
              <button onClick={() => setChildren(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#d0c4ba", fontSize: "18px", padding: "4px" }}>×</button>
            </div>
          </SettingRow>
        ))}

        {showAddChild ? (
          <div style={{ paddingTop: "14px", paddingBottom: "14px" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              {AVATARS.map(a => <button key={a} onClick={() => setNewAvatar(a)} style={{ fontSize: "20px", padding: "4px 6px", borderRadius: "8px", border: `2px solid ${newAvatar === a ? "#c9a96e" : "transparent"}`, background: newAvatar === a ? "#FDF8EE" : "transparent", cursor: "pointer" }}>{a}</button>)}
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E0D5C8", fontFamily: "Georgia, serif", fontSize: "14px", color: "#1a2744", background: "#f5f0e8", outline: "none" }} />
              <input type="number" min="1" max="18" placeholder="Age" value={newAge} onChange={e => setNewAge(e.target.value)} style={{ width: "64px", padding: "10px 8px", borderRadius: "10px", border: "1.5px solid #E0D5C8", fontFamily: "Georgia, serif", fontSize: "14px", color: "#1a2744", background: "#f5f0e8", outline: "none", textAlign: "center" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={addChild} disabled={!newName.trim() || !newAge} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: newName.trim() && newAge ? "#1a2744" : "#d0c4ba", color: newName.trim() && newAge ? "#c9a96e" : "#fff", fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "600", cursor: newName.trim() && newAge ? "pointer" : "default" }}>Add {newName || "child"}</button>
              <button onClick={() => setShowAddChild(false)} style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #E0D5C8", background: "transparent", color: "#9a8060", fontFamily: "Georgia, serif", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddChild(true)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px dashed #E0D5C8", background: "transparent", color: "#9a8060", fontFamily: "Georgia, serif", fontSize: "13px", cursor: "pointer", marginTop: "8px", marginBottom: "4px" }}>
            + Add a child
          </button>
        )}
      </SettingsCard>

      {/* About */}
      <SettingsCard title="About" icon="✦">
        <SettingRow label="Spiritu" sublabel="Version 1.0 -- Gloria Dei Technologies">
          <span style={{ fontSize: "12px", color: "#9a8060", fontFamily: "Georgia, serif" }}>v1.0</span>
        </SettingRow>
        <SettingRow label="Liturgical calendar" sublabel="Traditional: missalemeum.com -- Dom Gueranger: sensusfidelium.com" last>
          <span style={{ fontSize: "18px" }}>✝</span>
        </SettingRow>
      </SettingsCard>

      {/* iOS note */}
      <div style={{ background: "#f0f4fa", borderRadius: "14px", padding: "14px 16px", border: "1px solid #d8e0f0" }}>
        <div style={{ fontSize: "11px", color: "#5B6FA6", fontFamily: "Georgia, serif", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>About notifications</div>
        <p style={{ fontSize: "13px", color: "#5a6070", fontFamily: "Georgia, serif", lineHeight: "1.65", margin: 0 }}>
          Notification previews show exactly what each alert will say. Push notifications are delivered through the Spiritu iOS app. Your preferences are saved on this device.
        </p>
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════

const NAV = [
  { id: "today",      icon: "🏠", label: "Today" },
  { id: "ask",        icon: "💬", label: "Ask" },
  { id: "prayers",    icon: "📿", label: "Prayers" },
  { id: "sacraments", icon: "✝️", label: "Sacraments" },
  { id: "settings",   icon: "⚙️", label: "Settings" },
];

// ── Onboarding components ──────────────────────────────────

const AVATARS_OB = ["🧒","👦","👧","🌟","🐑","✨","🕊️","🌿","⭐","🦁"];

function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "32px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ width: i === current ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i === current ? C.gold : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />
      ))}
    </div>
  );
}

function WelcomeScreen({ onNext }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: `linear-gradient(160deg, #0d1117 0%, #1a2744 60%, #1e3060 100%)` }}>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
        <div style={{ width: "90px", height: "90px", borderRadius: "24px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
<img src="data:image/png;base64,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" alt="Spiritu" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "0 32px", marginBottom: "48px" }}>
        <div style={{ fontSize: "11px", color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", fontFamily: "Georgia, serif" }}>Gloria Dei Technologies</div>
        <h1 style={{ fontSize: "48px", color: "#fff", fontFamily: "Georgia, serif", fontWeight: "400", margin: "0 0 16px", letterSpacing: "0.02em", lineHeight: 1.1 }}>Spiritu</h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", fontFamily: "Georgia, serif", lineHeight: "1.75", margin: "0 0 16px" }}>The domestic church, daily.</p>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", fontFamily: "Georgia, serif", lineHeight: "1.7", margin: 0, fontStyle: "italic" }}>Every day the Church gives your family a feast, a saint, prayers, a story, and more. Spiritu brings them to your dinner table, bedside, and beyond.</p>
      </div>
      <div style={{ padding: "0 24px 56px" }}>
        <button onClick={onNext} style={{ width: "100%", padding: "16px", borderRadius: "28px", background: C.gold, border: "none", cursor: "pointer", fontSize: "17px", fontWeight: "600", fontFamily: "Georgia, serif", color: "#0d1117" }}>Begin</button>
        <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "16px", fontFamily: "Georgia, serif" }}>For families raising children in the faith</p>
      </div>
    </div>
  );
}

function RiteScreen({ rite, onSelect, onNext, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#1a2744" }}>
      <div style={{ padding: "56px 24px 0", flexShrink: 0 }}>
        <ProgressDots total={3} current={1} />
        <h2 style={{ fontSize: "28px", color: "#fff", fontFamily: "Georgia, serif", fontWeight: "400", margin: "0 0 10px", lineHeight: 1.2 }}>Which calendar does your family follow?</h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", fontFamily: "Georgia, serif", lineHeight: "1.65", margin: 0 }}>This sets your saints, feasts, seasons, and Mass readings. You can change it anytime.</p>
      </div>
      <div style={{ flex: 1, padding: "32px 24px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {[
          { id: "NO", icon: "✝", label: "Ordinary Form", sub: "Novus Ordo - General Roman Calendar", detail: "Full liturgical year - Season-aware prayers - Daily Mass readings" },
          { id: "TLM", icon: "⚜️", label: "Traditional Form", sub: "1962 Missal - Extraordinary Form", detail: "Septuagesima, octaves, Passiontide - Missale Meum readings - Dom Gueranger's Liturgical Year - Traditional rosary" },
        ].map(r => (
          <button key={r.id} onClick={() => onSelect(r.id)} style={{ width: "100%", textAlign: "left", padding: "22px 24px", borderRadius: "18px", cursor: "pointer", border: `2px solid ${rite === r.id ? C.gold : "rgba(255,255,255,0.1)"}`, background: rite === r.id ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.04)", transition: "all 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: rite === r.id ? C.gold : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, transition: "background 0.2s" }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "17px", fontWeight: "600", color: "#fff", fontFamily: "Georgia, serif", marginBottom: "3px" }}>{r.label}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "Georgia, serif" }}>{r.sub}</div>
              </div>
              {rite === r.id && <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ color: "#0d1117", fontSize: "12px", fontWeight: "700" }}>ok</span></div>}
            </div>
            {rite === r.id && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: "Georgia, serif", margin: "14px 0 0", lineHeight: "1.6", fontStyle: "italic" }}>{r.detail}</p>}
          </button>
        ))}
        <button onClick={() => { onSelect("NO"); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.25)", fontFamily: "Georgia, serif", padding: "8px", textAlign: "center" }}>Not sure -- start with Ordinary Form</button>
      </div>
      <div style={{ padding: "0 24px 56px", display: "flex", gap: "12px" }}>
        <button onClick={onBack} style={{ padding: "14px 20px", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "14px" }}>Back</button>
        <button onClick={onNext} disabled={!rite} style={{ flex: 1, padding: "14px", borderRadius: "28px", border: "none", background: rite ? C.gold : "rgba(255,255,255,0.1)", color: rite ? "#0d1117" : "rgba(255,255,255,0.3)", cursor: rite ? "pointer" : "default", fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: "600", transition: "all 0.2s" }}>Continue</button>
      </div>
    </div>
  );
}

function ChildrenScreen({ children, onAdd, onRemove, onFinish, onBack }) {
  const [name, setName] = useState(""); const [age, setAge] = useState(""); const [avatar, setAvatar] = useState("🧒");
  const [adding, setAdding] = useState(children.length === 0);
  function handleAdd() {
    if (!name.trim() || !age) return;
    onAdd({ name: name.trim(), age, avatar });
    setName(""); setAge(""); setAvatar("🧒"); setAdding(false);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: C.cream }}>
      <div style={{ background: "#1a2744", padding: "56px 24px 28px", flexShrink: 0 }}>
        <ProgressDots total={3} current={2} />
        <h2 style={{ fontSize: "26px", color: "#fff", fontFamily: "Georgia, serif", fontWeight: "400", margin: "0 0 8px", lineHeight: 1.2 }}>Who are you raising in the faith?</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontFamily: "Georgia, serif", margin: 0, lineHeight: "1.6" }}>Add your children so stories and answers are shaped for their ages.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {children.map((child, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", borderRadius: "14px", padding: "14px 16px", marginBottom: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: "26px" }}>{child.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a2744", fontFamily: "Georgia, serif" }}>{child.name}</div>
              <div style={{ fontSize: "12px", color: C.mutedGold, fontFamily: "Georgia, serif" }}>Age {child.age}</div>
            </div>
            <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.border, fontSize: "20px", padding: "4px" }}>x</button>
          </div>
        ))}
        {adding ? (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: `2px solid ${C.gold}`, marginBottom: "12px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {AVATARS_OB.map(a => <button key={a} onClick={() => setAvatar(a)} style={{ fontSize: "22px", padding: "6px 8px", borderRadius: "10px", border: `2px solid ${avatar === a ? C.gold : "transparent"}`, background: avatar === a ? "#FDF8EE" : "transparent", cursor: "pointer" }}>{a}</button>)}
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              <input placeholder="Child's name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} style={{ flex: 1, padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${C.border}`, fontFamily: "Georgia, serif", fontSize: "15px", color: "#1a2744", background: C.cream, outline: "none" }} />
              <input type="number" min="1" max="18" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} style={{ width: "72px", padding: "12px 10px", borderRadius: "12px", border: `1.5px solid ${C.border}`, fontFamily: "Georgia, serif", fontSize: "15px", color: "#1a2744", background: C.cream, outline: "none", textAlign: "center" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleAdd} disabled={!name.trim() || !age} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: name.trim() && age ? "#1a2744" : C.border, color: name.trim() && age ? C.gold : C.mutedGold, fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "600", cursor: name.trim() && age ? "pointer" : "default" }}>Add {name || "child"}</button>
              {children.length > 0 && <button onClick={() => setAdding(false)} style={{ padding: "12px 16px", borderRadius: "12px", border: `1px solid ${C.border}`, background: "transparent", color: C.mutedGold, fontFamily: "Georgia, serif", fontSize: "14px", cursor: "pointer" }}>Cancel</button>}
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{ width: "100%", padding: "14px", borderRadius: "14px", border: `2px dashed ${C.border}`, background: "transparent", color: C.mutedGold, fontFamily: "Georgia, serif", fontSize: "14px", cursor: "pointer", marginBottom: "12px" }}>+ Add {children.length > 0 ? "another" : "a"} child</button>
        )}
      </div>
      <div style={{ padding: "12px 24px 56px", flexShrink: 0, background: C.cream, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
          <button onClick={onBack} style={{ padding: "14px 20px", borderRadius: "28px", border: `1px solid ${C.border}`, background: "transparent", color: C.mutedGold, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "14px" }}>Back</button>
          <button onClick={onFinish} style={{ flex: 1, padding: "14px", borderRadius: "28px", border: "none", background: "#1a2744", color: C.gold, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: "600" }}>{children.length > 0 ? "Start Spiritu" : "Skip for now"}</button>
        </div>
        {children.length === 0 && <p style={{ fontSize: "11px", color: C.mutedGold, fontFamily: "Georgia, serif", textAlign: "center", margin: 0, fontStyle: "italic" }}>You can add children later in settings.</p>}
      </div>
    </div>
  );
}

function WelcomeBanner({ rite, children, onDismiss }) {
  const childNames = children.map(c => c.name).join(" and ");
  return (
    <div style={{ background: `linear-gradient(135deg, #0d1117 0%, #1a2744 100%)`, borderRadius: "18px", padding: "20px 18px 16px", border: "1px solid rgba(201,169,110,0.3)" }}>
      <div style={{ fontSize: "11px", color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "Georgia, serif" }}>Welcome to Spiritu</div>
      <p style={{ fontSize: "16px", color: "#fff", fontFamily: "Georgia, serif", fontWeight: "500", margin: "0 0 8px", lineHeight: 1.4 }}>{childNames ? `Welcome, ${childNames}.` : "Welcome."} The domestic church starts here.</p>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: "Georgia, serif", lineHeight: "1.65", margin: "0 0 16px", fontStyle: "italic" }}>You are following the {rite === "TLM" ? "Traditional Latin Mass" : "Ordinary Form"} calendar. Every day the Church gives your family something. It is right below.</p>
      <button onClick={onDismiss} style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "20px", padding: "7px 18px", cursor: "pointer", fontSize: "12px", color: C.gold, fontFamily: "Georgia, serif", fontWeight: "600" }}>Let us begin ›</button>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────

export default function App() {
  const [obScreen, setObScreen] = useState(() => {
    try { return localStorage.getItem("spiritu_ob_done") === "1" ? "done" : "welcome"; }
    catch { return "welcome"; }
  }); // welcome | rite | children | done
  const [obRite, setObRite] = useState(null);
  const [obChildren, setObChildren] = useState([]);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const [tab, setTab] = useState("today");
  const [rite, setRite] = useState(() => {
    try { return localStorage.getItem("spiritu_rite") || "TLM"; }
    catch { return "TLM"; }
  });

  useEffect(() => {
    try { localStorage.setItem("spiritu_rite", rite); }
    catch {}
  }, [rite]);
  const [nightMode, setNightMode] = useState(false);
  const [fontSize, setFontSize] = useState("md");
  const mainScrollRef = useRef(null);
  function scrollToTop() {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
    setTimeout(() => { if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0; }, 80);
  }
  useEffect(() => { scrollToTop(); }, [tab]);
  useEffect(() => { document.title = "Spiritu -- Gloria Dei Technologies"; }, []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feast, setFeast] = useState(null);
  const [content, setContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [children, setChildren] = useState(() => {
    try { return JSON.parse(localStorage.getItem("spiritu_children") || "[]"); }
    catch { return []; }
  });

  // Persist children to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem("spiritu_children", JSON.stringify(children)); }
    catch {}
  }, [children]);

  // Inject welcome banner state into the app
  const welcomeBannerEl = (obScreen === "done" && showWelcomeBanner) ? (
    <WelcomeBanner rite={rite} children={obChildren} onDismiss={() => setShowWelcomeBanner(false)} />
  ) : null;

  const FS = { sm: 0.88, md: 1, lg: 1.14 }[fontSize];
  const NM = nightMode ? {
    bg: "#0d1117", surface: "#161b22", border: "#30363d",
    text: "#e6edf3", textMuted: "#8b949e", gold: "#d4a843", header: "#090d12",
  } : {
    bg: C.cream, surface: "#fff", border: C.border,
    text: C.text, textMuted: C.mutedGold, gold: C.gold, header: C.darkBrown,
  };

  useEffect(() => {
    const f = rite === "TLM" ? getLiturgicalDayTLM(selectedDate) : getLiturgicalDayNO(selectedDate);
    setFeast(f);
    setContent(null);
    setContentLoading(true);
    generateDailyContent(f, selectedDate, rite).then(c => {
      setContent(c);
      setContentLoading(false);
    }).catch(() => setContentLoading(false));
  }, [selectedDate, rite]);

  const theme = feast ? getTheme(feast.season) : getTheme("Ordinary Time");
  const dateStr = selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // Onboarding gate — rendered after all hooks, inside FontCtx.Provider
  if (obScreen !== "done") {
    return (
      <FontCtx.Provider value={FS}>
        {obScreen === "welcome" && <WelcomeScreen onNext={() => setObScreen("rite")} />}
        {obScreen === "rite" && <RiteScreen rite={obRite} onSelect={setObRite} onNext={() => setObScreen("children")} onBack={() => setObScreen("welcome")} />}
        {obScreen === "children" && <ChildrenScreen children={obChildren} onAdd={c => setObChildren(p => [...p, c])} onRemove={i => setObChildren(p => p.filter((_, j) => j !== i))} onFinish={() => { setRite(obRite || "NO"); if (obChildren.length > 0) setChildren(obChildren); setObScreen("done"); }} onBack={() => setObScreen("rite")} />}
      </FontCtx.Provider>
    );
  }

  return (
    <FontCtx.Provider value={FS}>
    <div id="ck-root" data-fs={fontSize} style={{
      minHeight: "100vh",
      background: NM.bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: "Georgia, serif",
      transition: "background 0.3s",
    }}>
      <style>{`
        @keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-5px);opacity:1}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea:focus,input:focus{border-color:${C.red}!important;outline:none}
        #ck-root[data-fs="sm"] *:not(.app-name):not(.app-company) { font-size: 13px !important; }
        #ck-root[data-fs="md"] *:not(.app-name):not(.app-company) { font-size: 16px !important; }
        #ck-root[data-fs="lg"] *:not(.app-name):not(.app-company) { font-size: 19px !important; }
        .app-name { font-size: 22px !important; }
        .app-company { font-size: 10px !important; }
        ${nightMode ? `
          .ck-surface { background: #161b22 !important; border-color: #30363d !important; }
          .ck-text { color: #e6edf3 !important; }
          .ck-muted { color: #8b949e !important; }
          .ck-card { background: #161b22 !important; box-shadow: 0 1px 4px rgba(0,0,0,0.4) !important; }
          .ck-input { background: #0d1117 !important; border-color: #30363d !important; color: #e6edf3 !important; }
          .ck-light-bg { background: #1c2128 !important; }
          #ck-root * { color: #e6edf3 !important; }
          #ck-root *[style*="color: #1a2744"],
          #ck-root *[style*="color: #2D1A0E"],
          #ck-root *[style*="color: #3a3a3a"],
          #ck-root *[style*="color: #5a5a5a"],
          #ck-root *[style*="color: rgb(26, 39, 68)"] { color: #e6edf3 !important; }
          #ck-root a { color: #8ab4f8 !important; }
          #ck-root *[style*="background: #fff"],
          #ck-root *[style*="background: white"],
          #ck-root *[style*="background: #fffef8"],
          #ck-root *[style*="background: #f5f0e8"],
          #ck-root *[style*="background: rgb(255, 255, 255)"] { background: #161b22 !important; }
          #ck-root *[style*="color: #9a8060"],
          #ck-root *[style*="color: #9A7B60"],
          #ck-root *[style*="color: #7a6450"] { color: #8b949e !important; }
          #ck-root input, #ck-root textarea { background: #0d1117 !important; color: #e6edf3 !important; border-color: #30363d !important; }
          #ck-root button:not([style*="background: #"]) { color: #e6edf3 !important; }
          .ck-mystery-bg { background: #161b22 !important; border-color: #30363d !important; }
        ` : ''}
      `}</style>

      {/* Header */}
      <div style={{ background: NM.header, padding: "14px 18px 12px", flexShrink: 0 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

            {/* Icon + wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Spiritu icon  --  child silhouette with guardian angel */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: NM.header,
                overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <img src="data:image/png;base64,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" alt="Spiritu" style={{ width: "100%", height: "100%", display: "block" }} />
              </div>

              <div>
                <div className="app-name" style={{ color: "#fff", fontWeight: "700", letterSpacing: "0.02em", lineHeight: 1.1 }}>Spiritu</div>
                <div className="app-company" style={{ color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2px" }}>Gloria Dei Technologies</div>
              </div>
            </div>

            {/* Right side  --  rite toggle + date */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <RiteToggle rite={rite} onChange={r => setRite(r)} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: NM.gold }}>{dateStr}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>{feast ? getTheme(feast.season).label : "..."}</div>
              </div>
            </div>

          </div>

          {/* Controls row  --  night mode + font size */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Night mode toggle */}
            <button onClick={() => setNightMode(n => !n)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: nightMode ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px",
              padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
            }}>
              <span style={{ fontSize: "13px" }}>{nightMode ? "☀️" : "🌙"}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontFamily: "Georgia, serif", fontWeight: "600", letterSpacing: "0.04em" }}>
                {nightMode ? "Day" : "Night"}
              </span>
            </button>

            {/* Font size picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "Georgia, serif", marginRight: "4px" }}>Aa</span>
              {["sm", "md", "lg"].map((size, i) => (
                <button key={size} onClick={() => setFontSize(size)} style={{
                  width: size === "sm" ? "28px" : size === "md" ? "32px" : "36px",
                  height: size === "sm" ? "28px" : size === "md" ? "32px" : "36px",
                  borderRadius: "50%", border: "none", cursor: "pointer",
                  background: fontSize === size ? NM.gold : "rgba(255,255,255,0.1)",
                  color: fontSize === size ? "#111b30" : "rgba(255,255,255,0.6)",
                  fontFamily: "Georgia, serif",
                  fontSize: size === "sm" ? "10px" : size === "md" ? "12px" : "14px",
                  fontWeight: "700", transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>A</button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Calendar strip */}
      {tab === "today" && (
        <div style={{ maxWidth: "520px", margin: "0 auto", width: "100%" }}>
          <CalendarStrip selectedDate={selectedDate} onSelect={d => setSelectedDate(d)} rite={rite} nightMode={nightMode} />
        </div>
      )}

      {/* Screen */}
      <div ref={mainScrollRef} className="ck-scroll" style={{ flex: 1, overflowY: tab === "ask" ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
          {tab === "today" && feast && <DailyFeed feast={feast} content={content} loading={contentLoading} date={selectedDate} onAskQuestion={() => setTab("ask")} rite={rite} nightMode={nightMode} FS={FS} welcomeBanner={welcomeBannerEl} onFeastData={mmFeast => { if (rite === "TLM") setFeast(f => ({ ...f, name: mmFeast.name, rankLabel: mmFeast.class, commemoration: mmFeast.commemoration })); }} />}
          {tab === "ask" && <AskScreen children={children} setChildren={setChildren} rite={rite} nightMode={nightMode} FS={FS} />}
          {tab === "prayers" && <PrayerHub rite={rite} feast={feast} selectedDate={selectedDate} nightMode={nightMode} FS={FS} />}
          {tab === "sacraments" && <SacramentHub rite={rite} nightMode={nightMode} children={children} scrollToTop={scrollToTop} />}
          {tab === "settings" && <SettingsScreen rite={rite} onRiteChange={r => setRite(r)} nightMode={nightMode} onNightMode={setNightMode} fontSize={fontSize} onFontSize={setFontSize} children={children} setChildren={setChildren} />}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ background: nightMode ? "#161b22" : "#fff", borderTop: `1px solid ${nightMode ? "#30363d" : C.border}`, padding: "10px 0 14px", flexShrink: 0 }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", opacity: tab === n.id ? 1 : 0.35, transition: "opacity 0.15s" }}>
              <span style={{ fontSize: "22px" }}>{n.icon}</span>
              <span style={{ fontSize: "10px", color: tab === n.id ? C.red : C.mutedGold, fontFamily: "Georgia, serif", fontWeight: tab === n.id ? "600" : "400" }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
    </FontCtx.Provider>
  );
}
