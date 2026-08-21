// ══════════════════════════════════════════════════════
// PRONTOS PARA MORAR — data.js
// Atualizado em 21/08/2026, 14:17:27
// ══════════════════════════════════════════════════════

const CONFIG = {
  gUrl: '',
  corretorWhats: '5562999999999',
  corretorNome: 'Imóveis em Goiânia',
};

const IMOVEIS = [
  {
    id: 1,
    titulo: 'Residencial Nobile Bueno',
    subtitulo: 'Varanda gourmet e vista panorâmica',
    bairro: 'Setor Bueno',
    quartos: 3, suites: 1, area: 92, vagas: 2,
    preco: 680000,
    youtube: 'icO4WuUMMg4',
    img: '',
    galeria: [],
    grad: ['#1B5540','#2A7A5A'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento de alto padrão com 3 quartos (1 suíte máster), varanda gourmet com churrasqueira e vista para a cidade. 2 vagas cobertas. Condomínio completo com piscina aquecida, academia, salão de festas e playground.',
  },
  {
    id: 2,
    titulo: 'Marista Premium',
    subtitulo: 'Cobertura duplex com terraço privativo',
    bairro: 'Setor Marista',
    quartos: 4, suites: 2, area: 140, vagas: 3,
    preco: 950000,
    youtube: 'wb4uctT5j4Q',
    img: 'https://raw.githubusercontent.com/chaverleo1/base-inteligente/main/prontos-para-morar/fotos/foto-1787332645268.jpg',
    galeria: [],
    grad: ['#2D4B7A','#4A78B8'],
    entrega: 'Pronto para Morar',
    descricao: 'Cobertura duplex com terraço privativo de 60m², 4 suítes, living amplo com pé-direito duplo. Empreendimento de altíssimo padrão com spa, academia, concierge e segurança 24h.',
  },
  {
    id: 3,
    titulo: 'Jardim Goiás Residence',
    subtitulo: 'Localização estratégica e custo-benefício',
    bairro: 'Jardim Goiás',
    quartos: 2, suites: 1, area: 68, vagas: 1,
    preco: 420000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#5A3D8A','#8864C0'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento moderno com 2 quartos (1 suíte), sala ampliada, cozinha americana integrada. Condomínio com piscina, academia e portaria 24h. A 5 minutos do Shopping Flamboyant.',
  },
  {
    id: 4,
    titulo: 'Verde Amazônia',
    subtitulo: 'Natureza e conforto no mesmo endereço',
    bairro: 'Parque Amazônia',
    quartos: 2, suites: 0, area: 58, vagas: 1,
    preco: 350000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#2A6A4A','#48A872'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento com 2 dormitórios, sala, cozinha e área de serviço. Condomínio verde com playground, área de convivência e segurança 24h. Excelente opção de entrada ou investimento.',
  },
  {
    id: 5,
    titulo: 'Nova Suíça Tower',
    subtitulo: 'Vista livre e lazer de alto nível',
    bairro: 'Setor Nova Suíça',
    quartos: 3, suites: 1, area: 85, vagas: 2,
    preco: 580000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#1E6A8A','#30A0CC'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento com varanda, 3 quartos (1 suíte), sala com 2 ambientes e cozinha planejada. Andar alto com vista panorâmica. Condomínio com piscina, sauna e salão gourmet.',
  },
  {
    id: 6,
    titulo: 'Alphavile Premium',
    subtitulo: 'Privacidade e luxo em condomínio fechado',
    bairro: 'Alphavile Goiânia',
    quartos: 4, suites: 4, area: 220, vagas: 4,
    preco: 1200000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#8A6A1E','#C4A040'],
    entrega: 'Pronto para Morar',
    descricao: 'Casa de luxo com 4 suítes, piscina privativa, jardim paisagístico e home theater. Condomínio fechado com clube, segurança 24h e áreas de lazer exclusivas.',
  },
  {
    id: 7,
    titulo: 'Aeroporto Business Living',
    subtitulo: 'Praticidade urbana para o dia a dia',
    bairro: 'Setor Aeroporto',
    quartos: 2, suites: 1, area: 62, vagas: 1,
    preco: 380000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#484848','#787878'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento com layout inteligente, 2 dormitórios (1 suíte), sala, cozinha aberta e área de serviço. Próximo a hospitais, comércio e aeroporto. Condomínio com rooftop e coworking.',
  },
  {
    id: 8,
    titulo: 'Vila Rosa Garden',
    subtitulo: 'Apartamento térreo com jardim privativo',
    bairro: 'Vila Rosa',
    quartos: 3, suites: 1, area: 80, vagas: 2,
    preco: 520000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#8A1E5A','#C040A0'],
    entrega: 'Pronto para Morar',
    descricao: 'Raro apartamento garden térreo com área privativa de 40m², 3 quartos com suíte, sala integrada com saída para o jardim. Ideal para quem tem pets ou filhos pequenos.',
  },
  {
    id: 9,
    titulo: 'Sul Residence Classic',
    subtitulo: 'Endereço nobre próximo ao Bosque dos Buritis',
    bairro: 'Setor Sul',
    quartos: 3, suites: 2, area: 95, vagas: 2,
    preco: 620000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#2D3B6A','#1B5540'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento reformado com acabamento premium, 3 suítes, varanda, sala de TV e sala de jantar separadas. Edifício tradicional do Setor Sul, a 300m do Bosque dos Buritis.',
  },
  {
    id: 10,
    titulo: 'Leste Universitário Smart',
    subtitulo: 'Próximo à UFG e hospitais',
    bairro: 'Setor Leste Universitário',
    quartos: 3, suites: 1, area: 78, vagas: 2,
    preco: 490000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#2A4A6A','#4A7AB2'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento com 3 quartos (1 suíte), sala ampla, varanda e 2 vagas. Condomínio com academia, piscina e salão de eventos. Excelente localização para quem trabalha na região hospitalar.',
  },
  {
    id: 11,
    titulo: 'Parque Anhanguera Família',
    subtitulo: 'Espaço e lazer para toda a família',
    bairro: 'Parque Anhanguera',
    quartos: 2, suites: 0, area: 60, vagas: 1,
    preco: 315000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#3A6A1A','#5AA038'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento com 2 quartos, sala, cozinha e área de serviço em condomínio com área verde generosa. Campo de futebol society, quadra poliesportiva, piscina e playground.',
  },
  {
    id: 12,
    titulo: 'Pedro Ludovico Central',
    subtitulo: 'Localização central e funcionalidade',
    bairro: 'Setor Pedro Ludovico',
    quartos: 2, suites: 0, area: 55, vagas: 1,
    preco: 385000,
    youtube: '',
    img: '',
    galeria: [],
    grad: ['#6A2A4A','#AA4880'],
    entrega: 'Pronto para Morar',
    descricao: 'Apartamento compacto e funcional, 2 dormitórios, sala, cozinha e área de serviço. Ótimo custo-benefício para moradia ou investimento. Acesso fácil a shoppings, hospitais e transporte.',
  },
  {
    id: 13,
    titulo: 'Alphaville Araguaia',
    subtitulo: 'Sobrado novo',
    bairro: 'Alphaville',
    quartos: 5, suites: 5, area: 250, vagas: 4,
    preco: 4500000,
    youtube: 'wb4uctT5j4Q',
    img: '',
    galeria: [],
    grad: ['#2A6A4A','#48A872'],
    entrega: 'Pronto para Morar',
    descricao: 'Seu novo lar é aqui. Entre em contato.',
  },
];

function formatBRL(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR');
}

const FOTO_SEEDS = [
  '1545324418-cc1a3fa10c00','1560448204-e02f11c3d0e2','1502672260266-1c1ef2d93688',
  '1554995207-c18c203602cb','1522708323590-d24dbb6b0267','1484154218962-a197022b5858',
  '1578683010236-d716f9a3f461','1507089947368-19c1da9775ae','1493809842364-78817add7ffb',
  '1560184897-ae75f418493e','1556909114-f6e7ad7d3136','1551361415-69c87624334f',
];

function thumbUrl(imovel) {
  if (imovel.youtube) return `https://img.youtube.com/vi/${imovel.youtube}/hqdefault.jpg`;
  if (imovel.img)    return imovel.img;
  const seed = FOTO_SEEDS[(imovel.id - 1) % FOTO_SEEDS.length];
  return `https://images.unsplash.com/photo-${seed}?w=400&h=711&fit=crop&auto=format&q=80`;
}

function fotoUrl(imovelId, idx) {
  const seeds = [
    '1560448204-e02f11c3d0e2','1502672260266-1c1ef2d93688','1554995207-c18c203602cb',
    '1522708323590-d24dbb6b0267','1484154218962-a197022b5858','1578683010236-d716f9a3f461',
    '1507089947368-19c1da9775ae','1493809842364-78817add7ffb',
  ];
  const seed = seeds[(imovelId + idx) % seeds.length];
  return `https://images.unsplash.com/photo-${seed}?w=800&h=450&fit=crop&auto=format&q=80`;
}
function fotos(imovelId, n = 8) {
  return Array.from({ length: n }, (_, i) => fotoUrl(imovelId, i + 1));
}
