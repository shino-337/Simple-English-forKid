// Mock categories
export const categories = [
  {
    id: 'cat-1',
    name: 'COLORS',
    description: 'Learn all about beautiful colors!',
    imageUrl: 'https://img.freepik.com/free-vector/rainbow-watercolor-background_125540-151.jpg',
    wordCount: 8,
    difficulty: 'beginner'
  },
  {
    id: 'cat-2',
    name: 'TRANSPORTATION',
    description: 'Discover how people move around!',
    imageUrl: 'https://img.freepik.com/free-vector/transport-vehicles-cartoon-set-isolated_1284-41943.jpg',
    wordCount: 8,
    difficulty: 'intermediate'
  },
  {
    id: 'cat-3',
    name: 'ANIMALS',
    description: 'Meet our furry and feathery friends!',
    imageUrl: 'https://img.freepik.com/free-vector/sticker-set-cute-cartoon-animals_1308-104633.jpg',
    wordCount: 8,
    difficulty: 'beginner'
  },
  {
    id: 'cat-4',
    name: 'EMOTIONS',
    description: 'Express how you feel!',
    imageUrl: 'https://img.freepik.com/free-vector/cute-emoji-collection_23-2149105572.jpg',
    wordCount: 8,
    difficulty: 'intermediate'
  }
];

// Mock words for each category
export const words = {
  'cat-1': [
    {
      id: 'word-c1-1',
      word: 'Red',
      meaning: 'The color of blood, roses, and fire',
      examples: ['The apple is red', 'I like the red dress', 'Stop when you see a red light'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-red-square-background_1077-21807.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c1-2',
      word: 'Blue',
      meaning: 'The color of the sky and the ocean',
      examples: ['The sky is blue', 'I have blue eyes', 'She painted the room blue'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-blue-geometric-shapes-background_1035-17545.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c1-3',
      word: 'Green',
      meaning: 'The color of grass, leaves, and plants',
      examples: ['The grass is green', 'I like green apples', 'Let\'s go when the light turns green'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-green-background-with-fluid-shapes_1393-335.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c1-4',
      word: 'Yellow',
      meaning: 'The color of the sun, bananas, and lemons',
      examples: ['The sun is yellow', 'I have a yellow pencil', 'The banana is yellow'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-yellow-comic-zoom_1409-923.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c1-5',
      word: 'Purple',
      meaning: 'The color of grapes, lavender, and eggplants',
      examples: ['The grapes are purple', 'I like purple flowers', 'She wore a purple hat'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-purple-background-with-geometric-shape_1393-336.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c1-6',
      word: 'Orange',
      meaning: 'The color of carrots, pumpkins, and oranges',
      examples: ['The carrot is orange', 'I like orange juice', 'The sunset turned the sky orange'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-orange-background-with-liquid-forms_1393-316.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c1-7',
      word: 'Brown',
      meaning: 'The color of chocolate, wood, and soil',
      examples: ['The tree trunk is brown', 'I have brown hair', 'The dog has brown fur'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-luxury-brown-background_1053-157.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c1-8',
      word: 'Pink',
      meaning: 'A light reddish color, like cotton candy',
      examples: ['The flower is pink', 'I like pink cupcakes', 'She has a pink dress'],
      imageUrl: 'https://img.freepik.com/free-vector/abstract-pink-fluid-background_1393-331.jpg',
      audioUrl: ''
    }
  ],
  'cat-2': [
    {
      id: 'word-c2-1',
      word: 'Car',
      meaning: 'A vehicle with four wheels that people drive',
      examples: ['I go to school by car', 'My dad has a red car', 'The car is in the garage'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-blue-sedan-car-cartoon-icon-illustration_138676-2116.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c2-2',
      word: 'Bus',
      meaning: 'A large vehicle that carries many passengers',
      examples: ['I take the bus to school', 'The bus stops here', 'We waited for the bus'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-school-bus-cartoon-icon-illustration_138676-2095.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c2-3',
      word: 'Train',
      meaning: 'A connected line of vehicles that runs on tracks',
      examples: ['The train is very fast', 'We traveled by train', 'The train leaves at 5 PM'],
      imageUrl: 'https://img.freepik.com/free-vector/illustration-train-riding-through-city_52683-22682.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c2-4',
      word: 'Bicycle',
      meaning: 'A two-wheeled vehicle that you pedal',
      examples: ['I ride my bicycle every day', 'She got a new bicycle', 'The bicycle has two wheels'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-girl-riding-bicycle-cartoon-illustration_138676-2714.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c2-5',
      word: 'Airplane',
      meaning: 'A flying vehicle with wings and engines',
      examples: ['We traveled by airplane', 'The airplane flies in the sky', 'I can see an airplane!'],
      imageUrl: 'https://img.freepik.com/free-vector/airplane-sky_1308-31244.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c2-6',
      word: 'Ship',
      meaning: 'A large boat that carries people or goods on the sea',
      examples: ['The ship sails across the ocean', 'We took a ship to the island', 'The ship is huge'],
      imageUrl: 'https://img.freepik.com/free-vector/cruise-ship-sunset-ocean-wave_107791-13242.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c2-7',
      word: 'Helicopter',
      meaning: 'A flying vehicle with rotating blades on top',
      examples: ['The helicopter flew over the city', 'The police used a helicopter', 'Look at the helicopter!'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-helicopter-air-cartoon-icon-illustration_138676-2260.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c2-8',
      word: 'Rocket',
      meaning: 'A vehicle that travels into space',
      examples: ['The rocket went to the moon', 'The rocket launched yesterday', 'Astronauts ride in rockets'],
      imageUrl: 'https://img.freepik.com/free-vector/spaceship-rocket-cartoon-icon-illustration_138676-2123.jpg',
      audioUrl: ''
    }
  ],
  'cat-3': [
    {
      id: 'word-c3-1',
      word: 'Dog',
      meaning: 'A furry pet that barks and wags its tail',
      examples: ['I have a pet dog', 'The dog likes to play fetch', 'Dogs are friendly animals'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-corgi-dog-waving-paw-cartoon-illustration_138676-2255.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c3-2',
      word: 'Cat',
      meaning: 'A furry pet that meows and purrs',
      examples: ['The cat sleeps on the sofa', 'My cat likes to play with yarn', 'Cats can jump high'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-cat-with-fish-cartoon-illustration_138676-3011.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c3-3',
      word: 'Elephant',
      meaning: 'A very large gray animal with a long trunk',
      examples: ['The elephant has big ears', 'Elephants live in Africa and Asia', 'The elephant sprayed water with its trunk'],
      imageUrl: 'https://img.freepik.com/free-vector/sticker-design-elephant-white-background_1308-61417.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c3-4',
      word: 'Lion',
      meaning: 'A large wild cat with a mane, known as the king of the jungle',
      examples: ['The lion roared loudly', 'Lions live in Africa', 'The lion has a big mane'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-lion-cartoon-illustration_138676-2878.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c3-5',
      word: 'Fish',
      meaning: 'An animal that lives in water and has fins and a tail',
      examples: ['Fish swim in the water', 'I saw a colorful fish', 'Fish have scales'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-blue-fish-cartoon-character_1308-109778.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c3-6',
      word: 'Bird',
      meaning: 'An animal with feathers, wings, and a beak that can usually fly',
      examples: ['The bird is singing', 'Birds build nests', 'I saw a bird flying in the sky'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-blue-bird-cartoon-illustration_138676-2918.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c3-7',
      word: 'Monkey',
      meaning: 'A clever animal with a long tail that lives in trees',
      examples: ['The monkey swings from trees', 'Monkeys eat bananas', 'The monkey is climbing'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-monkey-with-banana-cartoon-illustration_138676-2576.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c3-8',
      word: 'Butterfly',
      meaning: 'An insect with colorful wings that flies from flower to flower',
      examples: ['The butterfly has beautiful wings', 'Butterflies like flowers', 'I caught a butterfly'],
      imageUrl: 'https://img.freepik.com/free-vector/cute-butterfly-cartoon-illustration_138676-2264.jpg',
      audioUrl: ''
    }
  ],
  'cat-4': [
    {
      id: 'word-c4-1',
      word: 'Happy',
      meaning: 'Feeling or showing pleasure and joy',
      examples: ['I am happy to see you', 'She has a happy smile', 'We had a happy day at the park'],
      imageUrl: 'https://img.freepik.com/free-vector/emoji-with-big-smile_1308-135937.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c4-2',
      word: 'Sad',
      meaning: 'Feeling or showing unhappiness or sorrow',
      examples: ['He looks sad today', 'I feel sad when it rains', 'The movie had a sad ending'],
      imageUrl: 'https://img.freepik.com/free-vector/sad-emoji-face-with-tear_1308-135916.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c4-3',
      word: 'Angry',
      meaning: 'Feeling or showing strong annoyance or displeasure',
      examples: ['The boy is angry about his broken toy', 'Don\'t be angry with me', 'She had an angry face'],
      imageUrl: 'https://img.freepik.com/free-vector/angry-emoji-face_1308-128952.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c4-4',
      word: 'Surprised',
      meaning: 'Feeling or showing shock or amazement',
      examples: ['I was surprised by the gift', 'He had a surprised look', 'We threw a surprised party'],
      imageUrl: 'https://img.freepik.com/free-vector/surprised-emoji-with-exploding-head_1308-129937.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c4-5',
      word: 'Scared',
      meaning: 'Feeling or showing fear or being frightened',
      examples: ['The child is scared of the dark', 'I was scared by the loud noise', 'Don\'t be scared'],
      imageUrl: 'https://img.freepik.com/free-vector/scared-emoji-face_1308-129842.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c4-6',
      word: 'Tired',
      meaning: 'Feeling or showing a need for rest or sleep',
      examples: ['I am tired after running', 'She looks tired today', 'The tired boy went to bed early'],
      imageUrl: 'https://img.freepik.com/free-vector/tired-emoji-with-sleeping-eyes_1308-129817.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c4-7',
      word: 'Excited',
      meaning: 'Feeling or showing great enthusiasm and eagerness',
      examples: ['The children are excited about Christmas', 'I\'m so excited for the party', 'She had an excited voice'],
      imageUrl: 'https://img.freepik.com/free-vector/party-emoji-with-confetti_1308-135921.jpg',
      audioUrl: ''
    },
    {
      id: 'word-c4-8',
      word: 'Confused',
      meaning: 'Feeling or showing uncertainty or being unclear about something',
      examples: ['The student was confused by the question', 'I\'m confused about the directions', 'He had a confused look'],
      imageUrl: 'https://img.freepik.com/free-vector/confused-emoji-face_1308-25437.jpg',
      audioUrl: ''
    }
  ]
}; 