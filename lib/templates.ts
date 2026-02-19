export interface ActivityTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  type: string;
  category: "Português" | "Matemática" | "Ciências" | "Artes" | "Geral";
  color: string;
}

export const activityTemplates: ActivityTemplate[] = [
  {
    id: "alphabet-writing",
    title: "Aprenda o Alfabeto",
    description:
      "Atividade de escrita para praticar letras e nomes de objetos.",
    icon: "🔤",
    prompt:
      "Atividade para alfabetização. Nomear figuras que comecem com as letras A, B, C, D e E.",
    type: "writing",
    category: "Português",
    color: "bg-blue-500",
  },
  {
    id: "counting-fruits",
    title: "Mestre da Contagem",
    description: "Conte as frutas e escreva o número correto nos espaços.",
    icon: "🔢",
    prompt: "Atividade de contagem de 1 a 10 usando frutas coloridas.",
    type: "counting",
    category: "Matemática",
    color: "bg-green-500",
  },
  {
    id: "wild-animals",
    title: "Animais Selvagens",
    description: "Identifique e aprenda curiosidades sobre animais da selva.",
    icon: "🦁",
    prompt:
      "Atividade sobre animais selvagens (Leão, Elefante, Girafa). Perguntas sobre o habitat e sons.",
    type: "multiple_choice",
    category: "Ciências",
    color: "bg-orange-500",
  },
  {
    id: "geometric-shapes",
    title: "Formas Geométricas",
    description: "Identifique círculos, quadrados, triângulos e retângulos.",
    icon: "📐",
    prompt: "Identificar formas geométricas básicas em objetos do dia a dia.",
    type: "image_selection",
    category: "Matemática",
    color: "bg-purple-500",
  },
  {
    id: "human-body",
    title: "O Corpo Humano",
    description: "Relacione os nomes às partes corretas do corpo.",
    icon: "🧑",
    prompt: "Partes do corpo humano: Cabeça, Ombro, Joelho e Pé.",
    type: "matching",
    category: "Ciências",
    color: "bg-red-500",
  },
  {
    id: "nature-completion",
    title: "Ciclo da Natureza",
    description:
      "Complete as palavras relacionadas à natureza e meio ambiente.",
    icon: "🌿",
    prompt:
      "Palavras relacionadas a plantas, sol, água e terra para completar letras faltantes.",
    type: "completion",
    category: "Ciências",
    color: "bg-teal-500",
  },
  {
    id: "coloring-animals",
    title: "Hora de Pintar",
    description: "Desenhos de animais prontos para colorir e se divertir.",
    icon: "🎨",
    prompt:
      "Vários animais fofos para colorir: Cachorro, Gato, Coelho e Passarinho.",
    type: "pintar",
    category: "Artes",
    color: "bg-pink-500",
  },
];
