export interface ActivityTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  type: string;
  category: "Português" | "Matemática" | "Ciências" | "Artes" | "Geral";
  color: string;
  wallpaperUrl?: string;
  previewUrl?: string;
}

export const activityTemplates: ActivityTemplate[] = [
  {
    id: "alphabet-writing",
    title: "ABC Divertido",
    description: "Atividade de caligrafia e reconhecimento de letras.",
    icon: "🔤",
    prompt:
      "Atividade para alfabetização. Nomear figuras que comecem com as letras A, B, C, D e E.",
    type: "writing",
    category: "Português",
    color: "bg-blue-500",
    wallpaperUrl: "/wallpapers/stars.png",
  },
  {
    id: "counting-fruits",
    title: "Mestre da Contagem",
    description: "Conte as frutas e escreva o número correto.",
    icon: "🔢",
    prompt: "Atividade de contagem de 1 a 10 usando frutas coloridas.",
    type: "counting",
    category: "Matemática",
    color: "bg-green-500",
    wallpaperUrl: "/wallpapers/clouds.png",
  },
  {
    id: "wild-animals",
    title: "Mundo Animal",
    description: "Conheça os animais e seus habitats.",
    icon: "🦁",
    prompt:
      "Atividade sobre animais selvagens (Leão, Elefante, Girafa). Perguntas sobre o habitat e sons.",
    type: "multiple_choice",
    category: "Ciências",
    color: "bg-orange-500",
    wallpaperUrl: "/wallpapers/animals.png",
  },
  {
    id: "geometric-shapes",
    title: "Formas e Cores",
    description: "Identifique as formas geométricas no dia a dia.",
    icon: "📐",
    prompt: "Identificar formas geométricas básicas em objetos do dia a dia.",
    type: "image_selection",
    category: "Matemática",
    color: "bg-purple-500",
    wallpaperUrl: "/wallpapers/shapes.png",
  },
  {
    id: "coloring-kids",
    title: "Pequeno Artista",
    description: "Desenhos fofos para colorir e soltar a imaginação.",
    icon: "🎨",
    prompt:
      "Vários animais fofos para colorir: Cachorro, Gato, Coelho e Passarinho.",
    type: "pintar",
    category: "Artes",
    color: "bg-pink-500",
    wallpaperUrl: "/wallpapers/doodles.png",
  },
  {
    id: "school-life",
    title: "Dia na Escola",
    description: "Atividades sobre o cotidiano escolar.",
    icon: "🏫",
    prompt: "Atividade sobre objetos escolares e rotina na sala de aula.",
    type: "writing",
    category: "Geral",
    color: "bg-yellow-500",
    wallpaperUrl: "/wallpapers/school.png",
  },
];
