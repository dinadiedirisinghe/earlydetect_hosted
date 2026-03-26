// doctors.js
// Complete Sri Lankan doctor dataset for EarlyDetect
// Merged from: doctors_json, hospitals, specializations sources
// Added: ratings (1-5), experience (years), about, languages, consultationFee

export const DOCTORS = [
  // ── CARDIOLOGISTS ────────────────────────────────────────────────────────
  {
    doctorId:   "D1001",
    name:       "Dr. Ruwan Jayasinghe",
    gender:     "M",
    rating:     4.8,
    experience: 22,
    fee:        3500,
    languages:  ["Sinhala", "English"],
    about:      "Senior interventional cardiologist with expertise in cardiac catheterisation and heart failure management.",
    specializations: [
      { id: "01",   name: "Cardiologist" },
      { id: "1206", name: "Clinical And Interventional Cardiologist" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H27",  name: "Asiri Central Hospital",       city: "Colombo 10" },
      { id: "H06",  name: "Asiri Medical Hospital",       city: "Colombo 5" },
    ],
    tags: ["heart disease", "cardiovascular", "hypertension", "chest pain", "palpitations"],
  },
  {
    doctorId:   "D1002",
    name:       "Dr. Nilmini Perera",
    gender:     "F",
    rating:     4.7,
    experience: 18,
    fee:        3000,
    languages:  ["Sinhala", "English", "Tamil"],
    about:      "Consultant cardiologist specialising in echocardiography and preventive cardiology for young adults.",
    specializations: [
      { id: "01",  name: "Cardiologist" },
      { id: "484", name: "Cardiologist-Echo" },
    ],
    hospitals: [
      { id: "H03",  name: "Nawaloka Hospital",            city: "Colombo 02" },
      { id: "H10",  name: "Asiri Surgical Hospital",      city: "Colombo 5" },
    ],
    tags: ["heart disease", "cardiovascular", "hypertension", "fainting", "swollen ankles"],
  },

  // ── ENDOCRINOLOGISTS ─────────────────────────────────────────────────────
  {
    doctorId:   "D1003",
    name:       "Dr. Pradeep Mendis",
    gender:     "M",
    rating:     4.9,
    experience: 25,
    fee:        4000,
    languages:  ["Sinhala", "English"],
    about:      "Leading endocrinologist with special interest in diabetes, thyroid disorders and metabolic syndrome in young adults.",
    specializations: [
      { id: "1562", name: "Consultant Endocrinologist" },
      { id: "960",  name: "Weight Management" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H10",  name: "Asiri Surgical Hospital",      city: "Colombo 5" },
      { id: "H353", name: "Asiri Hospital Kandy",         city: "Kandy" },
    ],
    tags: ["diabetes", "obesity", "thyroid", "metabolic syndrome", "excessive thirst", "frequent urination", "weight gain"],
  },
  {
    doctorId:   "D1004",
    name:       "Dr. Chamari Weeraratne",
    gender:     "F",
    rating:     4.6,
    experience: 14,
    fee:        2500,
    languages:  ["Sinhala", "English"],
    about:      "Consultant family physician with a focus on diabetes screening and preventive care for young adults.",
    specializations: [
      { id: "532", name: "Consultant Family Physician" },
    ],
    hospitals: [
      { id: "H326", name: "Medihelp Hospitals - Moratuwa", city: "Moratuwa" },
    ],
    tags: ["diabetes", "general health", "weight management", "family medicine", "preventive care"],
  },
  {
    doctorId:   "D1005",
    name:       "Dr. Hirantha Sujeewa Wijesinghe",
    gender:     "M",
    rating:     4.5,
    experience: 16,
    fee:        2800,
    languages:  ["Sinhala", "English"],
    about:      "Family physician with broad experience in managing chronic conditions and lifestyle-related diseases.",
    specializations: [
      { id: "532", name: "Consultant Family Physician" },
    ],
    hospitals: [
      { id: "H03",  name: "Nawaloka Hospital",            city: "Colombo 02" },
      { id: "H47",  name: "Borella Winsetha Medical Hospital", city: "Colombo 10" },
      { id: "H49",  name: "Hemas Hospital Thalawathugoda", city: "Thalawathugoda" },
    ],
    tags: ["general health", "diabetes", "hypertension", "family medicine", "preventive care"],
  },
  {
    doctorId:   "D1006",
    name:       "Dr. Malkanthi Galhena",
    gender:     "F",
    rating:     4.7,
    experience: 20,
    fee:        3000,
    languages:  ["Sinhala", "English"],
    about:      "Senior family physician experienced in managing both acute and chronic conditions across all age groups.",
    specializations: [
      { id: "532", name: "Consultant Family Physician" },
    ],
    hospitals: [
      { id: "H338", name: "Durdans Medical Center - Moratuwa", city: "Moratuwa" },
      { id: "H503", name: "Nawaloka Hospital Elite Centre",     city: "Colombo 02" },
      { id: "H46",  name: "Winlanka Hospital",                  city: "Kohuwala" },
    ],
    tags: ["general health", "family medicine", "diabetes", "hypertension", "preventive care"],
  },

  // ── GASTROENTEROLOGISTS ──────────────────────────────────────────────────
  {
    doctorId:   "D1007",
    name:       "Dr. Asanka Rajapaksa",
    gender:     "M",
    rating:     4.8,
    experience: 19,
    fee:        3500,
    languages:  ["Sinhala", "English"],
    about:      "Consultant gastroenterologist with expertise in liver disease, IBD, and GI cancers.",
    specializations: [
      { id: "1323", name: "Consultant Gastroenterologist And Hepatologist" },
      { id: "1424", name: "Consultant Gastroenterologist" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H06",  name: "Asiri Medical Hospital",       city: "Colombo 5" },
    ],
    tags: ["abdominal pain", "bloating", "jaundice", "blood in stool", "liver disease", "nausea", "diarrhoea"],
  },

  // ── NEUROLOGISTS ─────────────────────────────────────────────────────────
  {
    doctorId:   "D1008",
    name:       "Dr. Sumudu Karunathilake",
    gender:     "F",
    rating:     4.9,
    experience: 21,
    fee:        4500,
    languages:  ["Sinhala", "English"],
    about:      "Consultant neurologist specialising in headache disorders, epilepsy and stroke prevention in young adults.",
    specializations: [
      { id: "485", name: "Clinical Neurologist" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H27",  name: "Asiri Central Hospital",       city: "Colombo 10" },
    ],
    tags: ["headache", "persistent headache", "seizures", "numbness", "tingling", "memory loss", "dizziness", "weakness in limbs"],
  },
  {
    doctorId:   "D1009",
    name:       "Dr. Chandana Seneviratne",
    gender:     "M",
    rating:     4.6,
    experience: 17,
    fee:        3500,
    languages:  ["Sinhala", "English", "Tamil"],
    about:      "Neurologist with a focus on movement disorders, neurodegenerative disease and clinical neurophysiology.",
    specializations: [
      { id: "485", name: "Clinical Neurologist" },
      { id: "479", name: "Clinical Neuro Physiologist" },
    ],
    hospitals: [
      { id: "H03",  name: "Nawaloka Hospital",            city: "Colombo 02" },
      { id: "H10",  name: "Asiri Surgical Hospital",      city: "Colombo 5" },
    ],
    tags: ["tremors", "numbness", "confusion", "difficulty speaking", "vision changes", "weakness in limbs"],
  },

  // ── PULMONOLOGISTS / CHEST ───────────────────────────────────────────────
  {
    doctorId:   "D1010",
    name:       "Dr. Gihan Fonseka",
    gender:     "M",
    rating:     4.7,
    experience: 15,
    fee:        3000,
    languages:  ["Sinhala", "English"],
    about:      "Respiratory physician with expertise in asthma, COPD, interstitial lung disease and smoking-related illness.",
    specializations: [
      { id: "559", name: "Pulmonologist" },
      { id: "111", name: "Chest Physician" },
      { id: "1138", name: "Consultant Respiratory Physician" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H06",  name: "Asiri Medical Hospital",       city: "Colombo 5" },
    ],
    tags: ["persistent cough", "coughing blood", "wheezing", "breathlessness at rest", "breathlessness on exertion", "smoking", "frequent respiratory infections"],
  },

  // ── ONCOLOGISTS ──────────────────────────────────────────────────────────
  {
    doctorId:   "D1011",
    name:       "Dr. Thilanka Siriwardena",
    gender:     "M",
    rating:     4.9,
    experience: 23,
    fee:        5000,
    languages:  ["Sinhala", "English"],
    about:      "Senior clinical oncologist specialising in early cancer detection, chemotherapy and cancer prevention.",
    specializations: [
      { id: "208",  name: "Clinical Oncologist" },
      { id: "1084", name: "Consultant Oncologist" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H27",  name: "Asiri Central Hospital",       city: "Colombo 10" },
    ],
    tags: ["cancer", "unexplained weight loss", "unusual moles", "coughing blood", "blood in stool", "night sweats", "fatigue"],
  },

  // ── HAEMATOLOGISTS ───────────────────────────────────────────────────────
  {
    doctorId:   "D1012",
    name:       "Dr. Anoja Bandara",
    gender:     "F",
    rating:     4.8,
    experience: 18,
    fee:        3500,
    languages:  ["Sinhala", "English"],
    about:      "Clinical haematologist experienced in anaemia, bleeding disorders and blood cancers.",
    specializations: [
      { id: "171",  name: "Clinical Haematologist" },
      { id: "1243", name: "Consultant Haematologist" },
    ],
    hospitals: [
      { id: "H10",  name: "Asiri Surgical Hospital",      city: "Colombo 5" },
      { id: "H06",  name: "Asiri Medical Hospital",       city: "Colombo 5" },
    ],
    tags: ["fatigue", "excessive bruising", "night sweats", "unexplained weight loss", "anaemia", "blood disorders"],
  },

  // ── RHEUMATOLOGISTS ──────────────────────────────────────────────────────
  {
    doctorId:   "D1013",
    name:       "Dr. Kumari Dissanayake",
    gender:     "F",
    rating:     4.7,
    experience: 16,
    fee:        3500,
    languages:  ["Sinhala", "English"],
    about:      "Rheumatologist specialising in autoimmune diseases, inflammatory arthritis and lupus in young adults.",
    specializations: [
      { id: "21",   name: "Rheumatologist" },
      { id: "1149", name: "Rheumatologist And Rehabilitation Specialist" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H10",  name: "Asiri Surgical Hospital",      city: "Colombo 5" },
    ],
    tags: ["joint pain", "joint swelling", "muscle pain", "stiffness in the morning", "fatigue", "rash"],
  },

  // ── DERMATOLOGISTS ───────────────────────────────────────────────────────
  {
    doctorId:   "D1014",
    name:       "Dr. Isuru Vithanage",
    gender:     "M",
    rating:     4.6,
    experience: 12,
    fee:        2500,
    languages:  ["Sinhala", "English"],
    about:      "Consultant dermatologist with expertise in skin cancers, psoriasis and cosmetic dermatology.",
    specializations: [
      { id: "833",  name: "Consultant Dermatologist" },
    ],
    hospitals: [
      { id: "H06",  name: "Asiri Medical Hospital",       city: "Colombo 5" },
      { id: "H312", name: "Asia Hospitals",               city: "Maharagama" },
    ],
    tags: ["rash", "itching", "unusual moles", "skin colour changes", "hair loss", "nail changes", "slow-healing wounds"],
  },

  // ── NEPHROLOGISTS ────────────────────────────────────────────────────────
  {
    doctorId:   "D1015",
    name:       "Dr. Dinesh Gunawardena",
    gender:     "M",
    rating:     4.8,
    experience: 20,
    fee:        4000,
    languages:  ["Sinhala", "English"],
    about:      "Consultant nephrologist experienced in chronic kidney disease, hypertension and diabetic nephropathy.",
    specializations: [
      { id: "1244", name: "Consultant Nephrologist" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H27",  name: "Asiri Central Hospital",       city: "Colombo 10" },
    ],
    tags: ["frequent urination", "blood in urine", "dark urine", "painful urination", "swollen ankles", "hypertension", "diabetes"],
  },

  // ── PSYCHIATRISTS ────────────────────────────────────────────────────────
  {
    doctorId:   "D1016",
    name:       "Dr. Thushara Weerasooriya",
    gender:     "M",
    rating:     4.7,
    experience: 15,
    fee:        3000,
    languages:  ["Sinhala", "English"],
    about:      "Consultant psychiatrist with special interest in anxiety, depression and stress-related disorders in young adults.",
    specializations: [
      { id: "1277", name: "Consultant Psychiatrist" },
    ],
    hospitals: [
      { id: "H27",  name: "Asiri Central Hospital",       city: "Colombo 10" },
      { id: "H06",  name: "Asiri Medical Hospital",       city: "Colombo 5" },
    ],
    tags: ["persistent sadness", "anxiety", "panic attacks", "mood swings", "sleep problems", "loss of interest", "stress", "difficulty concentrating"],
  },

  // ── ORTHOPAEDIC SURGEONS ─────────────────────────────────────────────────
  {
    doctorId:   "D1017",
    name:       "Dr. Mahesh Liyanage",
    gender:     "M",
    rating:     4.8,
    experience: 19,
    fee:        4000,
    languages:  ["Sinhala", "English"],
    about:      "Consultant orthopaedic surgeon with expertise in sports injuries, joint replacement and spine surgery.",
    specializations: [
      { id: "1371", name: "Consultant Orthopaedic Surgeon" },
      { id: "1083", name: "Trauma And Orthopaedic Surgeon" },
    ],
    hospitals: [
      { id: "H07",  name: "Lanka Hospitals",              city: "Colombo" },
      { id: "H10",  name: "Asiri Surgical Hospital",      city: "Colombo 5" },
    ],
    tags: ["joint pain", "back pain", "neck pain", "muscle weakness", "sports injury", "bone pain", "stiffness in the morning"],
  },

  // ── GENERAL PHYSICIANS ───────────────────────────────────────────────────
  {
    doctorId:   "D1018",
    name:       "Dr. Sachini Amarasinghe",
    gender:     "F",
    rating:     4.5,
    experience: 10,
    fee:        2000,
    languages:  ["Sinhala", "English", "Tamil"],
    about:      "General physician focused on preventive care, lifestyle diseases and early disease detection in young adults.",
    specializations: [
      { id: "592",  name: "Consultant Physician" },
    ],
    hospitals: [
      { id: "H312", name: "Asia Hospitals",               city: "Maharagama" },
      { id: "H280", name: "Blue Cross Hospital",          city: "Rajagiriya" },
    ],
    tags: ["fatigue", "fever", "malaise", "loss of appetite", "chills", "general health", "preventive care"],
  },
  {
    doctorId:   "D1019",
    name:       "Dr. Roshan Fernando",
    gender:     "M",
    rating:     4.6,
    experience: 13,
    fee:        2200,
    languages:  ["Sinhala", "English"],
    about:      "Consultant physician with broad experience in infectious disease, metabolic disorders and NCD prevention.",
    specializations: [
      { id: "592",  name: "Consultant Physician" },
      { id: "748",  name: "Community Medicine" },
    ],
    hospitals: [
      { id: "H03",  name: "Nawaloka Hospital",            city: "Colombo 02" },
      { id: "H49",  name: "Hemas Hospital Thalawathugoda", city: "Thalawathugoda" },
    ],
    tags: ["fever", "night sweats", "fatigue", "unexplained weight loss", "chills", "malaise", "general health"],
  },

  // ── NUTRITIONISTS ────────────────────────────────────────────────────────
  {
    doctorId:   "D1020",
    name:       "Dr. Dilini Jayawardena",
    gender:     "F",
    rating:     4.7,
    experience: 11,
    fee:        2000,
    languages:  ["Sinhala", "English"],
    about:      "Clinical nutrition physician specialising in obesity management, diabetes diet therapy and metabolic health.",
    specializations: [
      { id: "961",  name: "Clinical Nutrition Physician" },
      { id: "1268", name: "Consultant Nutrition Physician" },
      { id: "960",  name: "Weight Management" },
    ],
    hospitals: [
      { id: "H280", name: "Blue Cross Hospital",          city: "Rajagiriya" },
      { id: "H618", name: "Blue Cross Healthy Weight Clinic", city: "Rajagiriya" },
    ],
    tags: ["obesity", "weight gain", "diabetes", "metabolic syndrome", "diet", "cholesterol", "bmi"],
  },
];

// ── Specialization → disease/condition mapping ───────────────────────────────
// Used to match AI analysis disease risks to the right doctor specialisation.
// Keys are lowercase condition/risk names from the AI output.
export const CONDITION_TO_SPECIALTY = {
  // Cardiovascular
  "cardiovascular disease":           ["01", "1206", "452", "166"],
  "heart disease":                    ["01", "1206", "452"],
  "hypertension":                     ["01", "592", "532"],
  "chest pain":                       ["01", "592"],
  "palpitations":                     ["01", "484"],

  // Metabolic / Endocrine
  "type 2 diabetes":                  ["1562", "532", "592"],
  "diabetes":                         ["1562", "532", "592"],
  "metabolic syndrome":               ["1562", "960", "961"],
  "obesity":                          ["960", "961", "1268", "532"],
  "thyroid":                          ["1562"],
  "prediabetes":                      ["1562", "532", "592"],

  // Respiratory
  "respiratory":                      ["559", "111", "1138"],
  "asthma":                           ["559", "521", "111"],
  "copd":                             ["559", "111"],
  "lung":                             ["559", "111"],

  // Gastrointestinal
  "gastroenterology":                 ["1323", "1424"],
  "liver disease":                    ["1323"],
  "gastrointestinal":                 ["1323", "1424"],
  "irritable bowel":                  ["1323", "1424"],

  // Neurological
  "neurological":                     ["485", "479"],
  "epilepsy":                         ["485"],
  "migraine":                         ["485"],
  "stroke":                           ["485", "1032"],

  // Cancer
  "cancer":                           ["208", "1084", "1392"],
  "malignancy":                       ["208", "1084"],
  "lymphoma":                         ["171", "1243", "208"],
  "leukaemia":                        ["171", "1243"],

  // Blood
  "anaemia":                          ["171", "1243"],
  "blood disorder":                   ["171", "1243"],

  // Autoimmune / Rheumatology
  "autoimmune":                       ["21", "1149"],
  "lupus":                            ["21", "1149"],
  "arthritis":                        ["21", "1149", "1371"],
  "rheumatoid":                       ["21", "1149"],

  // Skin
  "skin":                             ["833"],
  "dermatological":                   ["833"],
  "melanoma":                         ["833", "208"],

  // Kidney
  "kidney":                           ["1244"],
  "renal":                            ["1244"],
  "nephropathy":                      ["1244"],

  // Mental Health
  "anxiety":                          ["1277", "191", "1584"],
  "depression":                       ["1277", "191"],
  "mental health":                    ["1277", "191"],
  "stress":                           ["1277", "191"],

  // Musculoskeletal
  "musculoskeletal":                  ["21", "1371", "1083"],
  "back pain":                        ["1371", "1083"],
  "osteoporosis":                     ["21", "1371"],

  // Systemic / General
  "systemic illness":                 ["592", "532"],
  "infection":                        ["592", "532"],
  "undiagnosed":                      ["592", "532"],
  "general":                          ["592", "532"],
};
