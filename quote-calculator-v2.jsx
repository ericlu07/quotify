import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Plus, Trash2, RotateCcw, Car, Wrench, Zap, X, ArrowLeft, ChevronUp, MessageCircle, Calendar, MapPin, Package, Info, Clock, Copy, Printer as PrinterIcon, ArrowRight, AlertTriangle, CheckCircle, History } from "lucide-react";

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const CURRENCY_SYMBOL = "$";
const CURRENT_YEAR = 2026;
const fmt = (v) => `${CURRENCY_SYMBOL}${Math.round(v / 5) * 5}`;
const fmtR = (a, b) => `${fmt(a)} – ${fmt(b)}`;

// ═══════════════════════════════════════════════════
// TRADE ME MAKES (97) — grouped by NZ prevalence
// ═══════════════════════════════════════════════════
const MAKE_GROUPS = {
  "Most Common in NZ": ["Toyota","Honda","Nissan","Mazda","Suzuki","Subaru","Mitsubishi","Ford","Holden","Hyundai","Kia"],
  "European": ["Volkswagen","BMW","Mercedes-Benz","Audi","Volvo","Peugeot","Skoda","MINI","Citroen","Renault","Fiat","Alfa Romeo","Opel","Jaguar","Land Rover","Porsche","SEAT","Cupra"],
  "Chinese & Emerging": ["BYD","MG","GWM","HAVAL","LDV","Chery","OMODA","JAECOO","BAIC","DENZA","DFSK","Dongfeng","Farizon","Foton","GAC","Geely","JAC","Leapmotor","Nio","XPENG","Zeekr","Mahindra"],
  "American": ["Chevrolet","Chrysler","Dodge","Jeep","Ram","Cadillac","Buick","GMC","Hummer","Pontiac","Tesla","Genesis"],
  "Luxury & Exotic": ["Aston Martin","Bentley","Daimler","Ferrari","Lamborghini","Lotus","Maserati","McLaren","Morgan","Rolls-Royce","Polestar","DS Automobiles","Smart","INEOS","INFINITI","KGM"],
  "Classic & Rare": ["Austin","Daewoo","Daihatsu","Humber","Lancia","Morris","Riley","Rover","Saab","Ssangyong","Studebaker","Triumph","TVR","Vauxhall","Isuzu","Iveco"],
};

// ═══════════════════════════════════════════════════
// MODEL DATA (30+ makes, comprehensive NZ market)
// ═══════════════════════════════════════════════════
const MODELS = {
  Toyota:["86/GR86","Allex","Allion","Alphard","Aqua","Aristo","Aurion","Avalon","Avensis","Axio","bB","Blade","C-HR","Caldina","Camry","Carina","Celica","Chaser","Corolla","Corona","Crown","Dyna","Echo","Estima","FJ Cruiser","Fielder","Fortuner","FunCargo","GR Yaris","Granvia","Harrier","Hiace","Highlander","Hilux","Ipsum","Ist","Kluger","Land Cruiser","Land Cruiser Prado","MR2","Mark II","Mark X","Noah","Passo","Platz","Porte","Premio","Prius","RAV4","Ractis","Raize","Rush","Sienna","Soarer","Starlet","Supra","Surf","Vanguard","Vellfire","Vitz","Voxy","Wish","Yaris","Yaris Cross","Other"],
  Honda:["Accord","Airwave","BR-V","City","Civic","Civic Type R","CR-V","CR-Z","Crossroad","Elysion","Fit/Jazz","Fit Shuttle","Freed","Grace","HR-V","Insight","Integra","Jade","Legend","Life","N-Box","N-One","Odyssey","Prelude","S2000","S660","Shuttle","S-MX","Step Wagon","Stream","Vezel","ZR-V","Other"],
  Nissan:["180SX","200SX","350Z","370Z","Ad","Almera","Altima","Ariya","Bluebird","Caravan","Cefiro","Cube","Dayz","Dualis","Elgrand","Fairlady Z","Figaro","GT-R","Juke","Kicks","Leaf","March","Maxima","Micra","Murano","Navara","Note","NV200","NV350","Pathfinder","Patrol","Primera","Pulsar","Qashqai","Serena","Silvia","Skyline","Stagea","Sunny","Sylphy","Teana","Tiida","Wingroad","X-Trail","Other"],
  Mazda:["2/Demio","3/Axela","5/Premacy","6/Atenza","BT-50","Biante","Bongo","CX-3","CX-30","CX-5","CX-60","CX-7","CX-8","CX-9","Demio","Familia","MX-5","MX-30","Premacy","RX-7","RX-8","Tribute","Other"],
  Suzuki:["Alto","Baleno","Carry","Celerio","Escudo","Every","Grand Vitara","Hustler","Ignis","Jimny","Kizashi","Liana","S-Cross","SX4","Solio","Spacia","Splash","Swift","Vitara","Wagon R","Other"],
  Subaru:["BRZ","Crosstrek","Exiga","Forester","Impreza","Legacy","Levorg","Liberty","Outback","Solterra","WRX","XV","Other"],
  Mitsubishi:["ASX","Challenger","Colt","Delica","Eclipse Cross","Galant","Grandis","L300","Lancer","Mirage","Outlander","Outlander PHEV","Pajero","Pajero IO","RVR","Triton","Other"],
  Ford:["Ecosport","Endura","Escape","Everest","Explorer","F-150","Falcon","Fiesta","Focus","Kuga","Laser","Mondeo","Mustang","Puma","Ranger","Ranger Raptor","Territory","Transit","Transit Custom","Other"],
  Holden:["Astra","Barina","Captiva","Colorado","Commodore","Cruze","Equinox","Jackaroo","Rodeo","Trailblazer","Trax","Other"],
  Hyundai:["Accent","Elantra","Getz","i20","i30","i40","Ioniq","Ioniq 5","Ioniq 6","ix35","Kona","Kona Electric","Palisade","Santa Fe","Sonata","Staria","Tucson","Veloster","Venue","Other"],
  Kia:["Carnival","Cerato","EV6","EV9","Niro","Optima","Picanto","Rio","Seltos","Sorento","Soul","Sportage","Stinger","Stonic","Other"],
  Volkswagen:["Amarok","Arteon","Beetle","Caddy","Golf","Golf GTI","Golf R","ID.4","ID.5","Jetta","Multivan","Passat","Polo","Polo GTI","T-Cross","T-Roc","Tiguan","Touareg","Transporter","Other"],
  BMW:["1 Series","2 Series","3 Series","4 Series","5 Series","7 Series","i3","i4","i5","iX","iX3","M2","M3","M4","M5","X1","X2","X3","X4","X5","X6","X7","Z4","Other"],
  "Mercedes-Benz":["A-Class","AMG GT","B-Class","C-Class","CLA","CLS","E-Class","EQA","EQB","EQC","G-Class","GLA","GLB","GLC","GLE","GLS","S-Class","SL","SLK","Sprinter","V-Class","Vito","Other"],
  Audi:["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q5","Q7","Q8","RS3","RS4","RS5","RS6","S3","S4","TT","e-tron","Other"],
  Lexus:["CT","ES","GS","IS","LC","LS","LX","NX","RC","RX","UX","Other"],
  Tesla:["Model 3","Model S","Model X","Model Y","Other"],
  BYD:["Atto 3","Dolphin","Seal","Shark","Tang","Other"],
  Isuzu:["D-Max","MU-X","Other"],
  MG:["3","GS","HS","MG4","ZS","ZS EV","Other"],
  Volvo:["C30","EX30","S40","S60","S90","V40","V60","V70","V90","XC40","XC60","XC90","Other"],
  Peugeot:["2008","206","207","208","3008","307","308","4008","5008","508","Other"],
  Skoda:["Enyaq","Fabia","Kamiq","Karoq","Kodiaq","Octavia","Rapid","Scala","Superb","Other"],
  Jeep:["Cherokee","Compass","Gladiator","Grand Cherokee","Renegade","Wrangler","Other"],
  "Land Rover":["Defender","Discovery","Discovery Sport","Freelander","Range Rover","Range Rover Evoque","Range Rover Sport","Range Rover Velar","Other"],
  Porsche:["718 Boxster","718 Cayman","911","Cayenne","Macan","Panamera","Taycan","Other"],
  MINI:["Clubman","Cooper","Countryman","Hatch","Other"],
  Daihatsu:["Boon","Cast","Charade","Copen","Cuore","Hijet","Mira","Move","Rocky","Sirion","Tanto","Terios","Other"],
  LDV:["D90","Deliver 9","G10","T60","Other"],
  GWM:["Cannon","Ora","Tank 300","Other"],
  HAVAL:["H2","H6","H9","Jolion","Other"],
  Ssangyong:["Actyon","Korando","Musso","Rexton","Tivoli","Torres","Other"],
  Jaguar:["E-Pace","F-Pace","F-Type","I-Pace","XE","XF","XJ","Other"],
  INFINITI:["Q50","Q60","QX50","QX70","Other"],
  Citroen:["Berlingo","C3","C4","C5","DS3","DS4","Other"],
  Renault:["Captur","Clio","Kadjar","Koleos","Megane","Scenic","Zoe","Other"],
  Fiat:["500","500X","Ducato","Panda","Punto","Other"],
};

// ═══════════════════════════════════════════════════
// VEHICLE CLASSIFICATION
// ═══════════════════════════════════════════════════
const TIERS = {
  Economy:{lM:1,pM:1},Standard:{lM:1,pM:1.1},"Truck/HD":{lM:1.15,pM:1.2},Luxury:{lM:1.3,pM:1.5},"Euro Performance":{lM:1.5,pM:1.8},"Electric/Hybrid":{lM:1.2,pM:1.4}
};
const TIER_COLORS = {Economy:"#22C55E",Standard:"#3B82F6","Truck/HD":"#F59E0B",Luxury:"#A855F7","Euro Performance":"#EF4444","Electric/Hybrid":"#06B6D4"};

const LUXURY_MAKES = new Set(["BMW","Mercedes-Benz","Audi","Lexus","Volvo","Jaguar","Land Rover","Genesis","INFINITI"]);
const PERF_MAKES = new Set(["Porsche","Ferrari","Lamborghini","McLaren","Maserati","Lotus","Aston Martin","Bentley","Rolls-Royce"]);
const EV_MAKES = new Set(["Tesla","BYD","Polestar","Nio","XPENG","Zeekr","Leapmotor"]);
const EV_MODELS = new Set(["Leaf","Ioniq 5","Ioniq 6","EV6","EV9","Kona Electric","ZS EV","Solterra","MX-30","e-tron","ID.4","ID.5","i3","i4","i5","iX","iX3","EQA","EQB","EQC","I-Pace","Taycan","Atto 3","Dolphin","Seal","Shark","Enyaq","e:Ny1","Zoe","MG4","EX30","Ora","Aqua","Prius","Outlander PHEV"]);
const TRUCK_MODELS = new Set(["Hilux","Ranger","Ranger Raptor","Navara","Triton","D-Max","Colorado","BT-50","Amarok","Land Cruiser","Land Cruiser Prado","Pajero","Everest","Pathfinder","MU-X","Patrol","F-150","Gladiator","Wildtrak","Cannon","T60","Musso"]);
const ECO_MODELS = new Set(["Aqua","Fit/Jazz","Vitz","March","Swift","Alto","Celerio","Ignis","Mirage","Picanto","i20","Barina","Note","Life","Mira","Move","Tanto","Cuore","Passo","Demio"]);
const PERF_MODELS = new Set(["M2","M3","M4","M5","AMG GT","RS3","RS4","RS5","RS6","Supra","WRX","GR Yaris","Civic Type R","GT-R","911","Skyline","Type R","STI","Stinger"]);

function classifyVehicle(make, model) {
  if (EV_MAKES.has(make) || EV_MODELS.has(model)) return "Electric/Hybrid";
  if (PERF_MAKES.has(make) || PERF_MODELS.has(model)) return "Euro Performance";
  if (LUXURY_MAKES.has(make)) return "Luxury";
  if (TRUCK_MODELS.has(model)) return "Truck/HD";
  if (ECO_MODELS.has(model)) return "Economy";
  return "Standard";
}
function ageMult(y){const a=CURRENT_YEAR-y;if(a<=7)return 1;if(a<=12)return 1.05;if(a<=18)return 1.1;if(a<=25)return 1.15;return 1.25}
const isEV=(make,model)=>EV_MAKES.has(make)||EV_MODELS.has(model);

// ═══════════════════════════════════════════════════
// REGIONS
// ═══════════════════════════════════════════════════
const REGIONS = [
  {id:"auckland",name:"Auckland",mult:1.1},
  {id:"wellington",name:"Wellington",mult:1.05},
  {id:"christchurch",name:"Christchurch",mult:1.0},
  {id:"hamilton",name:"Hamilton / Tauranga",mult:0.95},
  {id:"dunedin",name:"Dunedin / Queenstown",mult:1.0},
  {id:"regional",name:"Regional / Rural",mult:0.9},
];

// ═══════════════════════════════════════════════════
// SERVICE CATALOGUE (NZD, 120+ services)
// ═══════════════════════════════════════════════════
const SERVICES = [
  // ENGINE
  {cat:"Engine",icon:"🔧",name:"Oil & Filter Change",lMin:50,lMax:80,pMin:40,pMax:110,h:"0.5–1",ev:true,urg:"green",tip:"Regular oil changes are the single most important thing you can do to extend your engine's life. Every 10,000km or 6 months.",related:["Engine Air Filter Replacement"]},
  {cat:"Engine",icon:"🔧",name:"Spark Plug Replacement (4-cyl)",lMin:95,lMax:190,pMin:50,pMax:130,h:"1–2",ev:true,urg:"yellow",tip:"Worn spark plugs reduce fuel economy and can cause misfires. Most need replacing every 40,000–60,000km."},
  {cat:"Engine",icon:"🔧",name:"Spark Plug Replacement (6/8-cyl)",lMin:190,lMax:400,pMin:95,pMax:260,h:"2–4",ev:true,urg:"yellow"},
  {cat:"Engine",icon:"🔧",name:"Timing Belt/Chain Replacement",lMin:480,lMax:960,pMin:240,pMax:640,h:"3–8",urg:"orange",tip:"If this breaks while driving, it can destroy your engine. Replace every 80,000–100,000km. Get the water pump done at the same time — saves labour.",related:["Water Pump Replacement","Serpentine/Drive Belt Replacement"]},
  {cat:"Engine",icon:"🔧",name:"Head Gasket Replacement",lMin:1280,lMax:2400,pMin:320,pMax:800,h:"8–16",urg:"red",tip:"A blown head gasket can cause catastrophic engine damage. White smoke from exhaust and overheating are key signs."},
  {cat:"Engine",icon:"🔧",name:"Engine Mount Replacement",lMin:320,lMax:640,pMin:160,pMax:480,h:"2–4",urg:"yellow"},
  {cat:"Engine",icon:"🔧",name:"Valve Cover Gasket",lMin:160,lMax:400,pMin:50,pMax:130,h:"1–3",urg:"yellow"},
  {cat:"Engine",icon:"🔧",name:"Intake Manifold Gasket",lMin:320,lMax:640,pMin:80,pMax:240,h:"2–5",urg:"orange"},
  {cat:"Engine",icon:"🔧",name:"Turbocharger Repair/Replace",lMin:800,lMax:1920,pMin:640,pMax:3200,h:"4–8",urg:"red"},
  {cat:"Engine",icon:"🔧",name:"Engine Rebuild (estimate)",lMin:3200,lMax:6400,pMin:2400,pMax:6400,h:"20–40",urg:"red"},
  {cat:"Engine",icon:"🔧",name:"PCV Valve Replacement",lMin:65,lMax:130,pMin:16,pMax:50,h:"0.5–1",urg:"green"},
  {cat:"Engine",icon:"🔧",name:"Throttle Body Service",lMin:160,lMax:320,pMin:80,pMax:320,h:"1–2",urg:"yellow"},
  {cat:"Engine",icon:"🔧",name:"Engine Air Filter Replacement",lMin:30,lMax:65,pMin:25,pMax:65,h:"0.25–0.5",urg:"green",tip:"A clogged air filter reduces performance and fuel economy. Cheap and easy to replace every 20,000km."},
  {cat:"Engine",icon:"🔧",name:"Compression Test / Leak-Down",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",urg:"yellow"},
  {cat:"Engine",icon:"🔧",name:"Oil Leak Diagnosis & Repair",lMin:240,lMax:800,pMin:50,pMax:320,h:"2–6",urg:"orange"},

  // TRANSMISSION
  {cat:"Transmission",icon:"⚙️",name:"Transmission Fluid Change",lMin:130,lMax:240,pMin:65,pMax:160,h:"1–2",urg:"green",tip:"Transmission fluid breaks down over time. Changing it every 60,000km helps prevent costly transmission problems."},
  {cat:"Transmission",icon:"⚙️",name:"Transmission Flush (Full)",lMin:190,lMax:320,pMin:130,pMax:240,h:"1.5–2.5",urg:"green"},
  {cat:"Transmission",icon:"⚙️",name:"Clutch Replacement (Manual)",lMin:640,lMax:1280,pMin:480,pMax:1120,h:"4–8",urg:"orange",tip:"A slipping clutch gets worse over time and can leave you stranded. If you feel it slipping, book it in soon."},
  {cat:"Transmission",icon:"⚙️",name:"Transmission Rebuild (estimate)",lMin:2400,lMax:4800,pMin:1280,pMax:4000,h:"15–30",urg:"red"},
  {cat:"Transmission",icon:"⚙️",name:"CV Axle/Half Shaft Replacement",lMin:240,lMax:480,pMin:130,pMax:400,h:"1.5–3",urg:"orange"},
  {cat:"Transmission",icon:"⚙️",name:"Differential Service",lMin:130,lMax:240,pMin:50,pMax:130,h:"1–2",urg:"green"},
  {cat:"Transmission",icon:"⚙️",name:"U-Joint Replacement",lMin:160,lMax:320,pMin:50,pMax:130,h:"1–2",urg:"orange"},
  {cat:"Transmission",icon:"⚙️",name:"Transfer Case Service (AWD/4WD)",lMin:160,lMax:320,pMin:65,pMax:160,h:"1–2",urg:"green"},
  {cat:"Transmission",icon:"⚙️",name:"Torque Converter Replacement",lMin:800,lMax:1600,pMin:320,pMax:960,h:"5–10",urg:"red"},
  {cat:"Transmission",icon:"⚙️",name:"Flywheel Resurfacing/Replacement",lMin:320,lMax:640,pMin:160,pMax:560,h:"3–5",urg:"orange"},
  {cat:"Transmission",icon:"⚙️",name:"Transmission Mount Replacement",lMin:240,lMax:400,pMin:80,pMax:240,h:"1.5–3",urg:"yellow"},

  // BRAKES
  {cat:"Brakes",icon:"🛑",name:"Brake Pad Replacement (per axle)",lMin:130,lMax:240,pMin:65,pMax:190,h:"1–2",urg:"orange",tip:"Brake pads typically last 30,000–70,000km. Grinding = pads are gone and you're damaging rotors, turning a $200 job into $800+."},
  {cat:"Brakes",icon:"🛑",name:"Brake Pad + Rotor Replacement (per axle)",lMin:240,lMax:480,pMin:190,pMax:560,h:"2–3",urg:"orange"},
  {cat:"Brakes",icon:"🛑",name:"Brake Caliper Replacement (each)",lMin:160,lMax:320,pMin:130,pMax:400,h:"1–2",urg:"red"},
  {cat:"Brakes",icon:"🛑",name:"Brake Line Replacement",lMin:160,lMax:400,pMin:50,pMax:130,h:"1–3",urg:"red"},
  {cat:"Brakes",icon:"🛑",name:"Brake Fluid Flush",lMin:95,lMax:160,pMin:30,pMax:65,h:"0.5–1",urg:"green",tip:"Brake fluid absorbs moisture over time, reducing braking performance. Flush every 2 years or 40,000km."},
  {cat:"Brakes",icon:"🛑",name:"Brake Master Cylinder",lMin:320,lMax:560,pMin:160,pMax:480,h:"2–4",urg:"red"},
  {cat:"Brakes",icon:"🛑",name:"ABS Module Repair/Replace",lMin:480,lMax:960,pMin:320,pMax:1280,h:"2–4",urg:"orange"},
  {cat:"Brakes",icon:"🛑",name:"Parking Brake Repair",lMin:160,lMax:320,pMin:50,pMax:160,h:"1–2",urg:"yellow"},
  {cat:"Brakes",icon:"🛑",name:"Brake Booster Replacement",lMin:320,lMax:640,pMin:240,pMax:560,h:"2–4",urg:"red"},

  // SUSPENSION
  {cat:"Suspension",icon:"🏎️",name:"Shock/Strut Replacement (pair)",lMin:320,lMax:640,pMin:240,pMax:800,h:"2–4",urg:"yellow"},
  {cat:"Suspension",icon:"🏎️",name:"Full Strut Assembly (pair)",lMin:400,lMax:720,pMin:320,pMax:960,h:"2–4",urg:"yellow"},
  {cat:"Suspension",icon:"🏎️",name:"Ball Joint Replacement (each)",lMin:160,lMax:400,pMin:65,pMax:240,h:"1–3",urg:"orange"},
  {cat:"Suspension",icon:"🏎️",name:"Tie Rod End Replacement (each)",lMin:130,lMax:240,pMin:50,pMax:160,h:"1–2",urg:"orange",related:["Wheel Alignment (4-wheel)"]},
  {cat:"Suspension",icon:"🏎️",name:"Control Arm Replacement",lMin:240,lMax:480,pMin:130,pMax:400,h:"2–3",urg:"yellow"},
  {cat:"Suspension",icon:"🏎️",name:"Wheel Bearing Replacement",lMin:240,lMax:560,pMin:95,pMax:320,h:"1.5–3",urg:"orange",tip:"A humming or grinding noise that changes with speed is often a wheel bearing. Don't ignore it — failure can cause a wheel to seize."},
  {cat:"Suspension",icon:"🏎️",name:"Power Steering Pump",lMin:320,lMax:640,pMin:160,pMax:480,h:"2–4",urg:"orange"},
  {cat:"Suspension",icon:"🏎️",name:"Power Steering Rack",lMin:640,lMax:1280,pMin:320,pMax:960,h:"3–6",urg:"orange"},
  {cat:"Suspension",icon:"🏎️",name:"Power Steering Fluid Flush",lMin:95,lMax:160,pMin:30,pMax:65,h:"0.5–1",urg:"green"},
  {cat:"Suspension",icon:"🏎️",name:"Sway Bar Link Replacement (pair)",lMin:130,lMax:240,pMin:65,pMax:160,h:"1–2",urg:"yellow"},
  {cat:"Suspension",icon:"🏎️",name:"Wheel Alignment (2-wheel)",lMin:80,lMax:130,pMin:0,pMax:0,h:"0.5–1",urg:"green"},
  {cat:"Suspension",icon:"🏎️",name:"Wheel Alignment (4-wheel)",lMin:130,lMax:190,pMin:0,pMax:0,h:"1–1.5",urg:"green",tip:"Misalignment causes uneven tyre wear and pulling. Get it checked after any suspension work or hitting a pothole hard."},
  {cat:"Suspension",icon:"🏎️",name:"Coil Spring Replacement (pair)",lMin:320,lMax:640,pMin:160,pMax:480,h:"2–4",urg:"yellow"},

  // ELECTRICAL
  {cat:"Electrical",icon:"⚡",name:"Battery Replacement",lMin:50,lMax:95,pMin:130,pMax:400,h:"0.5–1",urg:"orange",tip:"NZ batteries typically last 3–5 years. If your car is slow to start in winter, get it tested before it leaves you stranded."},
  {cat:"Electrical",icon:"⚡",name:"Alternator Replacement",lMin:240,lMax:480,pMin:240,pMax:640,h:"1.5–3",urg:"red"},
  {cat:"Electrical",icon:"⚡",name:"Starter Motor Replacement",lMin:240,lMax:480,pMin:160,pMax:560,h:"1.5–3",urg:"red"},
  {cat:"Electrical",icon:"⚡",name:"Wiring Harness Repair",lMin:240,lMax:800,pMin:80,pMax:480,h:"2–6",urg:"orange"},
  {cat:"Electrical",icon:"⚡",name:"Check Engine Light Diagnostic",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",urg:"yellow",tip:"The check engine light can mean many things. Getting a proper diagnostic saves you from guessing and replacing the wrong parts."},
  {cat:"Electrical",icon:"⚡",name:"General Electrical Diagnostic",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",urg:"yellow"},
  {cat:"Electrical",icon:"⚡",name:"Headlight Assembly Replacement",lMin:130,lMax:320,pMin:160,pMax:800,h:"1–2",urg:"yellow"},
  {cat:"Electrical",icon:"⚡",name:"Window Motor/Regulator",lMin:160,lMax:400,pMin:130,pMax:400,h:"1–2.5",urg:"yellow"},
  {cat:"Electrical",icon:"⚡",name:"Door Lock Actuator",lMin:160,lMax:320,pMin:80,pMax:240,h:"1–2",urg:"yellow"},

  // COOLING
  {cat:"Cooling",icon:"🌡️",name:"Radiator Replacement",lMin:320,lMax:640,pMin:240,pMax:640,h:"2–4",urg:"red"},
  {cat:"Cooling",icon:"🌡️",name:"Radiator Hose Replacement",lMin:95,lMax:190,pMin:50,pMax:130,h:"0.5–1.5",urg:"orange"},
  {cat:"Cooling",icon:"🌡️",name:"Water Pump Replacement",lMin:320,lMax:640,pMin:130,pMax:400,h:"2–5",urg:"orange",tip:"Water pumps often fail around the same time as timing belts. Replacing both together saves significant labour cost."},
  {cat:"Cooling",icon:"🌡️",name:"Thermostat Replacement",lMin:130,lMax:320,pMin:30,pMax:95,h:"1–2",urg:"orange"},
  {cat:"Cooling",icon:"🌡️",name:"Coolant Flush",lMin:95,lMax:160,pMin:30,pMax:65,h:"0.5–1",urg:"green"},
  {cat:"Cooling",icon:"🌡️",name:"Heater Core Replacement",lMin:800,lMax:1920,pMin:160,pMax:400,h:"6–12",urg:"yellow"},
  {cat:"Cooling",icon:"🌡️",name:"Radiator Fan Motor",lMin:240,lMax:480,pMin:160,pMax:480,h:"1.5–3",urg:"orange"},
  {cat:"Cooling",icon:"🌡️",name:"Coolant Leak Diagnosis & Repair",lMin:160,lMax:480,pMin:50,pMax:240,h:"1–3",urg:"orange"},

  // EXHAUST
  {cat:"Exhaust",icon:"💨",name:"Catalytic Converter Replacement",lMin:320,lMax:800,pMin:480,pMax:3200,h:"2–4",ev:true,urg:"orange"},
  {cat:"Exhaust",icon:"💨",name:"Muffler Replacement",lMin:130,lMax:320,pMin:95,pMax:400,h:"1–2",ev:true,urg:"yellow"},
  {cat:"Exhaust",icon:"💨",name:"Exhaust Pipe Repair/Replace",lMin:160,lMax:400,pMin:80,pMax:320,h:"1–3",ev:true,urg:"yellow"},
  {cat:"Exhaust",icon:"💨",name:"Exhaust Manifold Repair",lMin:320,lMax:640,pMin:160,pMax:560,h:"2–5",ev:true,urg:"orange"},
  {cat:"Exhaust",icon:"💨",name:"O2 Sensor Replacement",lMin:130,lMax:240,pMin:80,pMax:320,h:"0.5–1.5",ev:true,urg:"yellow"},
  {cat:"Exhaust",icon:"💨",name:"EGR Valve Replacement",lMin:160,lMax:400,pMin:80,pMax:320,h:"1–3",ev:true,urg:"yellow"},
  {cat:"Exhaust",icon:"💨",name:"DPF Cleaning/Replacement (Diesel)",lMin:320,lMax:800,pMin:480,pMax:4000,h:"2–4",urg:"orange"},

  // FUEL
  {cat:"Fuel System",icon:"⛽",name:"Fuel Pump Replacement",lMin:320,lMax:640,pMin:240,pMax:800,h:"2–4",ev:true,urg:"red"},
  {cat:"Fuel System",icon:"⛽",name:"Fuel Injector Replacement (each)",lMin:130,lMax:240,pMin:80,pMax:320,h:"1–2",ev:true,urg:"yellow"},
  {cat:"Fuel System",icon:"⛽",name:"Fuel Injector Cleaning",lMin:130,lMax:240,pMin:50,pMax:95,h:"1–1.5",ev:true,urg:"green"},
  {cat:"Fuel System",icon:"⛽",name:"Fuel Filter Replacement",lMin:80,lMax:160,pMin:25,pMax:80,h:"0.5–1",ev:true,urg:"green"},
  {cat:"Fuel System",icon:"⛽",name:"Mass Air Flow Sensor",lMin:95,lMax:190,pMin:80,pMax:320,h:"0.5–1",urg:"yellow"},
  {cat:"Fuel System",icon:"⛽",name:"Throttle Position Sensor",lMin:130,lMax:240,pMin:65,pMax:190,h:"0.5–1.5",urg:"yellow"},

  // TYRES
  {cat:"Tyres",icon:"🛞",name:"Tyre Rotation",lMin:30,lMax:65,pMin:0,pMax:0,h:"0.5",urg:"green"},
  {cat:"Tyres",icon:"🛞",name:"Tyre Balance (per tyre)",lMin:25,lMax:40,pMin:0,pMax:0,h:"0.25–0.5",urg:"green"},
  {cat:"Tyres",icon:"🛞",name:"Tyre Repair (patch/plug)",lMin:30,lMax:65,pMin:8,pMax:25,h:"0.5",urg:"orange"},
  {cat:"Tyres",icon:"🛞",name:"Tyre Mount & Balance (per tyre)",lMin:40,lMax:70,pMin:0,pMax:0,h:"0.5",urg:"green"},
  {cat:"Tyres",icon:"🛞",name:"TPMS Sensor Replacement (each)",lMin:65,lMax:130,pMin:50,pMax:130,h:"0.5–1",urg:"yellow"},
  {cat:"Tyres",icon:"🛞",name:"Rim Repair/Straightening",lMin:120,lMax:240,pMin:0,pMax:0,h:"1–2",urg:"yellow"},

  // HVAC
  {cat:"HVAC",icon:"❄️",name:"A/C Recharge (Refrigerant)",lMin:160,lMax:290,pMin:50,pMax:95,h:"0.5–1",urg:"green",tip:"If your A/C isn't as cold as it used to be, it likely needs a recharge. Quick and affordable fix."},
  {cat:"HVAC",icon:"❄️",name:"A/C Compressor Replacement",lMin:480,lMax:960,pMin:320,pMax:960,h:"3–5",urg:"orange"},
  {cat:"HVAC",icon:"❄️",name:"A/C Condenser Replacement",lMin:320,lMax:640,pMin:240,pMax:640,h:"2–4",urg:"orange"},
  {cat:"HVAC",icon:"❄️",name:"A/C Evaporator Replacement",lMin:800,lMax:1600,pMin:240,pMax:560,h:"5–10",urg:"yellow"},
  {cat:"HVAC",icon:"❄️",name:"Blower Motor Replacement",lMin:160,lMax:400,pMin:80,pMax:320,h:"1–3",urg:"yellow"},
  {cat:"HVAC",icon:"❄️",name:"Cabin Air Filter",lMin:30,lMax:65,pMin:25,pMax:65,h:"0.25–0.5",urg:"green"},

  // MISC
  {cat:"Misc",icon:"🔩",name:"Serpentine/Drive Belt Replacement",lMin:95,lMax:190,pMin:40,pMax:95,h:"0.5–1.5",urg:"yellow",tip:"A squealing noise on startup is usually a worn belt. Replace it before it snaps and disables your power steering and alternator."},
  {cat:"Misc",icon:"🔩",name:"Windscreen Wiper Motor",lMin:160,lMax:320,pMin:95,pMax:240,h:"1–2",urg:"yellow"},
  {cat:"Misc",icon:"🔩",name:"Side Mirror Replacement",lMin:130,lMax:320,pMin:80,pMax:480,h:"0.5–1.5",urg:"yellow"},
  {cat:"Misc",icon:"🔩",name:"Boot/Hatch Struts",lMin:95,lMax:190,pMin:50,pMax:130,h:"0.5–1",urg:"green"},

  // WOF & INSPECTIONS
  {cat:"WOF & Inspections",icon:"📋",name:"Warrant of Fitness (WOF)",lMin:50,lMax:70,pMin:0,pMax:0,h:"0.5",urg:"green",tip:"In NZ, vehicles must pass a WOF. New vehicles at 3 years, then annually. Getting a pre-WOF check can save a failed inspection and retest fee."},
  {cat:"WOF & Inspections",icon:"📋",name:"Pre-Purchase Inspection",lMin:160,lMax:320,pMin:0,pMax:0,h:"1–2",urg:"green",tip:"Always get a pre-purchase inspection before buying a used car. It's the best $200 you'll spend — it can save you thousands."},
  {cat:"WOF & Inspections",icon:"📋",name:"General Multi-Point Inspection",lMin:80,lMax:160,pMin:0,pMax:0,h:"0.5–1",urg:"green"},
  {cat:"WOF & Inspections",icon:"📋",name:"Noise/Vibration Diagnosis",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",urg:"yellow"},
  {cat:"WOF & Inspections",icon:"📋",name:"Fluid Leak Diagnosis",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",urg:"yellow"},
  {cat:"WOF & Inspections",icon:"📋",name:"Drivability Diagnosis",lMin:130,lMax:240,pMin:0,pMax:0,h:"1–2",urg:"yellow"},
];

const CATEGORIES = [...new Set(SERVICES.map(s=>s.cat))];
const CAT_ICONS = {};
SERVICES.forEach(s=>{CAT_ICONS[s.cat]=s.icon});

// ═══════════════════════════════════════════════════
// NLP SYMPTOM MATCHING
// ═══════════════════════════════════════════════════
const SYMPTOM_RULES = [
  {kw:["grinding","brake"],svcs:["Brake Pad Replacement (per axle)","Brake Pad + Rotor Replacement (per axle)"],why:"Grinding when braking usually means brake pads are worn through"},
  {kw:["squeal","brake"],svcs:["Brake Pad Replacement (per axle)"],why:"Squealing brakes typically indicate pads are wearing thin"},
  {kw:["shake","vibrat","speed"],svcs:["Tyre Balance (per tyre)","CV Axle/Half Shaft Replacement","Wheel Alignment (4-wheel)","Engine Mount Replacement"],why:"Vibration at speed can be tyre balance, CV joints, or mounts"},
  {kw:["won't start","click","no start","doesn't start","wont start"],svcs:["Battery Replacement","Starter Motor Replacement","Alternator Replacement"],why:"Clicking/no start is usually battery, starter, or alternator"},
  {kw:["leak","green","coolant"],svcs:["Coolant Leak Diagnosis & Repair","Radiator Hose Replacement","Radiator Replacement","Thermostat Replacement"],why:"Green fluid = coolant leak, needs attention before overheating"},
  {kw:["leak","oil","brown"],svcs:["Oil Leak Diagnosis & Repair","Valve Cover Gasket"],why:"Brown/dark fluid under the car suggests an oil leak"},
  {kw:["leak","red","pink","transmission"],svcs:["Transmission Fluid Change"],why:"Red/pink fluid is typically transmission or power steering fluid"},
  {kw:["smoke","white","exhaust"],svcs:["Head Gasket Replacement","Coolant Leak Diagnosis & Repair"],why:"White exhaust smoke often means coolant is entering the combustion chamber"},
  {kw:["smoke","blue"],svcs:["Valve Cover Gasket","Turbocharger Repair/Replace"],why:"Blue smoke means oil is burning — could be valve seals or turbo"},
  {kw:["smoke","black"],svcs:["Engine Air Filter Replacement","Fuel Injector Cleaning","Mass Air Flow Sensor"],why:"Black smoke suggests too much fuel — air filter, injectors, or MAF sensor"},
  {kw:["overheat","hot","temperature"],svcs:["Thermostat Replacement","Water Pump Replacement","Radiator Replacement","Coolant Flush"],why:"Overheating needs urgent attention to prevent engine damage"},
  {kw:["engine light","check engine","cel"],svcs:["Check Engine Light Diagnostic"],why:"A diagnostic scan will identify the exact fault code"},
  {kw:["rough","idle","misfire"],svcs:["Spark Plug Replacement (4-cyl)","Throttle Body Service","Fuel Injector Cleaning"],why:"Rough idle can be spark plugs, throttle body, or fuel delivery"},
  {kw:["pull","left","right","drift"],svcs:["Wheel Alignment (4-wheel)","Tie Rod End Replacement (each)"],why:"Pulling to one side is usually alignment or worn tie rods"},
  {kw:["squeal","belt","screech"],svcs:["Serpentine/Drive Belt Replacement"],why:"Belt squeal on startup means the belt is worn or loose"},
  {kw:["clunk","bump","knock","rattle"],svcs:["Sway Bar Link Replacement (pair)","Ball Joint Replacement (each)","Shock/Strut Replacement (pair)"],why:"Clunking over bumps points to worn suspension components"},
  {kw:["ac","air con","warm","not cold","hot air"],svcs:["A/C Recharge (Refrigerant)","A/C Compressor Replacement"],why:"Warm A/C is usually low refrigerant or a compressor issue"},
  {kw:["wof","warrant","fail"],svcs:["Warrant of Fitness (WOF)","General Multi-Point Inspection"],why:"Get a pre-WOF check to identify issues before your inspection"},
  {kw:["stall","die","cut out"],svcs:["Fuel Pump Replacement","Fuel Filter Replacement","Throttle Position Sensor"],why:"Stalling can be fuel delivery, sensors, or electrical"},
  {kw:["slip","gear","jerk","shift"],svcs:["Transmission Fluid Change","Clutch Replacement (Manual)","Transmission Rebuild (estimate)"],why:"Transmission slipping/jerking needs attention before it fails completely"},
  {kw:["steering","heavy","stiff","hard to turn"],svcs:["Power Steering Pump","Power Steering Fluid Flush","Power Steering Rack"],why:"Heavy steering is usually power steering pump or fluid related"},
  {kw:["battery","dead","flat","charge"],svcs:["Battery Replacement","Alternator Replacement"],why:"A flat battery could be the battery itself or a failing alternator not charging it"},
  {kw:["fuel","economy","consumption","petrol"],svcs:["Engine Air Filter Replacement","Spark Plug Replacement (4-cyl)","Fuel Injector Cleaning","O2 Sensor Replacement"],why:"Poor fuel economy has several possible causes"},
  {kw:["noise","wheel","humm","hum"],svcs:["Wheel Bearing Replacement"],why:"A humming noise that changes with speed is typically a wheel bearing"},
];

function matchSymptoms(input) {
  const lower = input.toLowerCase();
  const results = [];
  const seen = new Set();
  SYMPTOM_RULES.forEach(rule => {
    const match = rule.kw.some(kw => lower.includes(kw));
    if (match) {
      rule.svcs.forEach(svcName => {
        if (!seen.has(svcName)) {
          const svc = SERVICES.find(s => s.name === svcName);
          if (svc) { results.push({ svc, why: rule.why }); seen.add(svcName); }
        }
      });
    }
  });
  return results;
}

// ═══════════════════════════════════════════════════
// MAINTENANCE INTERVALS
// ═══════════════════════════════════════════════════
const MAINT_SCHEDULE = [
  {km:10000,label:"10,000 km",svcs:["Oil & Filter Change","Tyre Rotation"]},
  {km:20000,label:"20,000 km",svcs:["Oil & Filter Change","Tyre Rotation","Cabin Air Filter","Brake Pad Replacement (per axle)"]},
  {km:40000,label:"40,000 km",svcs:["Oil & Filter Change","Engine Air Filter Replacement","Spark Plug Replacement (4-cyl)","Fuel Filter Replacement"]},
  {km:60000,label:"60,000 km",svcs:["Oil & Filter Change","Transmission Fluid Change","Coolant Flush","Brake Fluid Flush"]},
  {km:80000,label:"80,000 km",svcs:["Oil & Filter Change","Spark Plug Replacement (4-cyl)","Serpentine/Drive Belt Replacement"]},
  {km:100000,label:"100,000 km ★",svcs:["Timing Belt/Chain Replacement","Water Pump Replacement","Brake Pad + Rotor Replacement (per axle)","Coolant Flush","Spark Plug Replacement (4-cyl)"]},
  {km:150000,label:"150,000 km",svcs:["CV Axle/Half Shaft Replacement","Wheel Bearing Replacement","Clutch Replacement (Manual)","Shock/Strut Replacement (pair)"]},
  {km:200000,label:"200,000 km+",svcs:["General Multi-Point Inspection","Engine Rebuild (estimate)","Transmission Rebuild (estimate)"]},
];

// ═══════════════════════════════════════════════════
// SMART BUNDLES
// ═══════════════════════════════════════════════════
const BUNDLES = [
  {id:"wof",name:"🛡️ WOF Prep",desc:"Pass your WOF first time",svcs:["Warrant of Fitness (WOF)","General Multi-Point Inspection","Brake Pad Replacement (per axle)"],discount:0.10},
  {id:"100k",name:"🔧 100K Major Service",desc:"The big one — protect your engine",svcs:["Timing Belt/Chain Replacement","Water Pump Replacement","Coolant Flush","Spark Plug Replacement (4-cyl)","Serpentine/Drive Belt Replacement"],discount:0.08},
  {id:"brake",name:"🛞 Brake & Alignment",desc:"Stop straight, drive safe",svcs:["Brake Pad + Rotor Replacement (per axle)","Wheel Alignment (4-wheel)"],discount:0.05},
  {id:"winter",name:"❄️ Winter Ready",desc:"Prepare for the cold months",svcs:["Battery Replacement","Coolant Flush","Cabin Air Filter"],discount:0.05},
  {id:"presale",name:"💰 Pre-Sale Tidy Up",desc:"Maximise your sale price",svcs:["General Multi-Point Inspection","Oil & Filter Change","Cabin Air Filter"],discount:0.05},
  {id:"perf",name:"🔥 Performance Tune",desc:"Restore lost performance",svcs:["Spark Plug Replacement (4-cyl)","Engine Air Filter Replacement","Fuel Injector Cleaning","Throttle Body Service"],discount:0.07},
  {id:"newcar",name:"🚗 New-to-You Package",desc:"Just bought a used car?",svcs:["Pre-Purchase Inspection","Oil & Filter Change","Brake Fluid Flush","Coolant Flush"],discount:0.08},
];

// ═══════════════════════════════════════════════════
// PARTS QUALITY / SEVERITY / URGENCY
// ═══════════════════════════════════════════════════
const PARTS_Q = [{id:"economy",label:"Economy",mult:0.8},{id:"oem",label:"OEM",mult:1.0},{id:"performance",label:"Premium",mult:1.4}];
const SEV = [{id:"routine",label:"Routine",mult:1.0},{id:"moderate",label:"Moderate",mult:1.15},{id:"severe",label:"Severe",mult:1.35}];
const URG_MOD = [{id:"standard",label:"Standard",mult:1.0},{id:"priority",label:"Priority",mult:1.1},{id:"emergency",label:"Emergency",mult:1.25}];

// ═══════════════════════════════════════════════════
// URGENCY BADGES
// ═══════════════════════════════════════════════════
const URG_MAP = {
  red:{label:"Drive to shop now",color:"#EF4444",bg:"rgba(239,68,68,0.12)"},
  orange:{label:"Book this week",color:"#F59E0B",bg:"rgba(245,158,11,0.12)"},
  yellow:{label:"Plan within a month",color:"#EAB308",bg:"rgba(234,179,8,0.1)"},
  green:{label:"Schedule at convenience",color:"#22C55E",bg:"rgba(34,197,94,0.1)"},
};

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════
const C = {bg:"#0A0A0C",s1:"#121215",s2:"#1A1A1E",bd:"#1E1E24",ac:"#FF8C00",acDim:"rgba(255,140,0,0.12)",tx:"#E8E6E1",txD:"#6B6960",txM:"#9B978E",g:"#22C55E",r:"#EF4444",b:"#3B82F6"};
const bBtn = {fontFamily:"'DM Sans',sans-serif",cursor:"pointer",border:"none",transition:"all 0.15s ease",outline:"none"};

// ═══════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════
function UrgBadge({level}){const d=URG_MAP[level];if(!d)return null;return <span style={{fontSize:"10px",fontWeight:600,color:d.color,background:d.bg,padding:"3px 8px",borderRadius:"4px",whiteSpace:"nowrap"}}>{d.label}</span>}

function Pill({children,color=C.ac,bg=C.acDim}){return <span style={{fontSize:"11px",fontWeight:600,color,background:bg,padding:"4px 10px",borderRadius:"5px",display:"inline-flex",alignItems:"center",gap:"4px"}}>{children}</span>}

function SBtn({selected,onClick,children,small}){
  return <button onClick={onClick} style={{...bBtn,background:selected?C.ac:C.s1,color:selected?"#0A0A0C":C.txM,border:`1.5px solid ${selected?C.ac:C.bd}`,borderRadius:"7px",padding:small?"6px 12px":"9px 16px",fontSize:small?"11px":"12px",fontWeight:selected?700:500}}>{children}</button>
}

function SLabel({children}){return <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.ac,marginBottom:"10px"}}>{children}</div>}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function QuoteCalculatorV2() {
  // Vehicle state
  const [year,setYear]=useState("");
  const [make,setMake]=useState("");
  const [model,setModel]=useState("");
  const [customModel,setCustomModel]=useState("");
  const [region,setRegion]=useState("christchurch");

  // Navigation
  const [tab,setTab]=useState("quote"); // quote | describe | maintenance
  const [openCat,setOpenCat]=useState(null);
  const [selSvc,setSelSvc]=useState(null);
  const [search,setSearch]=useState("");

  // NLP
  const [nlpInput,setNlpInput]=useState("");
  const [nlpResults,setNlpResults]=useState(null);

  // Maintenance
  const [odo,setOdo]=useState("");

  // Modifiers
  const [pq,setPq]=useState("oem");
  const [sev,setSev]=useState("routine");
  const [urg,setUrg]=useState("standard");

  // Quote basket
  const [basket,setBasket]=useState([]);
  const [showBasket,setShowBasket]=useState(false);
  const [quoteHistory,setQuoteHistory]=useState([]);

  // Tooltips
  const [showTip,setShowTip]=useState(null);

  // Print modal
  const [showPrint,setShowPrint]=useState(false);

  // Derived
  const vSet = year && make && (model || customModel);
  const finalModel = model === "Other" ? customModel : model;
  const tier = vSet ? classifyVehicle(make, finalModel) : null;
  const tierData = tier ? TIERS[tier] : null;
  const am = year ? ageMult(parseInt(year)) : 1;
  const vehicleEV = vSet && isEV(make, finalModel);
  const regionData = REGIONS.find(r=>r.id===region) || REGIONS[2];

  const years = useMemo(()=>{const y=[];for(let i=CURRENT_YEAR;i>=1985;i--)y.push(i);return y},[]);
  const availModels = useMemo(()=>MODELS[make]||["Other"],[make]);

  const filtSvcs = useMemo(()=>{
    if(!search)return SERVICES;
    const q=search.toLowerCase();
    return SERVICES.filter(s=>s.name.toLowerCase().includes(q)||s.cat.toLowerCase().includes(q));
  },[search]);

  const catSvcs = useMemo(()=>{
    const m={};
    filtSvcs.forEach(s=>{if(!m[s.cat])m[s.cat]=[];m[s.cat].push(s)});
    return m;
  },[filtSvcs]);

  const calcPrice = useCallback((svc)=>{
    if(!tierData)return null;
    const pqM=PARTS_Q.find(p=>p.id===pq)?.mult||1;
    const svM=SEV.find(s=>s.id===sev)?.mult||1;
    const urM=URG_MOD.find(u=>u.id===urg)?.mult||1;
    const rM=regionData.mult;
    const lMin=svc.lMin*tierData.lM*am*svM*urM*rM;
    const lMax=svc.lMax*tierData.lM*am*svM*urM*rM;
    const pMin=svc.pMin*tierData.pM*am*pqM;
    const pMax=svc.pMax*tierData.pM*am*pqM;
    return {lMin,lMax,pMin,pMax,tMin:lMin+pMin,tMax:lMax+pMax};
  },[tierData,am,pq,sev,urg,regionData]);

  const addToBasket=(svc,bundleDiscount=0)=>{
    const price=calcPrice(svc);
    if(!price)return;
    if(bundleDiscount>0){
      price.lMin*=(1-bundleDiscount);price.lMax*=(1-bundleDiscount);
      price.tMin=price.lMin+price.pMin;price.tMax=price.lMax+price.pMax;
    }
    setBasket(prev=>[...prev,{...svc,price,pq,sev,urg,bundleDiscount}]);
    setShowBasket(true);
  };

  const addBundle=(bundle)=>{
    bundle.svcs.forEach(svcName=>{
      const svc=SERVICES.find(s=>s.name===svcName);
      if(svc && !(vehicleEV && svc.ev)) addToBasket(svc, bundle.discount);
    });
  };

  const removeFromBasket=(idx)=>setBasket(prev=>prev.filter((_,i)=>i!==idx));

  const basketTotals = useMemo(()=>{
    let tMin=0,tMax=0;
    basket.forEach(b=>{tMin+=b.price.tMin;tMax+=b.price.tMax});
    const disc=basket.length>=3 && !basket.some(b=>b.bundleDiscount>0)?0.05:0;
    if(disc>0){const lD=basket.reduce((a,b)=>a+b.price.lMin,0)*disc;const lDx=basket.reduce((a,b)=>a+b.price.lMax,0)*disc;tMin-=lD;tMax-=lDx}
    return {tMin,tMax,disc,count:basket.length};
  },[basket]);

  const saveToHistory=()=>{
    if(basket.length===0)return;
    setQuoteHistory(prev=>[{vehicle:`${year} ${make} ${finalModel}`,tier,region:regionData.name,items:[...basket],totals:{...basketTotals},ts:Date.now()},...prev]);
  };

  const genQuoteText=()=>{
    const lines=[`SERVICE ESTIMATE`,`Vehicle: ${year} ${make} ${finalModel} (${tier} Tier)`,`Region: ${regionData.name}`,`Date: ${new Date().toLocaleDateString('en-NZ')}`,``];
    basket.forEach((b,i)=>{
      lines.push(`${i+1}. ${b.name}`);
      lines.push(`   Labour: ${fmtR(b.price.lMin,b.price.lMax)}`);
      if(b.price.pMax>0)lines.push(`   Parts:  ${fmtR(b.price.pMin,b.price.pMax)}`);
      lines.push(`   Subtotal: ${fmtR(b.price.tMin,b.price.tMax)}`);
      lines.push(``);
    });
    if(basketTotals.disc>0)lines.push(`Multi-service discount (5% labour) applied`);
    lines.push(`TOTAL ESTIMATE: ${fmtR(basketTotals.tMin,basketTotals.tMax)}`);
    lines.push(``);
    lines.push(`All estimates NZD, GST inclusive. Actual pricing may vary.`);
    return lines.join('\n');
  };

  // NLP handler
  const handleNlp=()=>{
    if(!nlpInput.trim())return;
    const results=matchSymptoms(nlpInput);
    setNlpResults(results.length>0?results:null);
  };

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,backgroundImage:`linear-gradient(rgba(255,140,0,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,0,0.015) 1px,transparent 1px)`,backgroundSize:"50px 50px",pointerEvents:"none"}}/>

      <div style={{maxWidth:"840px",margin:"0 auto",padding:"32px 16px 120px",position:"relative"}}>
        {/* HEADER */}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
          <div style={{width:"4px",height:"32px",background:`linear-gradient(180deg,${C.ac},#FF6200)`,borderRadius:"2px"}}/>
          <h1 style={{fontFamily:"'Bebas Neue'",fontSize:"34px",letterSpacing:"2.5px",color:"#FFF",margin:0,lineHeight:1}}>SERVICE QUOTE CALCULATOR</h1>
        </div>
        <p style={{color:C.txD,fontSize:"12px",margin:"0 0 20px 14px"}}>All estimates in NZD • GST inclusive • Trade Me vehicle data</p>

        {/* VEHICLE SELECTOR */}
        <div style={{marginBottom:"16px",padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${vSet?C.g+"44":C.bd}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
            <SLabel>Your Vehicle</SLabel>
            {/* Region selector */}
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <MapPin size={12} color={C.txD}/>
              <select value={region} onChange={e=>setRegion(e.target.value)} style={{padding:"4px 8px",background:C.s2,color:C.txM,border:`1px solid ${C.bd}`,borderRadius:"5px",fontSize:"11px",fontFamily:"'DM Sans'"}}>
                {REGIONS.map(r=><option key={r.id} value={r.id}>{r.name} ({r.mult}x)</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <select value={year} onChange={e=>{setYear(e.target.value);setMake("");setModel("");setSelSvc(null)}} style={{flex:"1 1 100px",minWidth:"100px",padding:"10px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'"}}>
              <option value="">Year</option>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <select value={make} onChange={e=>{setMake(e.target.value);setModel("");setSelSvc(null)}} disabled={!year} style={{flex:"1 1 140px",minWidth:"140px",padding:"10px",background:C.s2,color:year?C.tx:C.txD,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'",opacity:year?1:0.5}}>
              <option value="">Make</option>
              {Object.entries(MAKE_GROUPS).map(([group,makes])=><optgroup key={group} label={group}>{makes.map(m=><option key={m} value={m}>{m}</option>)}</optgroup>)}
              <option value="Other">Other / Not Listed</option>
            </select>
            <select value={model} onChange={e=>{setModel(e.target.value);setSelSvc(null)}} disabled={!make} style={{flex:"1 1 140px",minWidth:"140px",padding:"10px",background:C.s2,color:make?C.tx:C.txD,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'",opacity:make?1:0.5}}>
              <option value="">Model</option>
              {availModels.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {model==="Other"&&<input value={customModel} onChange={e=>setCustomModel(e.target.value)} placeholder="Enter model name..." style={{marginTop:"8px",width:"100%",padding:"10px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'",boxSizing:"border-box"}}/>}

          {vSet && tier && (
            <div style={{marginTop:"10px",display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
              <Pill color={TIER_COLORS[tier]||C.ac} bg={`${TIER_COLORS[tier]||C.ac}18`}><Car size={12}/>{tier}</Pill>
              <span style={{fontSize:"11px",color:C.txD}}>{year} {make} {finalModel} • Labour {tierData.lM}x • Parts {tierData.pM}x{am>1?` • Age +${Math.round((am-1)*100)}%`:""} • {regionData.name}</span>
              {vehicleEV && <Pill color={C.b} bg="rgba(59,130,246,0.12)"><Zap size={11}/>EV</Pill>}
            </div>
          )}
        </div>

        {/* TABS */}
        {vSet && (
          <div style={{display:"flex",gap:"4px",marginBottom:"16px",background:C.s1,borderRadius:"8px",padding:"4px",border:`1px solid ${C.bd}`}}>
            {[{id:"quote",icon:<Wrench size={13}/>,label:"Quote Builder"},{id:"describe",icon:<MessageCircle size={13}/>,label:"Describe Problem"},{id:"maintenance",icon:<Calendar size={13}/>,label:"Maintenance"}].map(t=>
              <button key={t.id} onClick={()=>{setTab(t.id);setSelSvc(null)}} style={{...bBtn,flex:1,padding:"9px 8px",borderRadius:"6px",background:tab===t.id?C.ac:"transparent",color:tab===t.id?"#000":C.txM,fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
                {t.icon}{t.label}
              </button>
            )}
          </div>
        )}

        {/* ═══════════ TAB: DESCRIBE PROBLEM ═══════════ */}
        {vSet && tab==="describe" && !selSvc && (
          <div>
            <div style={{padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`,marginBottom:"12px"}}>
              <SLabel>Describe Your Car Problem</SLabel>
              <div style={{display:"flex",gap:"8px"}}>
                <input value={nlpInput} onChange={e=>setNlpInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleNlp()} placeholder='e.g. "Grinding noise when I brake" or "Won\'t start, just clicks"' style={{flex:1,padding:"12px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"13px",fontFamily:"'DM Sans'"}}/>
                <button onClick={handleNlp} style={{...bBtn,padding:"12px 20px",background:C.ac,color:"#000",borderRadius:"7px",fontSize:"13px",fontWeight:700}}>
                  <Search size={14}/>
                </button>
              </div>
            </div>
            {nlpResults && (
              <div>
                <SLabel>Likely Services for Your Issue</SLabel>
                <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                  {nlpResults.map((r,i)=>{
                    const blocked=vehicleEV&&r.svc.ev;
                    const price=calcPrice(r.svc);
                    return (
                      <button key={i} onClick={()=>!blocked&&setSelSvc(r.svc)} disabled={blocked} style={{...bBtn,textAlign:"left",padding:"14px 16px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",color:blocked?C.txD:C.tx,opacity:blocked?0.4:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:"8px"}}>
                          <div>
                            <div style={{fontSize:"14px",fontWeight:600,marginBottom:"4px"}}>{r.svc.icon} {r.svc.name}</div>
                            <div style={{fontSize:"11px",color:C.txD}}>{r.why}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            {price&&!blocked&&<div style={{fontSize:"13px",fontWeight:600,color:C.ac}}>{fmtR(price.tMin,price.tMax)}</div>}
                            <UrgBadge level={r.svc.urg}/>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {nlpResults===null && nlpInput.trim() && <div style={{padding:"24px",textAlign:"center",color:C.txD,fontSize:"13px"}}>No matching services found. Try different keywords, or browse services in the Quote Builder tab.</div>}
          </div>
        )}

        {/* ═══════════ TAB: MAINTENANCE TIMELINE ═══════════ */}
        {vSet && tab==="maintenance" && !selSvc && (
          <div>
            <div style={{padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`,marginBottom:"16px"}}>
              <SLabel>Current Odometer Reading</SLabel>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <input value={odo} onChange={e=>setOdo(e.target.value.replace(/[^0-9]/g,''))} placeholder="e.g. 85000" style={{flex:1,maxWidth:"200px",padding:"10px",background:C.s2,color:C.tx,border:`1px solid ${C.bd}`,borderRadius:"7px",fontSize:"14px",fontFamily:"'DM Sans'"}}/>
                <span style={{fontSize:"13px",color:C.txD}}>km</span>
              </div>
            </div>
            {odo && (
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {MAINT_SCHEDULE.map((ms,i)=>{
                  const odoNum=parseInt(odo);
                  const status=odoNum>=ms.km?"done":odoNum>=ms.km-10000?"due":"upcoming";
                  const statusColor=status==="done"?C.g:status==="due"?"#F59E0B":C.txD;
                  const statusLabel=status==="done"?"✓ Completed":status==="due"?"⚠️ Due Now":"📅 Upcoming";
                  return (
                    <div key={i} style={{padding:"16px",background:C.s1,borderRadius:"8px",border:`1px solid ${status==="due"?"#F59E0B44":C.bd}`,borderLeft:`3px solid ${statusColor}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                        <span style={{fontSize:"14px",fontWeight:700,color:statusColor}}>{ms.label}</span>
                        <span style={{fontSize:"11px",fontWeight:600,color:statusColor}}>{statusLabel}</span>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                        {ms.svcs.map((svcName,j)=>{
                          const svc=SERVICES.find(s=>s.name===svcName);
                          if(!svc||(vehicleEV&&svc.ev))return null;
                          const price=calcPrice(svc);
                          return (
                            <button key={j} onClick={()=>setSelSvc(svc)} style={{...bBtn,padding:"6px 10px",background:C.s2,border:`1px solid ${C.bd}`,borderRadius:"5px",color:C.txM,fontSize:"11px",display:"flex",alignItems:"center",gap:"4px"}}>
                              {svc.name}{price&&<span style={{color:C.ac,fontWeight:600}}>{fmt(price.tMin)}+</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB: QUOTE BUILDER ═══════════ */}
        {vSet && tab==="quote" && !selSvc && (
          <div>
            {/* Search */}
            <div style={{position:"relative",marginBottom:"12px"}}>
              <Search size={14} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:C.txD}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search 120+ services..." style={{width:"100%",padding:"10px 12px 10px 34px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",color:C.tx,fontSize:"13px",fontFamily:"'DM Sans'",boxSizing:"border-box"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{...bBtn,position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",background:"none",color:C.txD,padding:"4px"}}><X size={14}/></button>}
            </div>

            {/* Smart Bundles */}
            {!search && (
              <div style={{marginBottom:"16px"}}>
                <SLabel>Smart Bundles</SLabel>
                <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px"}}>
                  {BUNDLES.map(b=>(
                    <button key={b.id} onClick={()=>addBundle(b)} style={{...bBtn,minWidth:"160px",padding:"14px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",textAlign:"left",flexShrink:0}}>
                      <div style={{fontSize:"14px",fontWeight:700,marginBottom:"4px"}}>{b.name}</div>
                      <div style={{fontSize:"11px",color:C.txD,marginBottom:"6px"}}>{b.desc}</div>
                      <div style={{fontSize:"10px",color:C.g,fontWeight:600}}>{Math.round(b.discount*100)}% labour discount</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Accordion */}
            <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
              {(search?Object.keys(catSvcs):CATEGORIES).filter(c=>catSvcs[c]?.length).map(cat=>(
                <div key={cat}>
                  <button onClick={()=>setOpenCat(openCat===cat?null:cat)} style={{...bBtn,width:"100%",textAlign:"left",padding:"12px 16px",background:openCat===cat?C.s2:C.s1,border:`1px solid ${openCat===cat?C.ac+"33":C.bd}`,borderRadius:openCat===cat?"8px 8px 0 0":"8px",color:C.tx,fontSize:"13px",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span>{CAT_ICONS[cat]} {cat} <span style={{fontWeight:400,color:C.txD,fontSize:"11px"}}>({catSvcs[cat].length})</span></span>
                    {openCat===cat?<ChevronUp size={14} color={C.ac}/>:<ChevronDown size={14} color={C.txD}/>}
                  </button>
                  {openCat===cat&&(
                    <div style={{border:`1px solid ${C.bd}`,borderTop:"none",borderRadius:"0 0 8px 8px",overflow:"hidden"}}>
                      {catSvcs[cat].map((svc,i)=>{
                        const blocked=vehicleEV&&svc.ev;
                        const price=calcPrice(svc);
                        return (
                          <button key={i} onClick={()=>!blocked&&setSelSvc(svc)} disabled={blocked} style={{...bBtn,width:"100%",textAlign:"left",padding:"10px 16px",background:"transparent",borderBottom:i<catSvcs[cat].length-1?`1px solid ${C.bd}`:"none",color:blocked?C.txD:C.tx,fontSize:"12px",opacity:blocked?0.4:1,display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:"8px",flex:1,minWidth:0}}>
                              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{svc.name}</span>
                              {blocked&&<span style={{fontSize:"10px",color:C.b}}>N/A for EVs</span>}
                              {svc.tip&&<Info size={12} color={C.txD} style={{flexShrink:0}}/>}
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
                              <UrgBadge level={svc.urg}/>
                              {price&&!blocked&&<span style={{fontSize:"11px",color:C.txD,minWidth:"80px",textAlign:"right"}}>{fmtR(price.tMin,price.tMax)}</span>}
                              <ChevronRight size={12} color={C.txD}/>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ SERVICE ESTIMATE DETAIL ═══════════ */}
        {vSet && selSvc && (()=>{
          const svc=selSvc;
          const price=calcPrice(svc);
          if(!price)return null;
          // Parts comparison
          const priceEco={...price};priceEco.pMin=svc.pMin*tierData.pM*am*0.8;priceEco.pMax=svc.pMax*tierData.pM*am*0.8;priceEco.tMin=price.lMin+priceEco.pMin;priceEco.tMax=price.lMax+priceEco.pMax;
          const priceOem={...price};priceOem.pMin=svc.pMin*tierData.pM*am;priceOem.pMax=svc.pMax*tierData.pM*am;priceOem.tMin=price.lMin+priceOem.pMin;priceOem.tMax=price.lMax+priceOem.pMax;
          const pricePrem={...price};pricePrem.pMin=svc.pMin*tierData.pM*am*1.4;pricePrem.pMax=svc.pMax*tierData.pM*am*1.4;pricePrem.tMin=price.lMin+pricePrem.pMin;pricePrem.tMax=price.lMax+pricePrem.pMax;

          return (
            <div>
              <button onClick={()=>setSelSvc(null)} style={{...bBtn,background:"none",color:C.ac,padding:"0 0 12px",fontSize:"12px",display:"flex",alignItems:"center",gap:"4px"}}><ArrowLeft size={13}/>Back</button>

              <div style={{padding:"24px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`,marginBottom:"12px"}}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:"6px",marginBottom:"14px"}}>
                  <div>
                    <h2 style={{margin:"0 0 3px",fontSize:"18px",fontWeight:700}}>{svc.icon} {svc.name}</h2>
                    <span style={{fontSize:"11px",color:C.txD}}>{svc.cat} • {svc.h} hrs est.</span>
                  </div>
                  <UrgBadge level={svc.urg}/>
                </div>

                {/* Tip */}
                {svc.tip&&(
                  <div style={{padding:"10px 14px",background:"rgba(59,130,246,0.08)",borderRadius:"7px",border:"1px solid rgba(59,130,246,0.15)",marginBottom:"14px",fontSize:"12px",color:C.txM,lineHeight:1.5}}>
                    <Info size={12} color={C.b} style={{verticalAlign:"-2px",marginRight:"6px"}}/>
                    {svc.tip}
                  </div>
                )}

                {/* Modifiers */}
                <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"20px"}}>
                  {svc.pMax>0&&<div><div style={{fontSize:"11px",fontWeight:600,color:C.txM,marginBottom:"6px"}}>Parts Quality</div><div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>{PARTS_Q.map(p=><SBtn key={p.id} selected={pq===p.id} onClick={()=>setPq(p.id)} small>{p.label}</SBtn>)}</div></div>}
                  <div><div style={{fontSize:"11px",fontWeight:600,color:C.txM,marginBottom:"6px"}}>Severity</div><div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>{SEV.map(s=><SBtn key={s.id} selected={sev===s.id} onClick={()=>setSev(s.id)} small>{s.label}</SBtn>)}</div></div>
                  <div><div style={{fontSize:"11px",fontWeight:600,color:C.txM,marginBottom:"6px"}}>Urgency</div><div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>{URG_MOD.map(u=><SBtn key={u.id} selected={urg===u.id} onClick={()=>setUrg(u.id)} small>{u.label}</SBtn>)}</div></div>
                </div>

                {/* Price */}
                <div style={{padding:"20px",background:C.bg,borderRadius:"8px",border:`1px solid ${C.ac}22`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:`linear-gradient(90deg,${C.ac},#FFB347,#FF6200)`}}/>
                  <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"2px",color:C.ac,marginBottom:"10px"}}>ESTIMATED TOTAL</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:"40px",color:"#FFF",lineHeight:1,marginBottom:"12px"}}>
                    {fmt(price.tMin)} <span style={{fontSize:"20px",color:"#444"}}>—</span> {fmt(price.tMax)}
                  </div>
                  <div style={{display:"flex",gap:"20px",flexWrap:"wrap",marginBottom:"10px"}}>
                    <div><div style={{fontSize:"10px",color:C.txD}}>Labour</div><div style={{fontSize:"14px",fontWeight:600}}>{fmtR(price.lMin,price.lMax)}</div></div>
                    {price.pMax>0&&<div><div style={{fontSize:"10px",color:C.txD}}>Parts</div><div style={{fontSize:"14px",fontWeight:600}}>{fmtR(price.pMin,price.pMax)}</div></div>}
                  </div>
                  <div style={{fontSize:"10px",color:C.txD}}>{year} {make} {finalModel} • {tier} • {regionData.name} • {PARTS_Q.find(p=>p.id===pq)?.label} parts</div>
                </div>

                {/* Quick Compare — 3 columns */}
                {svc.pMax>0&&(
                  <div style={{marginTop:"14px"}}>
                    <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"1.5px",color:C.txD,marginBottom:"8px"}}>PARTS QUALITY COMPARISON</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px"}}>
                      {[{l:"Economy",p:priceEco,note:"Aftermarket"},{l:"OEM",p:priceOem,note:"Factory spec"},{l:"Premium",p:pricePrem,note:"Upgraded"}].map((c,i)=>(
                        <div key={i} style={{padding:"10px",background:C.bg,borderRadius:"6px",border:`1px solid ${i===1?C.ac+"44":C.bd}`,textAlign:"center"}}>
                          <div style={{fontSize:"11px",fontWeight:700,color:i===1?C.ac:C.txM,marginBottom:"4px"}}>{c.l}</div>
                          <div style={{fontFamily:"'Bebas Neue'",fontSize:"20px",color:"#FFF"}}>{fmt(c.p.tMin)}</div>
                          <div style={{fontSize:"10px",color:C.txD}}>to {fmt(c.p.tMax)}</div>
                          <div style={{fontSize:"9px",color:C.txD,marginTop:"4px"}}>{c.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related services */}
                {svc.related&&(
                  <div style={{marginTop:"12px",padding:"10px 14px",background:C.acDim,borderRadius:"7px",fontSize:"11px",color:C.txM}}>
                    <AlertTriangle size={11} color={C.ac} style={{verticalAlign:"-2px",marginRight:"5px"}}/>
                    <strong style={{color:C.ac}}>Often paired:</strong>{" "}
                    {svc.related.map((r,i)=><span key={r}><button onClick={()=>{const f=SERVICES.find(s=>s.name===r);if(f)setSelSvc(f)}} style={{...bBtn,background:"none",color:C.ac,textDecoration:"underline",fontSize:"11px",padding:0,display:"inline"}}>{r}</button>{i<svc.related.length-1&&", "}</span>)}
                  </div>
                )}

                {/* Add to Quote */}
                <button onClick={()=>addToBasket(svc)} style={{...bBtn,marginTop:"14px",width:"100%",padding:"12px",background:`linear-gradient(135deg,${C.ac},#E07800)`,color:"#0A0A0C",borderRadius:"8px",fontSize:"12px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",boxShadow:`0 4px 16px rgba(255,140,0,0.2)`}}>
                  <Plus size={13} style={{verticalAlign:"-2px",marginRight:"5px"}}/>Add to Quote
                </button>
              </div>
            </div>
          );
        })()}

        {/* ═══════════ BASKET ═══════════ */}
        {basket.length>0&&(
          <div style={{marginTop:"16px",padding:"20px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:showBasket?"12px":"0"}} onClick={()=>setShowBasket(!showBasket)}>
              <SLabel>Quote Summary ({basket.length})</SLabel>
              {showBasket?<ChevronUp size={14} color={C.ac}/>:<ChevronDown size={14} color={C.ac}/>}
            </div>
            {showBasket&&(
              <>
                {basket.map((item,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bd}`}}>
                    <div><div style={{fontSize:"12px",fontWeight:600}}>{item.name}</div><div style={{fontSize:"10px",color:C.txD}}>{item.cat}{item.bundleDiscount>0?` • ${Math.round(item.bundleDiscount*100)}% bundle disc.`:""}</div></div>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      <span style={{fontSize:"12px",fontWeight:600}}>{fmtR(item.price.tMin,item.price.tMax)}</span>
                      <button onClick={()=>removeFromBasket(i)} style={{...bBtn,background:"none",color:C.r,padding:"2px"}}><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))}
                {basketTotals.disc>0&&<div style={{padding:"6px 0",fontSize:"11px",color:C.g}}><CheckCircle size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>5% multi-service labour discount applied</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"14px 0 0",borderTop:`2px solid ${C.ac}22`,marginTop:"6px"}}>
                  <span style={{fontSize:"12px",fontWeight:700,color:C.ac}}>TOTAL</span>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:"28px",color:"#FFF"}}>{fmt(basketTotals.tMin)} – {fmt(basketTotals.tMax)}</span>
                </div>
                <div style={{display:"flex",gap:"6px",marginTop:"12px",flexWrap:"wrap"}}>
                  <button onClick={()=>{navigator.clipboard?.writeText(genQuoteText());saveToHistory()}} style={{...bBtn,flex:1,padding:"9px",background:C.s2,color:C.txM,borderRadius:"7px",fontSize:"11px",fontWeight:600,border:`1px solid ${C.bd}`}}><Copy size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>Copy Quote</button>
                  <button onClick={()=>{saveToHistory();setShowPrint(true)}} style={{...bBtn,flex:1,padding:"9px",background:C.s2,color:C.txM,borderRadius:"7px",fontSize:"11px",fontWeight:600,border:`1px solid ${C.bd}`}}><PrinterIcon size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>View Quote</button>
                  <button onClick={()=>{setBasket([]);setSelSvc(null);setShowBasket(false)}} style={{...bBtn,padding:"9px 14px",background:"none",color:C.txD,borderRadius:"7px",fontSize:"11px",fontWeight:600,border:`1px solid ${C.bd}`}}><RotateCcw size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>Clear</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════ QUOTE HISTORY ═══════════ */}
        {quoteHistory.length>0&&(
          <div style={{marginTop:"12px",padding:"16px",background:C.s1,borderRadius:"10px",border:`1px solid ${C.bd}`}}>
            <SLabel><History size={11} style={{verticalAlign:"-2px",marginRight:"4px"}}/>Session History ({quoteHistory.length})</SLabel>
            {quoteHistory.map((q,i)=>(
              <div key={i} style={{padding:"8px 0",borderBottom:i<quoteHistory.length-1?`1px solid ${C.bd}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:"12px",fontWeight:600}}>{q.vehicle}</div>
                  <div style={{fontSize:"10px",color:C.txD}}>{q.items.length} services • {q.region}</div>
                </div>
                <span style={{fontSize:"12px",fontWeight:600,color:C.ac}}>{fmtR(q.totals.tMin,q.totals.tMax)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════ PRINT MODAL ═══════════ */}
        {showPrint&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={()=>setShowPrint(false)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#FFF",color:"#000",maxWidth:"500px",width:"100%",borderRadius:"12px",padding:"32px",maxHeight:"80vh",overflow:"auto",fontFamily:"'DM Sans',sans-serif"}}>
              <h2 style={{margin:"0 0 4px",fontSize:"18px",fontWeight:700}}>Service Estimate</h2>
              <p style={{margin:"0 0 16px",fontSize:"12px",color:"#666"}}>{year} {make} {finalModel} • {tier} Tier • {regionData.name} • {new Date().toLocaleDateString('en-NZ')}</p>
              <div style={{borderTop:"2px solid #000",borderBottom:"2px solid #000",padding:"12px 0",marginBottom:"12px"}}>
                {basket.map((b,i)=>(
                  <div key={i} style={{padding:"8px 0",borderBottom:i<basket.length-1?"1px solid #ddd":"none"}}>
                    <div style={{fontWeight:600,fontSize:"13px"}}>{i+1}. {b.name}</div>
                    <div style={{fontSize:"12px",color:"#555",display:"flex",justifyContent:"space-between"}}>
                      <span>Labour: {fmtR(b.price.lMin,b.price.lMax)}{b.price.pMax>0?` | Parts: ${fmtR(b.price.pMin,b.price.pMax)}`:""}</span>
                      <strong>{fmtR(b.price.tMin,b.price.tMax)}</strong>
                    </div>
                  </div>
                ))}
              </div>
              {basketTotals.disc>0&&<p style={{fontSize:"11px",color:"green",margin:"0 0 8px"}}>5% multi-service labour discount applied</p>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"16px",fontWeight:700}}>
                <span>TOTAL ESTIMATE</span>
                <span>{fmtR(basketTotals.tMin,basketTotals.tMax)}</span>
              </div>
              <p style={{fontSize:"10px",color:"#999",marginTop:"16px",lineHeight:1.5}}>All estimates in NZD, GST inclusive. Actual pricing may vary based on vehicle condition, parts availability, and workshop rates.</p>
              <div style={{display:"flex",gap:"8px",marginTop:"16px"}}>
                <button onClick={()=>{navigator.clipboard?.writeText(genQuoteText())}} style={{...bBtn,flex:1,padding:"10px",background:"#000",color:"#FFF",borderRadius:"6px",fontSize:"12px",fontWeight:600}}>Copy Text</button>
                <button onClick={()=>window.print()} style={{...bBtn,flex:1,padding:"10px",background:"#f5f5f5",color:"#000",borderRadius:"6px",fontSize:"12px",fontWeight:600,border:"1px solid #ddd"}}>Print</button>
                <button onClick={()=>setShowPrint(false)} style={{...bBtn,padding:"10px 16px",background:"none",color:"#666",borderRadius:"6px",fontSize:"12px",border:"1px solid #ddd"}}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{marginTop:"32px",padding:"16px",borderTop:`1px solid ${C.bd}`,fontSize:"10px",color:C.txD,lineHeight:1.6,textAlign:"center"}}>
          All estimates are in NZD and are for budgeting purposes only. Actual pricing may vary based on vehicle condition, parts availability, and workshop rates. GST inclusive. Contact us for a confirmed quote.
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box}
        select:focus,input:focus,button:focus-visible{outline:2px solid ${C.ac};outline-offset:2px}
        select option{background:${C.s2};color:${C.tx}}
        ::placeholder{color:${C.txD}}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
        @media print{body{background:#fff!important}[data-noprint]{display:none!important}}
      `}</style>
    </div>
  );
}
