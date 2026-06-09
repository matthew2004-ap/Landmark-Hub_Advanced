const U = (id, w = 500) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PICS = {
  menu: U("1546069901-ba9599a7e63c", 100),
  cart: U("1557821552-17105176677c", 100),
  track: U("1526628953301-3e589a6a8b74", 100),
  review: U("1521791136064-7986c2959213", 100),
  box: U("1566576721346-d4a3b4eaad5b", 100),
  ai: U("1531746790731-6c087fecd05a", 100),
  home: U("1460925895917-afdab827c52f", 100),
  user: U("1523240715634-9426d739600a", 100),
  settings: U("1581092160607-ee22621dd758", 100),
  money: U("1554224155-6726b3ff858f", 100),
  check: U("1513530534585-c7b1394c6d51", 100),
  logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230C3B2E'/%3E%3Ccircle cx='50' cy='50' r='40' fill='%23FEFCE8' stroke='%23F59E0B' stroke-width='4'/%3E%3Ctext x='50' y='60' font-family='Arial Black, sans-serif' font-size='30' font-weight='900' text-anchor='middle' fill='%23F59E0B'%3ECCH%3C/text%3E%3C/svg%3E",
  admin: U("1550751827-4bd374c3f58b", 100),
  student: U("1523240715634-9426d739600a", 100),
  vendor: U("1556742044-3c52d6e88c62", 100),
  wallet: U("1620714223084-8fcacc6df3f2", 100),
  bank: U("1501167786227-4cba701e793f", 100),
  cash: U("1580519542036-c47de6196ba5", 100),
  issue: U("1593530596253-3725a070ac74", 100),
  star: U("1521791136064-7986c2959213", 100),
  shield: U("1550751827-4bd374c3f58b", 100),
};

export const CAFES = ["Cafe 1", "Cafe 2", "Cafe 3", "Back of Cafe"];
export const HOSTELS = ["Joseph Hall", "Daniel Hall", "Abigail Hall", "Jacob Hall", "Sarah Hall", "Deborah Hall"];
export const PAY = [
  { id: "wallet", label: "LMU E-Wallet", icon: PICS.wallet, note: "Deducted instantly" },
  { id: "transfer", label: "Bank Transfer", icon: PICS.bank, note: "Send to cafe account" },
  { id: "cash", label: "Cash on Delivery", icon: PICS.cash, note: "Pay when food arrives" },
];
export const VENDOR_ACCTS = [
  { id: "v1", u: "cafe1", p: "Vendor1", cafe: "Cafe 1", name: "Cafe 1 — Manager" },
  { id: "v2", u: "cafe2", p: "Vendor2", cafe: "Cafe 2", name: "Cafe 2 — Manager" },
  { id: "v3", u: "cafe3", p: "Vendor3", cafe: "Cafe 3", name: "Cafe 3 — Manager" },
  { id: "v4", u: "backcafe", p: "Vendor4", cafe: "Back of Cafe", name: "Back Cafe — Manager" },
];
export const ADMIN = { u: "admin", p: "Admin2024", name: "Platform Administrator" };
export const DEFAULT_TIMES = { "Cafe 1": 20, "Cafe 2": 15, "Cafe 3": 18, "Back of Cafe": 12 };

// Unsplash photo map
export const PH = {
  1: U("1604329760661-e71dc83f8f26"),   // jollof rice
  2: U("1603133872878-684f208fb84b"),   // fried rice
  3: U("1455619452474-d2be8b1e70cd"),   // stew / amala
  4: U("1574894709920-11b28e7367e3"),   // soup + swallow
  5: U("1481931098730-318b6f776db0"),   // spaghetti
  6: U("1569050467447-ce54b3bbc37d"),   // noodles
  7: U("1516100882582-96c3a05fe590"),   // ofada rice
  8: U("1585937421612-70a008356fbe"),   // beans/plantain
  9: U("1568901346375-23c9450c58cd"),   // burger
  10: U("1565299585323-38d6b0865b47"),   // shawarma/wrap
  11: U("1571091718767-18b5b1457add"),   // pastry / meat pie
  12: U("1527477396000-e27163b481c2"),   // fried chicken
  13: U("1544025162-d76694265947"),      // suya / grilled meat
  14: U("1551754655-cd27e38d2076"),      // roasted corn
  15: U("1565958011703-44f9829ba187"),   // fish
  16: U("1528207776546-365bb710ee93"),   // plantain
  hero: U("1504674900247-0877df9cc836", 1600),  // food spread
  hero2: U("1414235077428-338989a2e8c0", 1600),  // restaurant
  auth: U("1567521464027-f127ff144326", 900),   // food hall
  c1: U("1466978913421-dad2ebd01d17", 700),   // cafe 1
  c2: U("1554118811-1e0d58224f24", 700),       // cafe 2
  c3: U("1493770348161-369560ae357d", 700),    // cafe 3
  c4: U("1555396273-367ea4eb4db5", 700),       // back of cafe
  campus: U("1607237138185-eedd9c632b0b", 1200),  // university
};
export const CAFE_IMG = { "Cafe 1": PH.c1, "Cafe 2": PH.c2, "Cafe 3": PH.c3, "Back of Cafe": PH.c4 };
export const FB = U("1504674900247-0877df9cc836");     // fallback image

export const INIT_MENU = {
  "Cafe 1": [
    { id: 1, name: "Jollof Rice + Chicken", price: 1200, img: 1, tag: "Bestseller", available: true },
    { id: 2, name: "Fried Rice + Fish", price: 1100, img: 2, tag: "Popular", available: true },
    { id: 3, name: "Amala + Ewedu Soup", price: 900, img: 3, tag: "", available: true },
    { id: 4, name: "Egusi + Pounded Yam", price: 1300, img: 4, tag: "Chef's Pick", available: false },
  ],
  "Cafe 2": [
    { id: 5, name: "Spaghetti Bolognese", price: 800, img: 5, tag: "Budget", available: true },
    { id: 6, name: "Indomie + Egg", price: 600, img: 6, tag: "Fast", available: true },
    { id: 7, name: "Ofada Rice + Stew", price: 1400, img: 7, tag: "Premium", available: true },
    { id: 8, name: "Fried Plantain + Beans", price: 700, img: 8, tag: "", available: true },
  ],
  "Cafe 3": [
    { id: 9, name: "Chicken Burger + Fries", price: 1500, img: 9, tag: "Trending", available: true },
    { id: 10, name: "Beef Shawarma", price: 1200, img: 10, tag: "Hot 🔥", available: true },
    { id: 11, name: "Meat Pie + Juice", price: 600, img: 11, tag: "Snack", available: true },
    { id: 12, name: "Crispy Chicken Wings", price: 1800, img: 12, tag: "Premium", available: false },
  ],
  "Back of Cafe": [
    { id: 13, name: "Beef Suya + Yam", price: 1000, img: 13, tag: "Evening Fav", available: true },
    { id: 14, name: "Roasted Corn + Ube", price: 400, img: 14, tag: "Light", available: true },
    { id: 15, name: "Bole + Fish Sauce", price: 900, img: 15, tag: "Classic", available: true },
    { id: 16, name: "Sweet Roasted Plantain", price: 500, img: 16, tag: "", available: true },
  ],
};
