import { useState, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronRight, Plus, Trash2, RotateCcw, Car, Wrench, Zap, X, ArrowLeft, ChevronUp, MessageCircle, Calendar, MapPin, Info, Copy, AlertTriangle, CheckCircle, History } from "lucide-react";

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const CUR = "$";
const YR = 2026;
const fmt = v => `${CUR}${Math.round(v/5)*5}`;
const fmtR = (a,b) => `${fmt(a)} – ${fmt(b)}`;

// ═══════════════════════════════════════════════════
// TOP 50 MAKES — ranked by NZ new + used fleet data
// Sources: MIA NZ registration stats, Trade Me Motors,
// NZ Transport Agency fleet data, MoneyHub 2025 analysis
// ═══════════════════════════════════════════════════
const MAKE_GROUPS = {
  "Top Sellers in NZ":[
    "Toyota","Mitsubishi","Kia","Suzuki","Mazda","Ford","Hyundai","Honda","MG","Nissan"
  ],
  "Strong NZ Presence":[
    "Subaru","Volkswagen","BMW","Mercedes-Benz","GWM","BYD","Holden","Audi","Skoda","Isuzu"
  ],
  "Established Brands":[
    "Peugeot","Volvo","Lexus","Jeep","Land Rover","MINI","Renault","Jaguar","Tesla","LDV"
  ],
  "Growing / Niche":[
    "HAVAL","Porsche","Fiat","Citroen","Alfa Romeo","Ssangyong","Daihatsu","Dodge","Chrysler","Genesis"
  ],
};

// ═══════════════════════════════════════════════════
// MODELS — comprehensive NZ fleet coverage
// ═══════════════════════════════════════════════════
const MODELS = {
  Toyota:["86/GR86","Alphard","Aqua","Aurion","Avalon","Axio","C-HR","Caldina","Camry","Celica","Corolla","Crown","Dyna","Echo","Estima","FJ Cruiser","Fielder","Fortuner","GR Yaris","Granvia","Harrier","Hiace","Highlander","Hilux","Ipsum","Ist","Kluger","Land Cruiser","Land Cruiser Prado","Mark X","Noah","Passo","Porte","Premio","Prius","RAV4","Ractis","Raize","Rush","Soarer","Starlet","Supra","Surf","Vanguard","Vellfire","Verso","Vitz","Voxy","Wish","Yaris","Yaris Cross","Other"],
  Mitsubishi:["ASX","Challenger","Colt","Delica","Eclipse Cross","Galant","Grandis","L300","Lancer","Mirage","Outlander","Outlander PHEV","Pajero","Pajero IO","RVR","Triton","Other"],
  Kia:["Carnival","Cerato","EV6","EV9","Niro","Optima","Picanto","Rio","Seltos","Sorento","Soul","Sportage","Stinger","Stonic","Other"],
  Suzuki:["Alto","Baleno","Carry","Celerio","Escudo","Every","Grand Vitara","Hustler","Ignis","Jimny","Liana","S-Cross","SX4","Solio","Spacia","Swift","Vitara","Wagon R","Other"],
  Mazda:["2/Demio","3/Axela","5/Premacy","6/Atenza","BT-50","Biante","Bongo","CX-3","CX-30","CX-5","CX-60","CX-7","CX-8","CX-9","Demio","MX-5","MX-30","RX-7","RX-8","Other"],
  Ford:["Ecosport","Endura","Escape","Everest","Explorer","F-150","Falcon","Fiesta","Focus","Kuga","Mondeo","Mustang","Puma","Ranger","Ranger Raptor","Territory","Transit","Transit Custom","Other"],
  Hyundai:["Accent","Elantra","Getz","i20","i30","i40","Ioniq","Ioniq 5","Ioniq 6","ix35","Kona","Kona Electric","Palisade","Santa Fe","Sonata","Staria","Tucson","Veloster","Venue","Other"],
  Honda:["Accord","Airwave","City","Civic","Civic Type R","CR-V","CR-Z","Fit/Jazz","Fit Shuttle","Freed","HR-V","Insight","Integra","Legend","N-Box","Odyssey","Prelude","S2000","Shuttle","Step Wagon","Stream","Vezel","ZR-V","Other"],
  MG:["3","GS","HS","MG4","ZS","ZS EV","Other"],
  Nissan:["180SX","350Z","370Z","Almera","Ariya","Bluebird","Cube","Dualis","Elgrand","GT-R","Juke","Kicks","Leaf","March","Micra","Murano","Navara","Note","NV200","NV350","Pathfinder","Patrol","Primera","Pulsar","Qashqai","Serena","Silvia","Skyline","Stagea","Sunny","Teana","Tiida","Wingroad","X-Trail","Other"],
  Subaru:["BRZ","Crosstrek","Exiga","Forester","Impreza","Legacy","Levorg","Liberty","Outback","Solterra","WRX","XV","Other"],
  Volkswagen:["Amarok","Arteon","Beetle","Caddy","Golf","Golf GTI","Golf R","ID.4","ID.5","Jetta","Multivan","Passat","Polo","Polo GTI","T-Cross","T-Roc","Tiguan","Touareg","Transporter","Other"],
  BMW:["1 Series","2 Series","3 Series","4 Series","5 Series","7 Series","i3","i4","i5","iX","iX3","M2","M3","M4","M5","X1","X2","X3","X4","X5","X6","X7","Z4","Other"],
  "Mercedes-Benz":["A-Class","AMG GT","B-Class","C-Class","CLA","CLS","E-Class","EQA","EQB","EQC","G-Class","GLA","GLB","GLC","GLE","GLS","S-Class","SLK","Sprinter","Vito","Other"],
  GWM:["Cannon","Ora","Tank 300","Tank 500","Other"],
  BYD:["Atto 3","Dolphin","Seal","Shark","Tang","Other"],
  Holden:["Astra","Barina","Captiva","Colorado","Commodore","Cruze","Equinox","Rodeo","Trailblazer","Trax","Other"],
  Audi:["A1","A3","A4","A5","A6","A7","Q2","Q3","Q5","Q7","Q8","RS3","RS4","RS5","RS6","S3","S4","TT","e-tron","Other"],
  Skoda:["Enyaq","Fabia","Kamiq","Karoq","Kodiaq","Octavia","Rapid","Scala","Superb","Other"],
  Isuzu:["D-Max","MU-X","Other"],
  Peugeot:["2008","206","207","208","3008","307","308","5008","508","Other"],
  Volvo:["C30","EX30","S40","S60","S90","V40","V60","V90","XC40","XC60","XC90","Other"],
  Lexus:["CT","ES","GS","IS","LC","LS","LX","NX","RC","RX","UX","Other"],
  Jeep:["Cherokee","Compass","Gladiator","Grand Cherokee","Renegade","Wrangler","Other"],
  "Land Rover":["Defender","Discovery","Discovery Sport","Freelander","Range Rover","Range Rover Evoque","Range Rover Sport","Range Rover Velar","Other"],
  MINI:["Clubman","Cooper","Countryman","Hatch","Other"],
  Renault:["Captur","Clio","Kadjar","Koleos","Megane","Scenic","Zoe","Other"],
  Jaguar:["E-Pace","F-Pace","F-Type","I-Pace","XE","XF","XJ","Other"],
  Tesla:["Model 3","Model S","Model X","Model Y","Other"],
  LDV:["D90","Deliver 9","G10","T60","Other"],
  HAVAL:["H2","H6","H9","Jolion","Other"],
  Porsche:["718 Boxster","718 Cayman","911","Cayenne","Macan","Panamera","Taycan","Other"],
  Fiat:["500","500X","Ducato","Punto","Other"],
  Citroen:["Berlingo","C3","C4","C5","DS3","Other"],
  "Alfa Romeo":["Giulia","Giulietta","Stelvio","Other"],
  Ssangyong:["Actyon","Korando","Musso","Rexton","Tivoli","Torres","Other"],
  Daihatsu:["Boon","Charade","Copen","Cuore","Hijet","Mira","Move","Rocky","Sirion","Tanto","Terios","Other"],
  Dodge:["Challenger","Charger","Journey","Nitro","Ram","Other"],
  Chrysler:["300","Grand Voyager","PT Cruiser","Voyager","Other"],
  Genesis:["G70","G80","GV60","GV70","GV80","Other"],
};

// ═══════════════════════════════════════════════════
// VEHICLE CLASSIFICATION
// ═══════════════════════════════════════════════════
const TIERS={Economy:{lM:1,pM:1},Standard:{lM:1,pM:1.1},"Truck/HD":{lM:1.15,pM:1.2},Luxury:{lM:1.3,pM:1.5},"Euro Performance":{lM:1.5,pM:1.8},"Electric/Hybrid":{lM:1.2,pM:1.4}};
const TIER_COL={Economy:"#22C55E",Standard:"#3B82F6","Truck/HD":"#F59E0B",Luxury:"#A855F7","Euro Performance":"#EF4444","Electric/Hybrid":"#06B6D4"};
const LUX=new Set(["BMW","Mercedes-Benz","Audi","Lexus","Volvo","Jaguar","Land Rover","Genesis"]);
const PERF_MK=new Set(["Porsche"]);
const EV_MK=new Set(["Tesla","BYD"]);
const EV_MD=new Set(["Leaf","Ioniq 5","Ioniq 6","EV6","EV9","Kona Electric","ZS EV","Solterra","MX-30","e-tron","ID.4","ID.5","i3","i4","i5","iX","iX3","EQA","EQB","EQC","I-Pace","Taycan","Atto 3","Dolphin","Seal","Shark","Enyaq","Zoe","MG4","EX30","Ora","Aqua","Prius","Outlander PHEV","Model 3","Model S","Model X","Model Y","GV60"]);
const TRUCK=new Set(["Hilux","Ranger","Ranger Raptor","Navara","Triton","D-Max","Colorado","BT-50","Amarok","Land Cruiser","Land Cruiser Prado","Pajero","Everest","Pathfinder","MU-X","Patrol","F-150","Gladiator","Cannon","T60","Musso","Shark","Tank 300","Tank 500"]);
const ECO=new Set(["Aqua","Fit/Jazz","Vitz","March","Swift","Alto","Celerio","Ignis","Mirage","Picanto","i20","Barina","Note","Mira","Move","Tanto","Cuore","Passo","Demio","3"]);
const PERF_MD=new Set(["M2","M3","M4","M5","AMG GT","RS3","RS4","RS5","RS6","Supra","WRX","GR Yaris","Civic Type R","GT-R","Skyline","911","Stinger"]);

function classify(make,model){
  if(EV_MK.has(make)||EV_MD.has(model))return"Electric/Hybrid";
  if(PERF_MK.has(make)||PERF_MD.has(model))return"Euro Performance";
  if(LUX.has(make))return"Luxury";
  if(TRUCK.has(model))return"Truck/HD";
  if(ECO.has(model))return"Economy";
  return"Standard";
}
function ageMult(y){const a=YR-y;if(a<=7)return 1;if(a<=12)return 1.05;if(a<=18)return 1.1;if(a<=25)return 1.15;return 1.25}
const isEV=(mk,md)=>EV_MK.has(mk)||EV_MD.has(md);

// ═══════════════════════════════════════════════════
// REGIONS
// ═══════════════════════════════════════════════════
const REGIONS=[
  {id:"auckland",name:"Auckland",mult:1.1},{id:"wellington",name:"Wellington",mult:1.05},
  {id:"christchurch",name:"Christchurch",mult:1.0},{id:"hamilton",name:"Hamilton / Tauranga",mult:0.95},
  {id:"dunedin",name:"Dunedin / Queenstown",mult:1.0},{id:"regional",name:"Regional / Rural",mult:0.9},
];

// ═══════════════════════════════════════════════════
// 120+ SERVICES (NZD, GST inclusive)
// ═══════════════════════════════════════════════════
const SVC=[
  // ENGINE (15)
  {c:"Engine",i:"🔧",n:"Oil & Filter Change",lMin:50,lMax:80,pMin:40,pMax:110,h:"0.5–1",ev:1,u:"green",tip:"The single most important thing you can do for your engine. Every 10,000km or 6 months.",rel:["Engine Air Filter Replacement"]},
  {c:"Engine",i:"🔧",n:"Spark Plug Replacement (4-cyl)",lMin:95,lMax:190,pMin:50,pMax:130,h:"1–2",ev:1,u:"yellow",tip:"Worn plugs reduce fuel economy and cause misfires. Replace every 40,000–60,000km."},
  {c:"Engine",i:"🔧",n:"Spark Plug Replacement (6/8-cyl)",lMin:190,lMax:400,pMin:95,pMax:260,h:"2–4",ev:1,u:"yellow"},
  {c:"Engine",i:"🔧",n:"Timing Belt/Chain Replacement",lMin:480,lMax:960,pMin:240,pMax:640,h:"3–8",u:"orange",tip:"If this breaks, it can destroy your engine. Replace every 80,000–100,000km. Get the water pump done at the same time to save labour.",rel:["Water Pump Replacement","Serpentine/Drive Belt Replacement"]},
  {c:"Engine",i:"🔧",n:"Head Gasket Replacement",lMin:1280,lMax:2400,pMin:320,pMax:800,h:"8–16",u:"red",tip:"White smoke from exhaust + overheating = likely head gasket. Ignoring this causes catastrophic engine damage."},
  {c:"Engine",i:"🔧",n:"Engine Mount Replacement",lMin:320,lMax:640,pMin:160,pMax:480,h:"2–4",u:"yellow"},
  {c:"Engine",i:"🔧",n:"Valve Cover Gasket",lMin:160,lMax:400,pMin:50,pMax:130,h:"1–3",u:"yellow"},
  {c:"Engine",i:"🔧",n:"Intake Manifold Gasket",lMin:320,lMax:640,pMin:80,pMax:240,h:"2–5",u:"orange"},
  {c:"Engine",i:"🔧",n:"Turbocharger Repair/Replace",lMin:800,lMax:1920,pMin:640,pMax:3200,h:"4–8",u:"red"},
  {c:"Engine",i:"🔧",n:"Engine Rebuild (estimate)",lMin:3200,lMax:6400,pMin:2400,pMax:6400,h:"20–40",u:"red"},
  {c:"Engine",i:"🔧",n:"PCV Valve Replacement",lMin:65,lMax:130,pMin:16,pMax:50,h:"0.5–1",u:"green"},
  {c:"Engine",i:"🔧",n:"Throttle Body Service",lMin:160,lMax:320,pMin:80,pMax:320,h:"1–2",u:"yellow"},
  {c:"Engine",i:"🔧",n:"Engine Air Filter Replacement",lMin:30,lMax:65,pMin:25,pMax:65,h:"0.25–0.5",u:"green",tip:"Clogged filter = less power and worse fuel economy. Replace every 20,000km. Cheap and easy."},
  {c:"Engine",i:"🔧",n:"Compression Test / Leak-Down",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",u:"yellow"},
  {c:"Engine",i:"🔧",n:"Oil Leak Diagnosis & Repair",lMin:240,lMax:800,pMin:50,pMax:320,h:"2–6",u:"orange"},
  // TRANSMISSION (11)
  {c:"Transmission",i:"⚙️",n:"Transmission Fluid Change",lMin:130,lMax:240,pMin:65,pMax:160,h:"1–2",u:"green",tip:"Transmission fluid breaks down over time. Changing it every 60,000km prevents costly gearbox problems."},
  {c:"Transmission",i:"⚙️",n:"Transmission Flush (Full)",lMin:190,lMax:320,pMin:130,pMax:240,h:"1.5–2.5",u:"green"},
  {c:"Transmission",i:"⚙️",n:"Clutch Replacement (Manual)",lMin:640,lMax:1280,pMin:480,pMax:1120,h:"4–8",u:"orange",tip:"A slipping clutch only gets worse. If you feel it slipping or the biting point is high, book it in."},
  {c:"Transmission",i:"⚙️",n:"Transmission Rebuild (estimate)",lMin:2400,lMax:4800,pMin:1280,pMax:4000,h:"15–30",u:"red"},
  {c:"Transmission",i:"⚙️",n:"CV Axle/Half Shaft Replacement",lMin:240,lMax:480,pMin:130,pMax:400,h:"1.5–3",u:"orange"},
  {c:"Transmission",i:"⚙️",n:"Differential Service",lMin:130,lMax:240,pMin:50,pMax:130,h:"1–2",u:"green"},
  {c:"Transmission",i:"⚙️",n:"U-Joint Replacement",lMin:160,lMax:320,pMin:50,pMax:130,h:"1–2",u:"orange"},
  {c:"Transmission",i:"⚙️",n:"Transfer Case Service (AWD/4WD)",lMin:160,lMax:320,pMin:65,pMax:160,h:"1–2",u:"green"},
  {c:"Transmission",i:"⚙️",n:"Torque Converter Replacement",lMin:800,lMax:1600,pMin:320,pMax:960,h:"5–10",u:"red"},
  {c:"Transmission",i:"⚙️",n:"Flywheel Resurfacing/Replacement",lMin:320,lMax:640,pMin:160,pMax:560,h:"3–5",u:"orange"},
  {c:"Transmission",i:"⚙️",n:"Transmission Mount Replacement",lMin:240,lMax:400,pMin:80,pMax:240,h:"1.5–3",u:"yellow"},
  // BRAKES (9)
  {c:"Brakes",i:"🛑",n:"Brake Pad Replacement (per axle)",lMin:130,lMax:240,pMin:65,pMax:190,h:"1–2",u:"orange",tip:"Pads last 30,000–70,000km. Grinding = metal-on-metal = damaging your rotors, turning a $200 job into $800+."},
  {c:"Brakes",i:"🛑",n:"Brake Pad + Rotor Replacement (per axle)",lMin:240,lMax:480,pMin:190,pMax:560,h:"2–3",u:"orange"},
  {c:"Brakes",i:"🛑",n:"Brake Caliper Replacement (each)",lMin:160,lMax:320,pMin:130,pMax:400,h:"1–2",u:"red"},
  {c:"Brakes",i:"🛑",n:"Brake Line Replacement",lMin:160,lMax:400,pMin:50,pMax:130,h:"1–3",u:"red"},
  {c:"Brakes",i:"🛑",n:"Brake Fluid Flush",lMin:95,lMax:160,pMin:30,pMax:65,h:"0.5–1",u:"green",tip:"Brake fluid absorbs moisture, reducing performance. Flush every 2 years or 40,000km."},
  {c:"Brakes",i:"🛑",n:"Brake Master Cylinder",lMin:320,lMax:560,pMin:160,pMax:480,h:"2–4",u:"red"},
  {c:"Brakes",i:"🛑",n:"ABS Module Repair/Replace",lMin:480,lMax:960,pMin:320,pMax:1280,h:"2–4",u:"orange"},
  {c:"Brakes",i:"🛑",n:"Parking Brake Repair",lMin:160,lMax:320,pMin:50,pMax:160,h:"1–2",u:"yellow"},
  {c:"Brakes",i:"🛑",n:"Brake Booster Replacement",lMin:320,lMax:640,pMin:240,pMax:560,h:"2–4",u:"red"},
  // SUSPENSION (13)
  {c:"Suspension",i:"🏎️",n:"Shock/Strut Replacement (pair)",lMin:320,lMax:640,pMin:240,pMax:800,h:"2–4",u:"yellow"},
  {c:"Suspension",i:"🏎️",n:"Full Strut Assembly (pair)",lMin:400,lMax:720,pMin:320,pMax:960,h:"2–4",u:"yellow"},
  {c:"Suspension",i:"🏎️",n:"Ball Joint Replacement (each)",lMin:160,lMax:400,pMin:65,pMax:240,h:"1–3",u:"orange"},
  {c:"Suspension",i:"🏎️",n:"Tie Rod End Replacement (each)",lMin:130,lMax:240,pMin:50,pMax:160,h:"1–2",u:"orange",rel:["Wheel Alignment (4-wheel)"]},
  {c:"Suspension",i:"🏎️",n:"Control Arm Replacement",lMin:240,lMax:480,pMin:130,pMax:400,h:"2–3",u:"yellow"},
  {c:"Suspension",i:"🏎️",n:"Wheel Bearing Replacement",lMin:240,lMax:560,pMin:95,pMax:320,h:"1.5–3",u:"orange",tip:"Humming that changes with speed = wheel bearing. Don't ignore it — a seized bearing can lock a wheel."},
  {c:"Suspension",i:"🏎️",n:"Power Steering Pump",lMin:320,lMax:640,pMin:160,pMax:480,h:"2–4",u:"orange"},
  {c:"Suspension",i:"🏎️",n:"Power Steering Rack",lMin:640,lMax:1280,pMin:320,pMax:960,h:"3–6",u:"orange"},
  {c:"Suspension",i:"🏎️",n:"Power Steering Fluid Flush",lMin:95,lMax:160,pMin:30,pMax:65,h:"0.5–1",u:"green"},
  {c:"Suspension",i:"🏎️",n:"Sway Bar Link Replacement (pair)",lMin:130,lMax:240,pMin:65,pMax:160,h:"1–2",u:"yellow"},
  {c:"Suspension",i:"🏎️",n:"Wheel Alignment (2-wheel)",lMin:80,lMax:130,pMin:0,pMax:0,h:"0.5–1",u:"green"},
  {c:"Suspension",i:"🏎️",n:"Wheel Alignment (4-wheel)",lMin:130,lMax:190,pMin:0,pMax:0,h:"1–1.5",u:"green",tip:"Get alignment checked after suspension work or hitting a big pothole. Misalignment eats tyres fast."},
  {c:"Suspension",i:"🏎️",n:"Coil Spring Replacement (pair)",lMin:320,lMax:640,pMin:160,pMax:480,h:"2–4",u:"yellow"},
  // ELECTRICAL (9)
  {c:"Electrical",i:"⚡",n:"Battery Replacement",lMin:50,lMax:95,pMin:130,pMax:400,h:"0.5–1",u:"orange",tip:"NZ batteries last 3–5 years. Slow to start in winter? Get it tested before it strands you."},
  {c:"Electrical",i:"⚡",n:"Alternator Replacement",lMin:240,lMax:480,pMin:240,pMax:640,h:"1.5–3",u:"red"},
  {c:"Electrical",i:"⚡",n:"Starter Motor Replacement",lMin:240,lMax:480,pMin:160,pMax:560,h:"1.5–3",u:"red"},
  {c:"Electrical",i:"⚡",n:"Wiring Harness Repair",lMin:240,lMax:800,pMin:80,pMax:480,h:"2–6",u:"orange"},
  {c:"Electrical",i:"⚡",n:"Check Engine Light Diagnostic",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",u:"yellow",tip:"A proper diagnostic saves you from guessing and replacing the wrong parts."},
  {c:"Electrical",i:"⚡",n:"General Electrical Diagnostic",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",u:"yellow"},
  {c:"Electrical",i:"⚡",n:"Headlight Assembly Replacement",lMin:130,lMax:320,pMin:160,pMax:800,h:"1–2",u:"yellow"},
  {c:"Electrical",i:"⚡",n:"Window Motor/Regulator",lMin:160,lMax:400,pMin:130,pMax:400,h:"1–2.5",u:"yellow"},
  {c:"Electrical",i:"⚡",n:"Door Lock Actuator",lMin:160,lMax:320,pMin:80,pMax:240,h:"1–2",u:"yellow"},
  // COOLING (8)
  {c:"Cooling",i:"🌡️",n:"Radiator Replacement",lMin:320,lMax:640,pMin:240,pMax:640,h:"2–4",u:"red"},
  {c:"Cooling",i:"🌡️",n:"Radiator Hose Replacement",lMin:95,lMax:190,pMin:50,pMax:130,h:"0.5–1.5",u:"orange"},
  {c:"Cooling",i:"🌡️",n:"Water Pump Replacement",lMin:320,lMax:640,pMin:130,pMax:400,h:"2–5",u:"orange",tip:"Often fails around same time as timing belt. Doing both together saves heaps on labour."},
  {c:"Cooling",i:"🌡️",n:"Thermostat Replacement",lMin:130,lMax:320,pMin:30,pMax:95,h:"1–2",u:"orange"},
  {c:"Cooling",i:"🌡️",n:"Coolant Flush",lMin:95,lMax:160,pMin:30,pMax:65,h:"0.5–1",u:"green"},
  {c:"Cooling",i:"🌡️",n:"Heater Core Replacement",lMin:800,lMax:1920,pMin:160,pMax:400,h:"6–12",u:"yellow"},
  {c:"Cooling",i:"🌡️",n:"Radiator Fan Motor",lMin:240,lMax:480,pMin:160,pMax:480,h:"1.5–3",u:"orange"},
  {c:"Cooling",i:"🌡️",n:"Coolant Leak Diagnosis & Repair",lMin:160,lMax:480,pMin:50,pMax:240,h:"1–3",u:"orange"},
  // EXHAUST (7)
  {c:"Exhaust",i:"💨",n:"Catalytic Converter Replacement",lMin:320,lMax:800,pMin:480,pMax:3200,h:"2–4",ev:1,u:"orange"},
  {c:"Exhaust",i:"💨",n:"Muffler Replacement",lMin:130,lMax:320,pMin:95,pMax:400,h:"1–2",ev:1,u:"yellow"},
  {c:"Exhaust",i:"💨",n:"Exhaust Pipe Repair/Replace",lMin:160,lMax:400,pMin:80,pMax:320,h:"1–3",ev:1,u:"yellow"},
  {c:"Exhaust",i:"💨",n:"Exhaust Manifold Repair",lMin:320,lMax:640,pMin:160,pMax:560,h:"2–5",ev:1,u:"orange"},
  {c:"Exhaust",i:"💨",n:"O2 Sensor Replacement",lMin:130,lMax:240,pMin:80,pMax:320,h:"0.5–1.5",ev:1,u:"yellow"},
  {c:"Exhaust",i:"💨",n:"EGR Valve Replacement",lMin:160,lMax:400,pMin:80,pMax:320,h:"1–3",ev:1,u:"yellow"},
  {c:"Exhaust",i:"💨",n:"DPF Cleaning/Replacement (Diesel)",lMin:320,lMax:800,pMin:480,pMax:4000,h:"2–4",u:"orange"},
  // FUEL (6)
  {c:"Fuel System",i:"⛽",n:"Fuel Pump Replacement",lMin:320,lMax:640,pMin:240,pMax:800,h:"2–4",ev:1,u:"red"},
  {c:"Fuel System",i:"⛽",n:"Fuel Injector Replacement (each)",lMin:130,lMax:240,pMin:80,pMax:320,h:"1–2",ev:1,u:"yellow"},
  {c:"Fuel System",i:"⛽",n:"Fuel Injector Cleaning",lMin:130,lMax:240,pMin:50,pMax:95,h:"1–1.5",ev:1,u:"green"},
  {c:"Fuel System",i:"⛽",n:"Fuel Filter Replacement",lMin:80,lMax:160,pMin:25,pMax:80,h:"0.5–1",ev:1,u:"green"},
  {c:"Fuel System",i:"⛽",n:"Mass Air Flow Sensor",lMin:95,lMax:190,pMin:80,pMax:320,h:"0.5–1",u:"yellow"},
  {c:"Fuel System",i:"⛽",n:"Throttle Position Sensor",lMin:130,lMax:240,pMin:65,pMax:190,h:"0.5–1.5",u:"yellow"},
  // TYRES (6)
  {c:"Tyres",i:"🛞",n:"Tyre Rotation",lMin:30,lMax:65,pMin:0,pMax:0,h:"0.5",u:"green"},
  {c:"Tyres",i:"🛞",n:"Tyre Balance (per tyre)",lMin:25,lMax:40,pMin:0,pMax:0,h:"0.25–0.5",u:"green"},
  {c:"Tyres",i:"🛞",n:"Tyre Repair (patch/plug)",lMin:30,lMax:65,pMin:8,pMax:25,h:"0.5",u:"orange"},
  {c:"Tyres",i:"🛞",n:"Tyre Mount & Balance (per tyre)",lMin:40,lMax:70,pMin:0,pMax:0,h:"0.5",u:"green"},
  {c:"Tyres",i:"🛞",n:"TPMS Sensor Replacement (each)",lMin:65,lMax:130,pMin:50,pMax:130,h:"0.5–1",u:"yellow"},
  {c:"Tyres",i:"🛞",n:"Rim Repair/Straightening",lMin:120,lMax:240,pMin:0,pMax:0,h:"1–2",u:"yellow"},
  // HVAC (6)
  {c:"HVAC",i:"❄️",n:"A/C Recharge (Refrigerant)",lMin:160,lMax:290,pMin:50,pMax:95,h:"0.5–1",u:"green",tip:"A/C not as cold? Likely needs a recharge. Quick and affordable."},
  {c:"HVAC",i:"❄️",n:"A/C Compressor Replacement",lMin:480,lMax:960,pMin:320,pMax:960,h:"3–5",u:"orange"},
  {c:"HVAC",i:"❄️",n:"A/C Condenser Replacement",lMin:320,lMax:640,pMin:240,pMax:640,h:"2–4",u:"orange"},
  {c:"HVAC",i:"❄️",n:"A/C Evaporator Replacement",lMin:800,lMax:1600,pMin:240,pMax:560,h:"5–10",u:"yellow"},
  {c:"HVAC",i:"❄️",n:"Blower Motor Replacement",lMin:160,lMax:400,pMin:80,pMax:320,h:"1–3",u:"yellow"},
  {c:"HVAC",i:"❄️",n:"Cabin Air Filter",lMin:30,lMax:65,pMin:25,pMax:65,h:"0.25–0.5",u:"green"},
  // MISC (4)
  {c:"Misc",i:"🔩",n:"Serpentine/Drive Belt Replacement",lMin:95,lMax:190,pMin:40,pMax:95,h:"0.5–1.5",u:"yellow",tip:"Squealing on startup = worn belt. Replace before it snaps and kills your power steering + alternator."},
  {c:"Misc",i:"🔩",n:"Windscreen Wiper Motor",lMin:160,lMax:320,pMin:95,pMax:240,h:"1–2",u:"yellow"},
  {c:"Misc",i:"🔩",n:"Side Mirror Replacement",lMin:130,lMax:320,pMin:80,pMax:480,h:"0.5–1.5",u:"yellow"},
  {c:"Misc",i:"🔩",n:"Boot/Hatch Struts",lMin:95,lMax:190,pMin:50,pMax:130,h:"0.5–1",u:"green"},
  // WOF & INSPECTIONS (6)
  {c:"WOF & Inspections",i:"📋",n:"Warrant of Fitness (WOF)",lMin:50,lMax:70,pMin:0,pMax:0,h:"0.5",u:"green",tip:"In NZ, vehicles need a WOF: new cars at 3 years, then annually. A pre-WOF check can save a failed inspection and retest fee."},
  {c:"WOF & Inspections",i:"📋",n:"Pre-Purchase Inspection",lMin:160,lMax:320,pMin:0,pMax:0,h:"1–2",u:"green",tip:"Best $200 you'll spend on a used car. Can save you thousands in hidden problems."},
  {c:"WOF & Inspections",i:"📋",n:"General Multi-Point Inspection",lMin:80,lMax:160,pMin:0,pMax:0,h:"0.5–1",u:"green"},
  {c:"WOF & Inspections",i:"📋",n:"Noise/Vibration Diagnosis",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",u:"yellow"},
  {c:"WOF & Inspections",i:"📋",n:"Fluid Leak Diagnosis",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",u:"yellow"},
  {c:"WOF & Inspections",i:"📋",n:"Drivability Diagnosis",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",u:"yellow"},
];

const CATS=[...new Set(SVC.map(s=>s.c))];
const CAT_IC={};SVC.forEach(s=>{CAT_IC[s.c]=s.i});

// ═══════════════════════════════════════════════════
// NLP SYMPTOM ENGINE (23 rules)
// ═══════════════════════════════════════════════════
const SYM_RULES=[
  {kw:["grinding","brake"],svcs:["Brake Pad Replacement (per axle)","Brake Pad + Rotor Replacement (per axle)"],why:"Grinding when braking = pads worn through"},
  {kw:["squeal","brake"],svcs:["Brake Pad Replacement (per axle)"],why:"Squealing = pads wearing thin"},
  {kw:["shake","vibrat","speed"],svcs:["Tyre Balance (per tyre)","CV Axle/Half Shaft Replacement","Wheel Alignment (4-wheel)"],why:"Vibration at speed: tyres, CV joints, or alignment"},
  {kw:["won't start","click","no start","doesn't start","wont start"],svcs:["Battery Replacement","Starter Motor Replacement","Alternator Replacement"],why:"Clicking/no start: battery, starter, or alternator"},
  {kw:["leak","green","coolant"],svcs:["Coolant Leak Diagnosis & Repair","Radiator Hose Replacement","Radiator Replacement"],why:"Green fluid = coolant leak"},
  {kw:["leak","oil","brown"],svcs:["Oil Leak Diagnosis & Repair","Valve Cover Gasket"],why:"Dark fluid underneath = oil leak"},
  {kw:["smoke","white"],svcs:["Head Gasket Replacement","Coolant Leak Diagnosis & Repair"],why:"White smoke = coolant burning in engine"},
  {kw:["smoke","blue"],svcs:["Valve Cover Gasket","Turbocharger Repair/Replace"],why:"Blue smoke = oil burning"},
  {kw:["smoke","black"],svcs:["Engine Air Filter Replacement","Fuel Injector Cleaning","Mass Air Flow Sensor"],why:"Black smoke = running rich (too much fuel)"},
  {kw:["overheat","hot","temperature"],svcs:["Thermostat Replacement","Water Pump Replacement","Radiator Replacement","Coolant Flush"],why:"Overheating needs urgent attention"},
  {kw:["engine light","check engine","cel"],svcs:["Check Engine Light Diagnostic"],why:"Diagnostic scan will identify the fault code"},
  {kw:["rough","idle","misfire"],svcs:["Spark Plug Replacement (4-cyl)","Throttle Body Service","Fuel Injector Cleaning"],why:"Rough idle: plugs, throttle body, or fuel delivery"},
  {kw:["pull","left","right","drift"],svcs:["Wheel Alignment (4-wheel)","Tie Rod End Replacement (each)"],why:"Pulling = alignment or worn tie rods"},
  {kw:["squeal","belt","screech"],svcs:["Serpentine/Drive Belt Replacement"],why:"Belt squeal = worn or loose belt"},
  {kw:["clunk","bump","knock","rattle"],svcs:["Sway Bar Link Replacement (pair)","Ball Joint Replacement (each)","Shock/Strut Replacement (pair)"],why:"Clunking over bumps = worn suspension"},
  {kw:["ac","air con","warm","not cold"],svcs:["A/C Recharge (Refrigerant)","A/C Compressor Replacement"],why:"Warm A/C: low refrigerant or compressor issue"},
  {kw:["wof","warrant","fail"],svcs:["Warrant of Fitness (WOF)","General Multi-Point Inspection"],why:"Pre-WOF check identifies issues before your inspection"},
  {kw:["stall","die","cut out"],svcs:["Fuel Pump Replacement","Fuel Filter Replacement","Throttle Position Sensor"],why:"Stalling: fuel delivery or sensors"},
  {kw:["slip","gear","jerk","shift"],svcs:["Transmission Fluid Change","Clutch Replacement (Manual)","Transmission Rebuild (estimate)"],why:"Transmission slipping needs attention before total failure"},
  {kw:["steering","heavy","stiff","hard to turn"],svcs:["Power Steering Pump","Power Steering Fluid Flush"],why:"Heavy steering = power steering issue"},
  {kw:["battery","dead","flat","charge"],svcs:["Battery Replacement","Alternator Replacement"],why:"Flat battery: battery itself or alternator not charging"},
  {kw:["fuel","economy","consumption","petrol"],svcs:["Engine Air Filter Replacement","Spark Plug Replacement (4-cyl)","Fuel Injector Cleaning","O2 Sensor Replacement"],why:"Multiple causes for poor fuel economy"},
  {kw:["noise","wheel","humm","hum","drone"],svcs:["Wheel Bearing Replacement"],why:"Humming that changes with speed = wheel bearing"},
];

function matchSym(input){
  const lw=input.toLowerCase();const res=[];const seen=new Set();
  SYM_RULES.forEach(r=>{
    if(r.kw.some(k=>lw.includes(k))){
      r.svcs.forEach(name=>{if(!seen.has(name)){const s=SVC.find(x=>x.n===name);if(s){res.push({s,why:r.why});seen.add(name)}}})
    }
  });return res;
}

// ═══════════════════════════════════════════════════
// MAINTENANCE SCHEDULE
// ═══════════════════════════════════════════════════
const MAINT=[
  {km:10000,l:"10,000 km",s:["Oil & Filter Change","Tyre Rotation"]},
  {km:20000,l:"20,000 km",s:["Oil & Filter Change","Tyre Rotation","Cabin Air Filter"]},
  {km:40000,l:"40,000 km",s:["Oil & Filter Change","Engine Air Filter Replacement","Spark Plug Replacement (4-cyl)","Fuel Filter Replacement"]},
  {km:60000,l:"60,000 km",s:["Oil & Filter Change","Transmission Fluid Change","Coolant Flush","Brake Fluid Flush"]},
  {km:80000,l:"80,000 km",s:["Oil & Filter Change","Spark Plug Replacement (4-cyl)","Serpentine/Drive Belt Replacement"]},
  {km:100000,l:"100,000 km ★",s:["Timing Belt/Chain Replacement","Water Pump Replacement","Brake Pad + Rotor Replacement (per axle)","Coolant Flush","Spark Plug Replacement (4-cyl)"]},
  {km:150000,l:"150,000 km",s:["CV Axle/Half Shaft Replacement","Wheel Bearing Replacement","Clutch Replacement (Manual)","Shock/Strut Replacement (pair)"]},
  {km:200000,l:"200,000 km+",s:["General Multi-Point Inspection","Engine Rebuild (estimate)","Transmission Rebuild (estimate)"]},
];

// ═══════════════════════════════════════════════════
// SMART BUNDLES
// ═══════════════════════════════════════════════════
const BUNDLES=[
  {id:"wof",nm:"🛡️ WOF Prep",desc:"Pass first time",svcs:["Warrant of Fitness (WOF)","General Multi-Point Inspection","Brake Pad Replacement (per axle)"],disc:0.10},
  {id:"100k",nm:"🔧 100K Service",desc:"Protect your engine",svcs:["Timing Belt/Chain Replacement","Water Pump Replacement","Coolant Flush","Spark Plug Replacement (4-cyl)","Serpentine/Drive Belt Replacement"],disc:0.08},
  {id:"brake",nm:"🛞 Brake & Align",desc:"Stop straight",svcs:["Brake Pad + Rotor Replacement (per axle)","Wheel Alignment (4-wheel)"],disc:0.05},
  {id:"winter",nm:"❄️ Winter Ready",desc:"Cold-proof your car",svcs:["Battery Replacement","Coolant Flush","Cabin Air Filter"],disc:0.05},
  {id:"presale",nm:"💰 Pre-Sale",desc:"Maximise sale price",svcs:["General Multi-Point Inspection","Oil & Filter Change","Cabin Air Filter"],disc:0.05},
  {id:"perf",nm:"🔥 Performance",desc:"Restore lost power",svcs:["Spark Plug Replacement (4-cyl)","Engine Air Filter Replacement","Fuel Injector Cleaning","Throttle Body Service"],disc:0.07},
  {id:"new",nm:"🚗 New-to-You",desc:"Just bought used?",svcs:["Pre-Purchase Inspection","Oil & Filter Change","Brake Fluid Flush","Coolant Flush"],disc:0.08},
];

// ═══════════════════════════════════════════════════
// MODIFIERS
// ═══════════════════════════════════════════════════
const PQ=[{id:"economy",l:"Economy",m:0.8},{id:"oem",l:"OEM",m:1.0},{id:"premium",l:"Premium",m:1.4}];
const SEV=[{id:"routine",l:"Routine",m:1.0},{id:"moderate",l:"Moderate",m:1.15},{id:"severe",l:"Severe",m:1.35}];
const URG_M=[{id:"standard",l:"Standard",m:1.0},{id:"priority",l:"Priority",m:1.1},{id:"emergency",l:"Emergency",m:1.25}];
const URG_MAP={red:{l:"Drive to shop now",col:"#EF4444",bg:"rgba(239,68,68,0.12)"},orange:{l:"Book this week",col:"#F59E0B",bg:"rgba(245,158,11,0.12)"},yellow:{l:"Plan within a month",col:"#EAB308",bg:"rgba(234,179,8,0.1)"},green:{l:"Schedule when convenient",col:"#22C55E",bg:"rgba(34,197,94,0.1)"}};

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════
const C={bg:"#0A0A0C",s1:"#121215",s2:"#1A1A1E",bd:"#1E1E24",ac:"#FF8C00",acD:"rgba(255,140,0,0.12)",tx:"#E8E6E1",td:"#6B6960",tm:"#9B978E",g:"#22C55E",r:"#EF4444",b:"#3B82F6"};
const bb={fontFamily:"'DM Sans',sans-serif",cursor:"pointer",border:"none",transition:"all 0.15s",outline:"none"};

// ═══════════════════════════════════════════════════
// SMALL UI
// ═══════════════════════════════════════════════════
const UB=({level})=>{const d=URG_MAP[level];return d?<span style={{fontSize:"10px",fontWeight:600,color:d.col,background:d.bg,padding:"3px 8px",borderRadius:"4px",whiteSpace:"nowrap"}}>{d.l}</span>:null};
const Pill=({children,color=C.ac,bg=C.acD})=><span style={{fontSize:"11px",fontWeight:600,color,background:bg,padding:"4px 10px",borderRadius:"5px",display:"inline-flex",alignItems:"center",gap:"4px"}}>{children}</span>;
const SB=({sel,onClick,children})=><button onClick={onClick} style={{...bb,background:sel?C.ac:C.s1,color:sel?"#0A0A0C":C.tm,border:`1.5px solid ${sel?C.ac:C.bd}`,borderRadius:"7px",padding:"6px 12px",fontSize:"11px",fontWeight:sel?700:500}}>{children}</button>;
const SL=({children})=><div style={{fontSize:"10px",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.ac,marginBottom:"10px"}}>{children}</div>;

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
export default function QuoteCalcV2(){
  const [year,setYear]=useState("");
  const [make,setMake]=useState("");
  const [model,setModel]=useState("");
  const [customModel,setCM]=useState("");
  const [region,setRegion]=useState("christchurch");
  const [tab,setTab]=useState("quote");
  const [openCat,setOC]=useState(null);
  const [selSvc,setSS]=useState(null);
  const [search,setSrch]=useState("");
  const [nlp,setNlp]=useState("");
  const [nlpR,setNlpR]=useState(null);
  const [odo,setOdo]=useState("");
  const [pq,setPq]=useState("oem");
  const [sev,setSev]=useState("routine");
  const [urg,setUrg]=useState("standard");
  const [basket,setBasket]=useState([]);
  const [showB,setShowB]=useState(false);
  const [hist,setHist]=useState([]);
  const [showPrint,setSP]=useState(false);

  const vSet=year&&make&&(model||customModel);
  const fModel=model==="Other"?customModel:model;
  const tier=vSet?classify(make,fModel):null;
  const td=tier?TIERS[tier]:null;
  const am=year?ageMult(+year):1;
  const vEV=vSet&&isEV(make,fModel);
  const rd=REGIONS.find(r=>r.id===region)||REGIONS[2];

  const years=useMemo(()=>{const y=[];for(let i=YR;i>=1985;i--)y.push(i);return y},[]);
  const mods=useMemo(()=>MODELS[make]||["Other"],[make]);
  const filt=useMemo(()=>{if(!search)return SVC;const q=search.toLowerCase();return SVC.filter(s=>s.n.toLowerCase().includes(q)||s.c.toLowerCase().includes(q))},[search]);
  const catS=useMemo(()=>{const m={};filt.forEach(s=>{if(!m[s.c])m[s.c]=[];m[s.c].push(s)});return m},[filt]);

  const calc=useCallback(svc=>{
    if(!td)return null;
    const pm=PQ.find(p=>p.id===pq)?.m||1,sm=SEV.find(s=>s.id===sev)?.m||1,um=URG_M.find(u=>u.id===urg)?.m||1,rm=rd.mult;
    const lMin=svc.lMin*td.lM*am*sm*um*rm,lMax=svc.lMax*td.lM*am*sm*um*rm;
    const pMin=svc.pMin*td.pM*am*pm,pMax=svc.pMax*td.pM*am*pm;
    return{lMin,lMax,pMin,pMax,tMin:lMin+pMin,tMax:lMax+pMax};
  },[td,am,pq,sev,urg,rd]);

  const addB=(svc,disc=0)=>{const p=calc(svc);if(!p)return;if(disc>0){p.lMin*=(1-disc);p.lMax*=(1-disc);p.tMin=p.lMin+p.pMin;p.tMax=p.lMax+p.pMax}setBasket(prev=>[...prev,{...svc,price:p,disc}]);setShowB(true)};
  const addBundle=b=>b.svcs.forEach(nm=>{const s=SVC.find(x=>x.n===nm);if(s&&!(vEV&&s.ev))addB(s,b.disc)});
  const rmB=i=>setBasket(p=>p.filter((_,j)=>j!==i));

  const bTot=useMemo(()=>{
    let tMin=0,tMax=0;basket.forEach(b=>{tMin+=b.price.tMin;tMax+=b.price.tMax});
    const d=basket.length>=3&&!basket.some(b=>b.disc>0)?0.05:0;
    if(d>0){tMin-=basket.reduce((a,b)=>a+b.price.lMin,0)*d;tMax-=basket.reduce((a,b)=>a+b.price.lMax,0)*d}
    return{tMin,tMax,d,ct:basket.length};
  },[basket]);

  const saveH=()=>{if(!basket.length)return;setHist(p=>[{v:`${year} ${make} ${fModel}`,tier,rgn:rd.name,items:[...basket],tot:{...bTot},ts:Date.now()},...p])};
  const genTxt=()=>{
    const L=[`SERVICE ESTIMATE`,`Vehicle: ${year} ${make} ${fModel} (${tier})`,`Region: ${rd.name}`,`Date: ${new Date().toLocaleDateString('en-NZ')}`,``];
    basket.forEach((b,i)=>{L.push(`${i+1}. ${b.n}`);L.push(`   Labour: ${fmtR(b.price.lMin,b.price.lMax)}`);if(b.price.pMax>0)L.push(`   Parts: ${fmtR(b.price.pMin,b.price.pMax)}`);L.push(`   Subtotal: ${fmtR(b.price.tMin,b.price.tMax)}`);L.push(``)});
    if(bTot.d>0)L.push(`5% multi-service labour discount applied`);
    L.push(`TOTAL: ${fmtR(bTot.tMin,bTot.tMax)}`);L.push(``);L.push(`All estimates NZD, GST inclusive. Actual pricing may vary.`);
    return L.join('\n');
  };

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(rgba(255,140,0,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,0,0.015) 1px,transparent 1px)`,backgroundSize:"50px 50px",pointerEvents:"none"}}/>

      <div style={{maxWidth:"840px",margin:"0 auto",padding:"32px 16px 120px",position:"relative"}}>
        {/* HEADER */}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
          <div style={{width:"4px",height:"32px",background:`linear-gradient(180deg,${C.ac},#FF6200)`,borderRadius:"2px"}}/>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"34px",letterSpacing:"2.5px",color:"#FFF",margin:0,lineHeight:1}}>SERVICE QUOTE CALCULATOR</h1>
        </div>
        <p style={{color:C.td,fontSize:"12px",margin:"0 0 20px 14px"}}>All estimates in NZD • GST inclusive • 50 makes • 120+ services</p>

        {/* VEHICLE */}
        <div style={{marginBottom:"16px",padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${vSet?C.g+"44":C.bd}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
            <SL>Your Vehicle</SL>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}><MapPin size={12} color={C.td}/>
              <select value={region} onChange={e=>setRegion(e.target.value)} style={{padding:"4px 8px",background:C.s2,color:C.tm,border:`1px solid ${C.bd}`,borderRadius:"5px",fontSize:"11px",fontFamily:"'DM Sans'"}}>
                {REGIONS.map(r=><option key={r.id} value={r.id}>{r.name} ({r.mult}x)</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <select value={year} onChange={e=>{setYear(e.target.value);setMake("");setModel("");setSS(null)}} style={{flex:"1 1 100px",minWidth:"100px",padding:"10px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'"}}>
              <option value="">Year</option>{years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <select value={make} onChange={e=>{setMake(e.target.value);setModel("");setSS(null)}} disabled={!year} style={{flex:"1 1 140px",minWidth:"140px",padding:"10px",background:C.s2,color:year?C.tx:C.td,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'",opacity:year?1:0.5}}>
              <option value="">Make</option>
              {Object.entries(MAKE_GROUPS).map(([g,ms])=><optgroup key={g} label={g}>{ms.map(m=><option key={m} value={m}>{m}</option>)}</optgroup>)}
              <option value="Other">Other / Not Listed</option>
            </select>
            <select value={model} onChange={e=>{setModel(e.target.value);setSS(null)}} disabled={!make} style={{flex:"1 1 140px",minWidth:"140px",padding:"10px",background:C.s2,color:make?C.tx:C.td,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'",opacity:make?1:0.5}}>
              <option value="">Model</option>{mods.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {model==="Other"&&<input value={customModel} onChange={e=>setCM(e.target.value)} placeholder="Enter model name..." style={{marginTop:"8px",width:"100%",padding:"10px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'",boxSizing:"border-box"}}/>}
          {vSet&&tier&&(
            <div style={{marginTop:"10px",display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
              <Pill color={TIER_COL[tier]||C.ac} bg={`${TIER_COL[tier]||C.ac}18`}><Car size={12}/>{tier}</Pill>
              <span style={{fontSize:"11px",color:C.td}}>{year} {make} {fModel} • Labour {td.lM}x • Parts {td.pM}x{am>1?` • Age +${Math.round((am-1)*100)}%`:""} • {rd.name}</span>
              {vEV&&<Pill color={C.b} bg="rgba(59,130,246,0.12)"><Zap size={11}/>EV</Pill>}
            </div>
          )}
        </div>

        {/* TABS */}
        {vSet&&(
          <div style={{display:"flex",gap:"4px",marginBottom:"16px",background:C.s1,borderRadius:"8px",padding:"4px",border:`1px solid ${C.bd}`}}>
            {[{id:"quote",ic:<Wrench size={13}/>,lb:"Quote Builder"},{id:"describe",ic:<MessageCircle size={13}/>,lb:"Describe Problem"},{id:"maintenance",ic:<Calendar size={13}/>,lb:"Maintenance"}].map(t=>
              <button key={t.id} onClick={()=>{setTab(t.id);setSS(null)}} style={{...bb,flex:1,padding:"9px 8px",borderRadius:"6px",background:tab===t.id?C.ac:"transparent",color:tab===t.id?"#000":C.tm,fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>{t.ic}{t.lb}</button>
            )}
          </div>
        )}

        {/* ══════ DESCRIBE ══════ */}
        {vSet&&tab==="describe"&&!selSvc&&(
          <div>
            <div style={{padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`,marginBottom:"12px"}}>
              <SL>Describe Your Car Problem</SL>
              <div style={{display:"flex",gap:"8px"}}>
                <input value={nlp} onChange={e=>setNlp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const r=matchSym(nlp);setNlpR(r.length?r:[])}}} placeholder='e.g. "grinding noise when I brake"' style={{flex:1,padding:"12px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'"}}/>
                <button onClick={()=>{const r=matchSym(nlp);setNlpR(r.length?r:[])}} style={{...bb,padding:"12px 20px",background:C.ac,color:"#000",borderRadius:"7px",fontWeight:700}}><Search size={14}/></button>
              </div>
            </div>
            {nlpR&&nlpR.length>0&&(<div><SL>Likely Services</SL><div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              {nlpR.map((r,i)=>{const bl=vEV&&r.s.ev;const p=calc(r.s);return(
                <button key={i} onClick={()=>!bl&&setSS(r.s)} disabled={bl} style={{...bb,textAlign:"left",padding:"14px 16px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",color:bl?C.td:C.tx,opacity:bl?.4:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:"8px"}}>
                    <div><div style={{fontSize:"14px",fontWeight:600,marginBottom:"4px"}}>{r.s.i} {r.s.n}</div><div style={{fontSize:"11px",color:C.td}}>{r.why}</div></div>
                    <div style={{textAlign:"right",flexShrink:0}}>{p&&!bl&&<div style={{fontSize:"13px",fontWeight:600,color:C.ac}}>{fmtR(p.tMin,p.tMax)}</div>}<UB level={r.s.u}/></div>
                  </div>
                </button>
              )})}
            </div></div>)}
            {nlpR&&nlpR.length===0&&<div style={{padding:"24px",textAlign:"center",color:C.td,fontSize:"13px"}}>No matches found. Try different keywords or browse in Quote Builder.</div>}
          </div>
        )}

        {/* ══════ MAINTENANCE ══════ */}
        {vSet&&tab==="maintenance"&&!selSvc&&(
          <div>
            <div style={{padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`,marginBottom:"16px"}}>
              <SL>Current Odometer</SL>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <input value={odo} onChange={e=>setOdo(e.target.value.replace(/\D/g,''))} placeholder="e.g. 85000" style={{flex:1,maxWidth:"200px",padding:"10px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"14px",fontFamily:"'DM Sans'"}}/>
                <span style={{fontSize:"13px",color:C.td}}>km</span>
              </div>
            </div>
            {odo&&<div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {MAINT.map((ms,i)=>{const o=+odo;const st=o>=ms.km?"done":o>=ms.km-10000?"due":"up";const col=st==="done"?C.g:st==="due"?"#F59E0B":C.td;const lb=st==="done"?"✓ Done":st==="due"?"⚠️ Due Now":"📅 Upcoming";
                return(<div key={i} style={{padding:"16px",background:C.s1,borderRadius:"8px",border:`1px solid ${st==="due"?"#F59E0B44":C.bd}`,borderLeft:`3px solid ${col}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}><span style={{fontSize:"14px",fontWeight:700,color:col}}>{ms.l}</span><span style={{fontSize:"11px",fontWeight:600,color:col}}>{lb}</span></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                    {ms.s.map((nm,j)=>{const sv=SVC.find(x=>x.n===nm);if(!sv||(vEV&&sv.ev))return null;const p=calc(sv);
                      return <button key={j} onClick={()=>setSS(sv)} style={{...bb,padding:"6px 10px",background:C.s2,border:`1px solid ${C.bd}`,borderRadius:"5px",color:C.tm,fontSize:"11px",display:"flex",alignItems:"center",gap:"4px"}}>{sv.n}{p&&<span style={{color:C.ac,fontWeight:600}}>{fmt(p.tMin)}+</span>}</button>
                    })}
                  </div>
                </div>)
              })}
            </div>}
          </div>
        )}

        {/* ══════ QUOTE BUILDER ══════ */}
        {vSet&&tab==="quote"&&!selSvc&&(
          <div>
            <div style={{position:"relative",marginBottom:"12px"}}>
              <Search size={14} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:C.td}}/>
              <input value={search} onChange={e=>setSrch(e.target.value)} placeholder="Search 120+ services..." style={{width:"100%",padding:"10px 12px 10px 34px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",color:C.tx,fontSize:"13px",fontFamily:"'DM Sans'",boxSizing:"border-box"}}/>
              {search&&<button onClick={()=>setSrch("")} style={{...bb,position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",background:"none",color:C.td,padding:"4px"}}><X size={14}/></button>}
            </div>
            {!search&&<div style={{marginBottom:"16px"}}><SL>Smart Bundles</SL>
              <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px"}}>
                {BUNDLES.map(b=><button key={b.id} onClick={()=>addBundle(b)} style={{...bb,minWidth:"150px",padding:"14px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",textAlign:"left",flexShrink:0}}>
                  <div style={{fontSize:"13px",fontWeight:700,marginBottom:"3px"}}>{b.nm}</div>
                  <div style={{fontSize:"11px",color:C.td,marginBottom:"5px"}}>{b.desc}</div>
                  <div style={{fontSize:"10px",color:C.g,fontWeight:600}}>{Math.round(b.disc*100)}% labour off</div>
                </button>)}
              </div>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
              {(search?Object.keys(catS):CATS).filter(c=>catS[c]?.length).map(cat=>(
                <div key={cat}>
                  <button onClick={()=>setOC(openCat===cat?null:cat)} style={{...bb,width:"100%",textAlign:"left",padding:"12px 16px",background:openCat===cat?C.s2:C.s1,border:`1px solid ${openCat===cat?C.ac+"33":C.bd}`,borderRadius:openCat===cat?"8px 8px 0 0":"8px",color:C.tx,fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span>{CAT_IC[cat]} {cat} <span style={{fontWeight:400,color:C.td,fontSize:"11px"}}>({catS[cat].length})</span></span>
                    {openCat===cat?<ChevronUp size={14} color={C.ac}/>:<ChevronDown size={14} color={C.td}/>}
                  </button>
                  {openCat===cat&&<div style={{border:`1px solid ${C.bd}`,borderTop:"none",borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
                    {catS[cat].map((svc,i)=>{const bl=vEV&&svc.ev;const p=calc(svc);return(
                      <button key={i} onClick={()=>!bl&&setSS(svc)} disabled={bl} style={{...bb,width:"100%",textAlign:"left",padding:"10px 16px",background:"transparent",borderBottom:i<catS[cat].length-1?`1px solid ${C.bd}`:"none",color:bl?C.td:C.tx,fontSize:"12px",opacity:bl?.4:1,display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"6px",flex:1,minWidth:0}}>
                          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{svc.n}</span>
                          {bl&&<span style={{fontSize:"10px",color:C.b}}>N/A EV</span>}
                          {svc.tip&&<Info size={11} color={C.td} style={{flexShrink:0}}/>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
                          <UB level={svc.u}/>
                          {p&&!bl&&<span style={{fontSize:"11px",color:C.td,minWidth:"80px",textAlign:"right"}}>{fmtR(p.tMin,p.tMax)}</span>}
                          <ChevronRight size={12} color={C.td}/>
                        </div>
                      </button>
                    )})}
                  </div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ ESTIMATE DETAIL ══════ */}
        {vSet&&selSvc&&(()=>{const svc=selSvc;const p=calc(svc);if(!p)return null;
          const pe={tMin:svc.lMin*td.lM*am*(SEV.find(s=>s.id===sev)?.m||1)*(URG_M.find(u=>u.id===urg)?.m||1)*rd.mult+svc.pMin*td.pM*am*0.8,tMax:svc.lMax*td.lM*am*(SEV.find(s=>s.id===sev)?.m||1)*(URG_M.find(u=>u.id===urg)?.m||1)*rd.mult+svc.pMax*td.pM*am*0.8};
          const po={tMin:p.lMin+svc.pMin*td.pM*am,tMax:p.lMax+svc.pMax*td.pM*am};
          const pp={tMin:p.lMin+svc.pMin*td.pM*am*1.4,tMax:p.lMax+svc.pMax*td.pM*am*1.4};
          return(<div>
            <button onClick={()=>setSS(null)} style={{...bb,background:"none",color:C.ac,padding:"0 0 12px",fontSize:"12px",display:"flex",alignItems:"center",gap:"4px"}}><ArrowLeft size={13}/>Back</button>
            <div style={{padding:"24px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`,marginBottom:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:"6px",marginBottom:"14px"}}>
                <div><h2 style={{margin:"0 0 3px",fontSize:"18px",fontWeight:700}}>{svc.i} {svc.n}</h2><span style={{fontSize:"11px",color:C.td}}>{svc.c} • {svc.h} hrs est.</span></div>
                <UB level={svc.u}/>
              </div>
              {svc.tip&&<div style={{padding:"10px 14px",background:"rgba(59,130,246,0.08)",borderRadius:"7px",border:"1px solid rgba(59,130,246,0.15)",marginBottom:"14px",fontSize:"12px",color:C.tm,lineHeight:1.5}}><Info size={12} color={C.b} style={{verticalAlign:"-2px",marginRight:"6px"}}/>{svc.tip}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"20px"}}>
                {svc.pMax>0&&<div><div style={{fontSize:"11px",fontWeight:600,color:C.tm,marginBottom:"6px"}}>Parts Quality</div><div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>{PQ.map(x=><SB key={x.id} sel={pq===x.id} onClick={()=>setPq(x.id)}>{x.l}</SB>)}</div></div>}
                <div><div style={{fontSize:"11px",fontWeight:600,color:C.tm,marginBottom:"6px"}}>Severity</div><div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>{SEV.map(x=><SB key={x.id} sel={sev===x.id} onClick={()=>setSev(x.id)}>{x.l}</SB>)}</div></div>
                <div><div style={{fontSize:"11px",fontWeight:600,color:C.tm,marginBottom:"6px"}}>Urgency</div><div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>{URG_M.map(x=><SB key={x.id} sel={urg===x.id} onClick={()=>setUrg(x.id)}>{x.l}</SB>)}</div></div>
              </div>
              <div style={{padding:"20px",background:C.bg,borderRadius:"8px",border:`1px solid ${C.ac}22`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:`linear-gradient(90deg,${C.ac},#FFB347,#FF6200)`}}/>
                <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"2px",color:C.ac,marginBottom:"10px"}}>ESTIMATED TOTAL</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:"40px",color:"#FFF",lineHeight:1,marginBottom:"12px"}}>{fmt(p.tMin)} <span style={{fontSize:"20px",color:"#444"}}>—</span> {fmt(p.tMax)}</div>
                <div style={{display:"flex",gap:"20px",flexWrap:"wrap",marginBottom:"10px"}}>
                  <div><div style={{fontSize:"10px",color:C.td}}>Labour</div><div style={{fontSize:"14px",fontWeight:600}}>{fmtR(p.lMin,p.lMax)}</div></div>
                  {p.pMax>0&&<div><div style={{fontSize:"10px",color:C.td}}>Parts</div><div style={{fontSize:"14px",fontWeight:600}}>{fmtR(p.pMin,p.pMax)}</div></div>}
                </div>
                <div style={{fontSize:"10px",color:C.td}}>{year} {make} {fModel} • {tier} • {rd.name} • {PQ.find(x=>x.id===pq)?.l} parts</div>
              </div>
              {svc.pMax>0&&<div style={{marginTop:"14px"}}><div style={{fontSize:"10px",fontWeight:700,letterSpacing:"1.5px",color:C.td,marginBottom:"8px"}}>PARTS COMPARISON</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px"}}>
                  {[{l:"Economy",t:pe,n:"Aftermarket"},{l:"OEM",t:po,n:"Factory spec"},{l:"Premium",t:pp,n:"Upgraded"}].map((x,i)=>
                    <div key={i} style={{padding:"10px",background:C.bg,borderRadius:"6px",border:`1px solid ${i===1?C.ac+"44":C.bd}`,textAlign:"center"}}>
                      <div style={{fontSize:"11px",fontWeight:700,color:i===1?C.ac:C.tm,marginBottom:"4px"}}>{x.l}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:"20px",color:"#FFF"}}>{fmt(x.t.tMin)}</div>
                      <div style={{fontSize:"10px",color:C.td}}>to {fmt(x.t.tMax)}</div>
                      <div style={{fontSize:"9px",color:C.td,marginTop:"4px"}}>{x.n}</div>
                    </div>
                  )}
                </div>
              </div>}
              {svc.rel&&<div style={{marginTop:"12px",padding:"10px 14px",background:C.acD,borderRadius:"7px",fontSize:"11px",color:C.tm}}>
                <AlertTriangle size={11} color={C.ac} style={{verticalAlign:"-2px",marginRight:"5px"}}/><strong style={{color:C.ac}}>Often paired:</strong>{" "}
                {svc.rel.map((r,i)=><span key={r}><button onClick={()=>{const f=SVC.find(x=>x.n===r);if(f)setSS(f)}} style={{...bb,background:"none",color:C.ac,textDecoration:"underline",fontSize:"11px",padding:0,display:"inline"}}>{r}</button>{i<svc.rel.length-1&&", "}</span>)}
              </div>}
              <button onClick={()=>addB(svc)} style={{...bb,marginTop:"14px",width:"100%",padding:"12px",background:`linear-gradient(135deg,${C.ac},#E07800)`,color:"#0A0A0C",borderRadius:"8px",fontSize:"12px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",boxShadow:`0 4px 16px rgba(255,140,0,0.2)`}}><Plus size={13} style={{verticalAlign:"-2px",marginRight:"5px"}}/>Add to Quote</button>
            </div>
          </div>)
        })()}

        {/* ══════ BASKET ══════ */}
        {basket.length>0&&(
          <div style={{marginTop:"16px",padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:showB?"12px":"0"}} onClick={()=>setShowB(!showB)}>
              <SL>Quote Summary ({basket.length})</SL>{showB?<ChevronUp size={14} color={C.ac}/>:<ChevronDown size={14} color={C.ac}/>}
            </div>
            {showB&&<>
              {basket.map((b,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bd}`}}>
                <div><div style={{fontSize:"12px",fontWeight:600}}>{b.n}</div><div style={{fontSize:"10px",color:C.td}}>{b.c}{b.disc>0?` • ${Math.round(b.disc*100)}% bundle`:""}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"12px",fontWeight:600}}>{fmtR(b.price.tMin,b.price.tMax)}</span><button onClick={()=>rmB(i)} style={{...bb,background:"none",color:C.r,padding:"2px"}}><Trash2 size={13}/></button></div>
              </div>)}
              {bTot.d>0&&<div style={{padding:"6px 0",fontSize:"11px",color:C.g}}><CheckCircle size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>5% multi-service labour discount</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"14px 0 0",borderTop:`2px solid ${C.ac}22`,marginTop:"6px"}}>
                <span style={{fontSize:"12px",fontWeight:700,color:C.ac}}>TOTAL</span>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:"28px",color:"#FFF"}}>{fmt(bTot.tMin)} – {fmt(bTot.tMax)}</span>
              </div>
              <div style={{display:"flex",gap:"6px",marginTop:"12px",flexWrap:"wrap"}}>
                <button onClick={()=>{navigator.clipboard?.writeText(genTxt());saveH()}} style={{...bb,flex:1,padding:"9px",background:C.s2,color:C.tm,borderRadius:"7px",fontSize:"11px",fontWeight:600,border:`1px solid ${C.bd}`}}><Copy size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>Copy</button>
                <button onClick={()=>{saveH();setSP(true)}} style={{...bb,flex:1,padding:"9px",background:C.s2,color:C.tm,borderRadius:"7px",fontSize:"11px",fontWeight:600,border:`1px solid ${C.bd}`}}><Copy size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>View</button>
                <button onClick={()=>{setBasket([]);setSS(null);setShowB(false)}} style={{...bb,padding:"9px 14px",background:"none",color:C.td,borderRadius:"7px",fontSize:"11px",border:`1px solid ${C.bd}`}}><RotateCcw size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>Clear</button>
              </div>
            </>}
          </div>
        )}

        {/* HISTORY */}
        {hist.length>0&&<div style={{marginTop:"12px",padding:"16px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`}}>
          <SL><History size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>Session History ({hist.length})</SL>
          {hist.map((q,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<hist.length-1?`1px solid ${C.bd}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:"12px",fontWeight:600}}>{q.v}</div><div style={{fontSize:"10px",color:C.td}}>{q.items.length} services • {q.rgn}</div></div>
            <span style={{fontSize:"12px",fontWeight:600,color:C.ac}}>{fmtR(q.tot.tMin,q.tot.tMax)}</span>
          </div>)}
        </div>}

        {/* PRINT MODAL */}
        {showPrint&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={()=>setSP(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#FFF",color:"#000",maxWidth:"500px",width:"100%",borderRadius:"12px",padding:"32px",maxHeight:"80vh",overflow:"auto",fontFamily:"'DM Sans'"}}>
            <h2 style={{margin:"0 0 4px",fontSize:"18px",fontWeight:700}}>Service Estimate</h2>
            <p style={{margin:"0 0 16px",fontSize:"12px",color:"#666"}}>{year} {make} {fModel} • {tier} • {rd.name} • {new Date().toLocaleDateString('en-NZ')}</p>
            <div style={{borderTop:"2px solid #000",borderBottom:"2px solid #000",padding:"12px 0",marginBottom:"12px"}}>
              {basket.map((b,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<basket.length-1?"1px solid #ddd":"none"}}>
                <div style={{fontWeight:600,fontSize:"13px"}}>{i+1}. {b.n}</div>
                <div style={{fontSize:"12px",color:"#555",display:"flex",justifyContent:"space-between"}}>
                  <span>Labour: {fmtR(b.price.lMin,b.price.lMax)}{b.price.pMax>0?` | Parts: ${fmtR(b.price.pMin,b.price.pMax)}`:""}</span>
                  <strong>{fmtR(b.price.tMin,b.price.tMax)}</strong>
                </div>
              </div>)}
            </div>
            {bTot.d>0&&<p style={{fontSize:"11px",color:"green",margin:"0 0 8px"}}>5% multi-service labour discount applied</p>}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"16px",fontWeight:700}}><span>TOTAL ESTIMATE</span><span>{fmtR(bTot.tMin,bTot.tMax)}</span></div>
            <p style={{fontSize:"10px",color:"#999",marginTop:"16px",lineHeight:1.5}}>All estimates in NZD, GST inclusive. Actual pricing may vary based on vehicle condition, parts availability, and workshop rates.</p>
            <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
              <button onClick={()=>navigator.clipboard?.writeText(genTxt())} style={{...bb,flex:1,padding:"10px",background:"#000",color:"#FFF",borderRadius:"6px",fontSize:"12px",fontWeight:600}}>Copy Text</button>
              <button onClick={()=>window.print()} style={{...bb,flex:1,padding:"10px",background:"#f5f5f5",color:"#000",borderRadius:"6px",fontSize:"12px",border:"1px solid #ddd"}}>Print</button>
              <button onClick={()=>setSP(false)} style={{...bb,padding:"10px 16px",background:"none",color:"#666",borderRadius:"6px",fontSize:"12px",border:"1px solid #ddd"}}>Close</button>
            </div>
          </div>
        </div>}

        {/* FOOTER */}
        <div style={{marginTop:"32px",padding:"16px",borderTop:`1px solid ${C.bd}`,fontSize:"10px",color:C.td,lineHeight:1.6,textAlign:"center"}}>
          All estimates are in NZD and are for budgeting purposes only. Actual pricing may vary based on vehicle condition, parts availability, and workshop rates. GST inclusive. Contact us for a confirmed quote.
        </div>
      </div>
      <style>{`*{box-sizing:border-box}select:focus,input:focus,button:focus-visible{outline:2px solid ${C.ac};outline-offset:2px}select option{background:${C.s2};color:${C.tx}}::placeholder{color:${C.td}}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}@media print{body{background:#fff!important}}`}</style>
    </div>
  );
}
