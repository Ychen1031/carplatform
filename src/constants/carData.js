/**
 * 統一的車輛數據源
 * 所有車源（新車、中古車、庫存）統一在此管理
 * ID 規則: 1-100 為首頁庫存, 101-200 為中古車
 */

export const ALL_CARS = [
  // ===== 首頁庫存 (1-6) =====
  {
    id: 1,
    title: 'Toyota Corolla Altis 1.8',
    brand: 'Toyota',
    city: '台北',
    year: 2021,
    mileage: 42000,
    fuel: '汽油',
    transmission: '自排',
    price: 568000,
    seller: '瑞成汽車',
    phone: '0912-111-222',
    image: '/logos/Toyota Corolla Altis 1.8.png',
    type: '轎車',
  },
  {
    id: 2,
    title: 'Honda CR-V 1.5 Turbo',
    brand: 'Honda',
    city: '台中',
    year: 2020,
    mileage: 58000,
    fuel: '汽油',
    transmission: '自排',
    price: 738000,
    seller: '大成車業',
    phone: '0923-333-888',
    image: '/logos/Honda CR-V 1.5 Turbo.png',
    type: 'SUV',
  },
  {
    id: 3,
    title: 'Mazda 3 2.0 Signature',
    brand: 'Mazda',
    city: '高雄',
    year: 2022,
    mileage: 23000,
    fuel: '汽油',
    transmission: '自排',
    price: 828000,
    seller: '新曜車庫',
    phone: '0955-987-321',
    image: '/logos/Mazda 3 2.0 Signature.png',
    type: '轎車',
  },
  {
    id: 4,
    title: 'Nissan Kicks e-Power',
    brand: 'Nissan',
    city: '台南',
    year: 2023,
    mileage: 11000,
    fuel: '油電',
    transmission: '自排',
    price: 868000,
    seller: '優選汽車',
    phone: '0970-672-100',
    image: '/logos/Nissan Kicks e-Power.png',
    type: 'SUV',
  },
  {
    id: 5,
    title: 'Ford Focus ST-Line',
    brand: 'Ford',
    city: '新竹',
    year: 2019,
    mileage: 76000,
    fuel: '汽油',
    transmission: '自排',
    price: 498000,
    seller: '都會車坊',
    phone: '0988-541-021',
    image: '/logos/Ford Focus ST-Line.png',
    type: '轎車',
  },
  {
    id: 6,
    title: 'Tesla Model 3 RWD',
    brand: 'Tesla',
    city: '桃園',
    year: 2022,
    mileage: 35000,
    fuel: '純電',
    transmission: '單速',
    price: 1220000,
    seller: '電馭精選',
    phone: '0908-222-640',
    image: '/logos/Tesla Model 3 RWD.png',
    type: '轎車',
  },

  // ===== 中古車 (101-112) =====
  {
    id: 101,
    title: 'Toyota Corolla Cross 2022',
    brand: 'Toyota',
    model: 'Corolla Cross',
    year: 2022,
    price: 629000,
    mileage: 45000,
    type: 'SUV',
    fuel: '汽油/油電',
    transmission: '自動',
    engine: '1.8L',
    image: '/logos/Toyota Corolla Cross 2024.png',
    city: '台北',
    colors: ['黑色', '白色', '藍色'],
    features: ['360度攝像頭', '自動停車', '自適應巡航'],
  },
  {
    id: 102,
    title: 'Toyota RAV4 2021',
    brand: 'Toyota',
    model: 'RAV4',
    year: 2021,
    price: 749000,
    mileage: 65000,
    type: 'SUV',
    fuel: '汽油/油電',
    transmission: '自動',
    engine: '2.5L',
    image: '/logos/Toyota RAV4 2024.png',
    city: '新北',
    colors: ['銀色', '黑色', '紅色'],
    features: ['安全衛士', '動態軌跡', '越野模式'],
  },
  {
    id: 103,
    title: 'Honda CR-V 2022',
    brand: 'Honda',
    model: 'CR-V',
    year: 2022,
    price: 699000,
    mileage: 52000,
    type: 'SUV',
    fuel: '汽油/油電',
    transmission: '自動',
    engine: '1.5L Turbo',
    image: '/logos/Honda CR-V 2024.png',
    city: '台中',
    colors: ['黑色', '白色', '銀色'],
    features: ['全景天窗', '智能駕駛輔助', '無線充電'],
  },
  {
    id: 104,
    title: 'Honda Accord 2021',
    brand: 'Honda',
    model: 'Accord',
    year: 2021,
    price: 799000,
    mileage: 58000,
    type: '轎車',
    fuel: '汽油',
    transmission: '自動',
    engine: '1.5L Turbo',
    image: '/logos/Honda Accord 2024.png',
    city: '台中',
    colors: ['銀色', '藍色', '黑色'],
    features: ['主動安全', '智能座艙', '運動模式'],
  },
  {
    id: 105,
    title: 'Mazda CX-5 2022',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2022,
    price: 599000,
    mileage: 48000,
    type: 'SUV',
    fuel: '汽油',
    transmission: '自動',
    engine: '2.5L',
    image: '/logos/Mazda3 2024.png',
    city: '台南',
    colors: ['紅色', '黑色', '銀色'],
    features: ['動感設計', '運動懸架', '高級配置'],
  },
  {
    id: 106,
    title: 'Mazda3 2021',
    brand: 'Mazda',
    model: 'Mazda3',
    year: 2021,
    price: 499000,
    mileage: 62000,
    type: '轎車',
    fuel: '汽油',
    transmission: '自動',
    engine: '2.0L',
    image: '/logos/Mazda3 2024.png',
    city: '高雄',
    colors: ['黑色', '紅色', '銀色'],
    features: ['i-Activsense', '人馬一體', '運動底盤'],
  },
  {
    id: 107,
    title: 'BMW 330i 2021',
    brand: 'BMW',
    model: '330i',
    year: 2021,
    price: 1490000,
    mileage: 72000,
    type: '轎車',
    fuel: '汽油',
    transmission: '自動',
    engine: '2.0L Turbo',
    image: '/logos/BMW 330i 2024.png',
    city: '台北',
    colors: ['黑色', '白色', '藍色'],
    features: ['M Sport套件', '寶馬智連', '運動懸架'],
  },
  {
    id: 108,
    title: 'BMW X3 2020',
    brand: 'BMW',
    model: 'X3',
    year: 2020,
    price: 1990000,
    mileage: 85000,
    type: 'SUV',
    fuel: '汽油',
    transmission: '自動',
    engine: '2.0L Turbo',
    image: '/logos/BMW X3 2024.png',
    city: '新北',
    colors: ['黑色', '白色', '銀色'],
    features: ['越野模式', 'xDrive四驅', '全景天窗'],
  },
  {
    id: 109,
    title: 'Mercedes-Benz A-Class 2021',
    brand: 'Mercedes-Benz',
    model: 'A-Class',
    year: 2021,
    price: 1290000,
    mileage: 68000,
    type: '轎車',
    fuel: '汽油',
    transmission: '自動',
    engine: '2.0L Turbo',
    image: '/logos/Mercedes-Benz A-Class 2024.png',
    city: '桃園',
    colors: ['白色', '黑色', '銀色'],
    features: ['AMG套件', '全景天窗', '高級音響'],
  },
  {
    id: 110,
    title: 'Mercedes-Benz C-Class 2020',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2020,
    price: 1590000,
    mileage: 78000,
    type: '轎車',
    fuel: '汽油',
    transmission: '自動',
    engine: '2.0L Turbo',
    image: '/logos/Mercedes-Benz C-Class 2024.png',
    city: '新竹',
    colors: ['白色', '黑色', '灰色'],
    features: ['MBUX智能系統', '無線充電', 'AMG外觀'],
  },
  {
    id: 111,
    title: 'Volkswagen Golf 2022',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2022,
    price: 649000,
    mileage: 45000,
    type: '掀背車',
    fuel: '汽油',
    transmission: '自動',
    engine: '1.5L TSI',
    image: '/logos/Volkswagen Golf 2024.png',
    city: '台中',
    colors: ['白色', '黑色', '銀色'],
    features: ['MQB平台', '智能駕駛', '數位儀表'],
  },
  {
    id: 112,
    title: 'Volkswagen Tiguan 2021',
    brand: 'Volkswagen',
    model: 'Tiguan',
    year: 2021,
    price: 849000,
    mileage: 55000,
    type: 'SUV',
    fuel: '汽油',
    transmission: '自動',
    engine: '1.4L TSI',
    image: '/logos/Volkswagen Tiguan 2024.png',
    city: '高雄',
    colors: ['黑色', '白色', '銀色'],
    features: ['4Motion四驅', '越野模式', '全景天窗'],
  },
];

/**
 * 按類型分類的便利函數
 */
export function getInitialListings() {
  return ALL_CARS.filter(car => car.id <= 100);
}

export function getUsedCars() {
  return ALL_CARS.filter(car => car.id >= 101);
}

export function getNewCars() {
  // 目前沒有新車數據，可根據需要添加
  return [];
}

export function getCarById(id) {
  return ALL_CARS.find(car => car.id === id);
}

/**
 * 獲取唯一值集合
 */
export function getUniqueBrands(cars = ALL_CARS) {
  return ['全部', ...new Set(cars.map(car => car.brand))];
}

export function getUniqueCities(cars = ALL_CARS) {
  return ['全部', ...new Set(cars.map(car => car.city))];
}

export function getUniqueTypes(cars = ALL_CARS) {
  return ['全部', ...new Set(cars.map(car => car.type))];
}

export function getUniqueFuels(cars = ALL_CARS) {
  return ['全部', ...new Set(cars.map(car => car.fuel))];
}
