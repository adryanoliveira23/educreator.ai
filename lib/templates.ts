export interface ActivityTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  type: string;
  category: "Português" | "Matemática" | "Ciências" | "Artes" | "Geral";
  color: string;
  grade: string;
  wallpaperUrl?: string;
  previewUrl?: string;
}

export const activityTemplates: ActivityTemplate[] = [
  {
    id: "bear-theme",
    title: "Ursinho Amigo",
    description: "Atividade fofa com o tema de ursinho que as crianças adoram!",
    icon: "🧸",
    prompt:
      "Atividade lúdica para Educação Infantil com o tema de ursos e floresta.",
    type: "writing",
    category: "Geral",
    grade: "Educação Infantil",
    color: "bg-amber-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1559440666-374fa0770281?q=80&w=1000&auto=format&fit=crop",
    previewUrl:
      "https://images.unsplash.com/photo-1559440666-374fa0770281?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "alphabet-writing",
    title: "Meu Primeiro ABC",
    description:
      "Vamos aprender a escrever as letras de um jeito super divertido!",
    icon: "🔤",
    prompt:
      "Atividade para alfabetização. Nomear figuras que comecem com as letras A, B, C, D e E com exercícios de caligrafia.",
    type: "writing",
    category: "Português",
    grade: "Educação Infantil",
    color: "bg-blue-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000&auto=format&fit=crop",
    previewUrl:
      "https://images.unsplash.com/photo-1564410267841-915d1e3d3032?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "counting-fruits",
    title: "Frutinhas Matemáticas",
    description: "Conte as frutas coloridas e aprenda os números brincando!",
    icon: "🍎",
    prompt:
      "Atividade de contagem de 1 a 10 usando frutas coloridas e desenhos fofos.",
    type: "counting",
    category: "Matemática",
    grade: "Educação Infantil",
    color: "bg-green-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1000&auto=format&fit=crop",
    previewUrl:
      "https://images.unsplash.com/photo-1610348733789-d03d30aed069?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "wild-animals",
    title: "Aventuras na Selva",
    description:
      "Quem mora na floresta? Vamos descobrir os segredos dos animais!",
    icon: "🦁",
    prompt:
      "Atividade lúdica sobre animais selvagens (Leão, Elefante, Girafa). Perguntas sobre o habitat e sons.",
    type: "multiple_choice",
    category: "Ciências",
    grade: "1º e 2º Ano",
    color: "bg-orange-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1519066629447-267fffa62d4b?q=80&w=1000&auto=format&fit=crop",
    previewUrl:
      "https://images.unsplash.com/photo-1546027658-e536cc356223?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "geometric-shapes",
    title: "Detetive das Formas",
    description: "Onde está o círculo? Ache as formas no mundo real!",
    icon: "📐",
    prompt:
      "Identificar formas geométricas básicas em objetos do dia a dia com ilustrações coloridas.",
    type: "image_selection",
    category: "Matemática",
    grade: "1º Ano",
    color: "bg-purple-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1563456801-628d052a6136?q=80&w=1000&auto=format&fit=crop",
    previewUrl:
      "https://images.unsplash.com/photo-1596466607760-42f270ee90f1?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "coloring-kids",
    title: "Clube das Cores",
    description: "Solte a imaginação com desenhos mágicos para colorir!",
    icon: "🎨",
    prompt:
      "Vários animais fofos em linha preta e branca para colorir: Cachorro, Gato e Coelho.",
    type: "pintar",
    category: "Artes",
    grade: "Todas as idades",
    color: "bg-pink-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
    previewUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "school-life",
    title: "Missão Escola",
    description: "Tudo o que você mais gosta no seu dia a dia na sala de aula!",
    icon: "🏫",
    prompt:
      "Atividade sobre objetos escolares e rotina na sala de aula com desenhos divertidos.",
    type: "writing",
    category: "Geral",
    grade: "1º ao 3º Ano",
    color: "bg-yellow-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1000&auto=format&fit=crop",
    previewUrl:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1000&auto=format&fit=crop",
  },
];
