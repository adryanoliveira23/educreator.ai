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
  {
    id: "matching-letters",
    title: "Ligar Letras Iniciais",
    description: "Ligue os desenhos às suas letras iniciais correspondentes!",
    icon: "🔗",
    prompt:
      "Atividade de ligar (matching). De um lado, desenhos de objetos simples (Abelha, Bola, Casa, Dado, Elefante). Do outro, as letras iniciais (A, B, C, D, E) embaralhadas para ligar.",
    type: "matching",
    category: "Português",
    grade: "Educação Infantil",
    color: "bg-indigo-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "count-letters",
    title: "Contagem de Letras",
    description: "Conte quantas letras tem cada palavra e escreva o número!",
    icon: "🔢",
    prompt:
      "Atividade de contagem de letras. Apresente figuras de animais simples (Gato, Cachorro, Peixe) com o nome escrito ao lado. A criança deve contar as letras e colocar o total em um quadradinho.",
    type: "counting",
    category: "Português",
    grade: "Educação Infantil",
    color: "bg-emerald-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1502086223501-7ea244305481?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "word-completion",
    title: "Completar Palavras",
    description:
      "Descubra a letra que falta para completar o nome das figuras!",
    icon: "✏️",
    prompt:
      "Atividade de completar palavras (completion). Figuras simples como BOLA, CASA, DADO, FADA, GATO. Algumas letras devem estar faltando (ex: B _ L A) para a criança preencher.",
    type: "completion",
    category: "Português",
    grade: "Educação Infantil",
    color: "bg-cyan-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "syllable-challenge",
    title: "Desafio Silábico",
    description:
      "Separe as palavras em pedacinhos (sílabas) e aprenda brincando!",
    icon: "📦",
    prompt:
      "Atividade de divisão silábica. Apresente figuras e peça para separar as sílabas com tracinhos (ex: CA-SA, BO-NE-CA). Use palavras simples de 2 e 3 sílabas.",
    type: "writing",
    category: "Português",
    grade: "1º Ano",
    color: "bg-teal-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "kid-addition",
    title: "Adição Divertida",
    description: "Vamos somar as figuras e descobrir o resultado final!",
    icon: "➕",
    prompt:
      "Atividade de adição simples usando desenhos. Ex: 2 maçãs + 3 maçãs = ?. Represente visualmente com desenhos fofos para facilitar a contagem.",
    type: "counting",
    category: "Matemática",
    grade: "Educação Infantil",
    color: "bg-rose-500",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "text-production-toys",
    title: "Escritor de Brinquedos",
    description:
      "Observe a cena, identifique os brinquedos e crie uma história incrível!",
    icon: "🧸",
    prompt:
      "Produção de texto. Apresente uma imagem fofa de crianças brincando. Primeiro, peça para a criança escrever o nome de 4 brinquedos que ela vê. Depois, peça para escrever uma pequena história sobre uma das brincadeiras da imagem.",
    type: "writing",
    category: "Português",
    grade: "1º ao 3º Ano",
    color: "bg-amber-600",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "my-favorite-book",
    title: "Meu Livro Preferido",
    description: "Conte para a gente tudo sobre o seu livro favorito!",
    icon: "📖",
    prompt:
      "Atividade 'Meu Livro Preferido'. Perguntas: a) Título do livro? b) Tema do livro? c) Personagem principal? d) Onde se passa a história? e) Parte que mais gostou? f) Como termina a história? Ao final, espaço para um pequeno texto sobre o livro acompanhado de uma ilustração de uma criança lendo.",
    type: "writing",
    category: "Português",
    grade: "1º ao 5º Ano",
    color: "bg-indigo-600",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "text-production-notebook",
    title: "Diário de Histórias",
    description:
      "Um caderno inteirinho para você soltar a imaginação e escrever muito!",
    icon: "📓",
    prompt:
      "Crie uma capa lúdica para um 'Caderno de Produção de Textos' com espaço para nome, professora, data e turma. Inclua um desenho grande para colorir de duas crianças lendo juntas em um banco de jardim com um cachorrinho.",
    type: "writing",
    category: "Português",
    grade: "Todas as idades",
    color: "bg-slate-700",
    wallpaperUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop",
  },
];
