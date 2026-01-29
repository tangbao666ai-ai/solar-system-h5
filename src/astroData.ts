export type BodyKind = 'sun' | 'planet' | 'moon';

export type BodySpec = {
  id: string;
  nameZh: string;
  nameEn: string;
  kind: BodyKind;

  // Visual size (not real km): radius in scene units
  radius: number;
  color: number;

  // Orbit around parent
  parentId?: string;
  semiMajorAxis?: number; // distance in scene units
  periodDays?: number; // orbital period, for animation
  inclinationDeg?: number; // tilt of orbit plane

  // info
  facts?: string[];
};

// 科普演示：简化比例 + 主要卫星
export const BODIES: BodySpec[] = [
  {
    id: 'sun', nameZh: '太阳', nameEn: 'Sun', kind: 'sun',
    radius: 6.5, color: 0xffcc33,
    facts: ['太阳系的中心恒星', '质量约占太阳系总质量的 99.86%']
  },

  // Planets (distance/size are purely for visualization)
  { id: 'mercury', nameZh: '水星', nameEn: 'Mercury', kind: 'planet', radius: 1.0, color: 0xa7a7a7, parentId: 'sun', semiMajorAxis: 14, periodDays: 88, inclinationDeg: 7.0,
    facts: ['最靠近太阳', '公转周期约 88 天'] },
  { id: 'venus', nameZh: '金星', nameEn: 'Venus', kind: 'planet', radius: 1.4, color: 0xe3c17a, parentId: 'sun', semiMajorAxis: 19, periodDays: 224.7, inclinationDeg: 3.4,
    facts: ['最亮的行星之一', '大气以二氧化碳为主'] },
  { id: 'earth', nameZh: '地球', nameEn: 'Earth', kind: 'planet', radius: 1.5, color: 0x4ea1ff, parentId: 'sun', semiMajorAxis: 25, periodDays: 365.25, inclinationDeg: 0.0,
    facts: ['目前已知唯一存在生命的行星', '公转周期约 365 天'] },
  { id: 'mars', nameZh: '火星', nameEn: 'Mars', kind: 'planet', radius: 1.2, color: 0xd07a5a, parentId: 'sun', semiMajorAxis: 32, periodDays: 687, inclinationDeg: 1.85,
    facts: ['“红色星球”', '拥有两颗小卫星'] },
  { id: 'jupiter', nameZh: '木星', nameEn: 'Jupiter', kind: 'planet', radius: 3.8, color: 0xd9b38c, parentId: 'sun', semiMajorAxis: 45, periodDays: 4332.6, inclinationDeg: 1.3,
    facts: ['太阳系最大行星', '著名的大红斑'] },
  { id: 'saturn', nameZh: '土星', nameEn: 'Saturn', kind: 'planet', radius: 3.2, color: 0xe7d3a6, parentId: 'sun', semiMajorAxis: 58, periodDays: 10759.2, inclinationDeg: 2.5,
    facts: ['拥有显著的光环', '密度低于水'] },
  { id: 'uranus', nameZh: '天王星', nameEn: 'Uranus', kind: 'planet', radius: 2.5, color: 0x9fe6ff, parentId: 'sun', semiMajorAxis: 70, periodDays: 30688.5, inclinationDeg: 0.8,
    facts: ['自转轴倾角很大（“躺着转”）', '呈蓝绿色'] },
  { id: 'neptune', nameZh: '海王星', nameEn: 'Neptune', kind: 'planet', radius: 2.5, color: 0x3d6bff, parentId: 'sun', semiMajorAxis: 82, periodDays: 60182, inclinationDeg: 1.8,
    facts: ['距离太阳最远的行星（八大行星）', '强风暴活动'] },

  // Major moons (kept small and few)
  { id: 'moon', nameZh: '月球', nameEn: 'Moon', kind: 'moon', radius: 0.55, color: 0xcfcfcf, parentId: 'earth', semiMajorAxis: 3.2, periodDays: 27.3, inclinationDeg: 5.1,
    facts: ['地球唯一的天然卫星'] },

  { id: 'phobos', nameZh: '火卫一', nameEn: 'Phobos', kind: 'moon', radius: 0.18, color: 0xb9a18f, parentId: 'mars', semiMajorAxis: 2.3, periodDays: 0.319, inclinationDeg: 1.1 },
  { id: 'deimos', nameZh: '火卫二', nameEn: 'Deimos', kind: 'moon', radius: 0.12, color: 0xb9a18f, parentId: 'mars', semiMajorAxis: 3.2, periodDays: 1.263, inclinationDeg: 0.9 },

  { id: 'io', nameZh: '木卫一', nameEn: 'Io', kind: 'moon', radius: 0.34, color: 0xffd27a, parentId: 'jupiter', semiMajorAxis: 4.8, periodDays: 1.769, inclinationDeg: 0.0 },
  { id: 'europa', nameZh: '木卫二', nameEn: 'Europa', kind: 'moon', radius: 0.30, color: 0xd9f0ff, parentId: 'jupiter', semiMajorAxis: 6.2, periodDays: 3.551, inclinationDeg: 0.1 },
  { id: 'ganymede', nameZh: '木卫三', nameEn: 'Ganymede', kind: 'moon', radius: 0.40, color: 0xbfd0d9, parentId: 'jupiter', semiMajorAxis: 8.2, periodDays: 7.155, inclinationDeg: 0.2 },
  { id: 'callisto', nameZh: '木卫四', nameEn: 'Callisto', kind: 'moon', radius: 0.38, color: 0x9aa2aa, parentId: 'jupiter', semiMajorAxis: 10.2, periodDays: 16.689, inclinationDeg: 0.3 },

  { id: 'titan', nameZh: '泰坦', nameEn: 'Titan', kind: 'moon', radius: 0.42, color: 0xe0b27a, parentId: 'saturn', semiMajorAxis: 7.8, periodDays: 15.945, inclinationDeg: 0.3,
    facts: ['土星最大卫星', '拥有稠密大气层'] },
  { id: 'enceladus', nameZh: '土卫二', nameEn: 'Enceladus', kind: 'moon', radius: 0.20, color: 0xe8f7ff, parentId: 'saturn', semiMajorAxis: 5.0, periodDays: 1.37, inclinationDeg: 0.0,
    facts: ['冰卫星，可能存在地下海洋'] },

  { id: 'titania', nameZh: '天卫三', nameEn: 'Titania', kind: 'moon', radius: 0.26, color: 0xc8c8c8, parentId: 'uranus', semiMajorAxis: 4.6, periodDays: 8.706, inclinationDeg: 0.1 },
  { id: 'oberon', nameZh: '天卫四', nameEn: 'Oberon', kind: 'moon', radius: 0.25, color: 0xb0b0b0, parentId: 'uranus', semiMajorAxis: 6.0, periodDays: 13.463, inclinationDeg: 0.1 },

  { id: 'triton', nameZh: '海卫一', nameEn: 'Triton', kind: 'moon', radius: 0.34, color: 0xd6d6ff, parentId: 'neptune', semiMajorAxis: 5.6, periodDays: 5.877, inclinationDeg: 0.0,
    facts: ['逆行轨道（现实中）'] }
];

export const byId = new Map(BODIES.map(b => [b.id, b] as const));
