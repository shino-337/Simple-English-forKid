const mongoose = require('mongoose');
const Category = require('../models/Category');
const Word = require('../models/Word');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@mongodb:27017/english-learning-app?authSource=admin';

// Helper function to generate media URLs
const generateMediaUrls = (word, category) => {
  const baseImageUrl = '/uploads/images/';
  const baseAudioUrl = '/uploads/audio/';
  
  return {
    imageUrl: `${baseImageUrl}${category.toLowerCase()}-${word.toLowerCase()}.jpg`,
    audioUrl: `${baseAudioUrl}${category.toLowerCase()}-${word.toLowerCase()}.mp3`
  };
};

// Helper function to generate pronunciation
const generatePronunciation = (word) => {
  // Simple mapping for common sounds
  const pronunciationMap = {
    'Dog': 'dɒɡ',
    'Cat': 'kæt',
    'Rabbit': 'ˈræbɪt',
    'Elephant': 'ˈelɪfənt',
    'Lion': 'ˈlaɪən',
    'Sun': 'sʌn',
    'Cloud': 'klaʊd',
    'Flower': 'ˈflaʊər',
    'Rain': 'reɪn',
    'Mom': 'mɒm',
    'Dad': 'dæd',
    'Baby': 'ˈbeɪbi',
    'House': 'haʊs',
    'Bed': 'bed',
    'Apple': 'ˈæpl',
    'Banana': 'bəˈnɑːnə',
    'Milk': 'mɪlk',
    'Cake': 'keɪk',
    'Pizza': 'ˈpiːtsə',
    'Shirt': 'ʃɜːt',
    'Pants': 'pænts',
    'Hat': 'hæt',
    'Shoes': 'ʃuːz',
    'Socks': 'sɒks',
    'Red': 'red',
    'Blue': 'bluː',
    'Yellow': 'ˈjeləʊ',
    'Green': 'ɡriːn',
    'Pink': 'pɪŋk'
  };

  return pronunciationMap[word] || word.toLowerCase();
};

const demoCategories = [
  {
    name: 'ANIMALS',
    description: 'Learn about different animals and their characteristics',
    icon: '🐾',
    difficulty: 'beginner'
  },
  {
    name: 'NATURE',
    description: 'Explore the natural world around us',
    icon: '🌿',
    difficulty: 'beginner'
  },
  {
    name: 'HOME & FAMILY',
    description: 'Learn about family members and things at home',
    icon: '👨‍👩‍👧‍👦',
    difficulty: 'beginner'
  },
  {
    name: 'FOOD & DRINKS',
    description: 'Discover different foods and beverages',
    icon: '🍽️',
    difficulty: 'beginner'
  },
  {
    name: 'CLOTHES',
    description: 'Learn about different types of clothing',
    icon: '👕',
    difficulty: 'beginner'
  },
  {
    name: 'COLORS',
    description: 'Learn basic colors and their uses',
    icon: '🎨',
    difficulty: 'beginner'
  }
];

const demoWords = {
  'ANIMALS': [
    { word: 'Dog', meaning: 'A friendly pet animal that barks', example: 'The dog plays in the garden.' },
    { word: 'Cat', meaning: 'A small pet animal that meows', example: 'The cat sleeps on the sofa.' },
    { word: 'Rabbit', meaning: 'A small animal with long ears', example: 'The rabbit hops in the field.' },
    { word: 'Elephant', meaning: 'A very large animal with a long trunk', example: 'The elephant sprays water with its trunk.' },
    { word: 'Lion', meaning: 'A large wild cat, known as the king of the jungle', example: 'The lion roars loudly.' }
  ],
  'NATURE': [
    { word: 'Sun', meaning: 'The bright star that gives us light and heat', example: 'The sun rises in the east.' },
    { word: 'Cloud', meaning: 'White or gray shapes in the sky', example: 'The clouds look like cotton.' },
    { word: 'Flower', meaning: 'The colorful part of a plant', example: 'The flower smells sweet.' },
    { word: 'Rain', meaning: 'Water that falls from clouds', example: 'The rain makes everything wet.' }
  ],
  'HOME & FAMILY': [
    { word: 'Mom', meaning: 'A female parent', example: 'Mom cooks dinner for us.' },
    { word: 'Dad', meaning: 'A male parent', example: 'Dad drives me to school.' },
    { word: 'Baby', meaning: 'A very young child', example: 'The baby is sleeping.' },
    { word: 'House', meaning: 'A building where people live', example: 'Our house is big.' },
    { word: 'Bed', meaning: 'Furniture used for sleeping', example: 'I sleep in my bed.' }
  ],
  'FOOD & DRINKS': [
    { word: 'Apple', meaning: 'A round fruit that can be red or green', example: 'I eat an apple every day.' },
    { word: 'Banana', meaning: 'A long yellow fruit', example: 'Monkeys love bananas.' },
    { word: 'Milk', meaning: 'A white drink that comes from cows', example: 'I drink milk for breakfast.' },
    { word: 'Cake', meaning: 'A sweet baked dessert', example: 'We eat cake on birthdays.' },
    { word: 'Pizza', meaning: 'A round flat bread with toppings', example: 'Pizza is my favorite food.' }
  ],
  'CLOTHES': [
    { word: 'Shirt', meaning: 'A piece of clothing worn on the upper body', example: 'I wear a blue shirt.' },
    { word: 'Pants', meaning: 'Clothing worn on the legs', example: 'These pants are too long.' },
    { word: 'Hat', meaning: 'Something worn on the head', example: 'The hat protects me from the sun.' },
    { word: 'Shoes', meaning: 'Footwear to protect feet', example: 'My shoes are black.' },
    { word: 'Socks', meaning: 'Clothing worn on feet inside shoes', example: 'I wear white socks.' }
  ],
  'COLORS': [
    { word: 'Red', meaning: 'The color of blood or fire', example: 'The apple is red.' },
    { word: 'Blue', meaning: 'The color of the sky or ocean', example: 'The sky is blue.' },
    { word: 'Yellow', meaning: 'The color of the sun or bananas', example: 'The sun is yellow.' },
    { word: 'Green', meaning: 'The color of grass or leaves', example: 'The grass is green.' },
    { word: 'Pink', meaning: 'A light red color', example: 'The flower is pink.' }
  ]
};

const createDemoWords = (categoryId, words, categoryName) => {
  return words.map(word => {
    const mediaUrls = generateMediaUrls(word.word, categoryName);
    return {
      word: word.word,
      meaning: word.meaning,
      pronunciation: generatePronunciation(word.word),
      example: word.example,
      imageUrl: mediaUrls.imageUrl,
      audioUrl: mediaUrls.audioUrl,
      category: categoryId,
      difficulty: 'beginner',
      examples: [
        {
          sentence: word.example,
          translation: word.example // In a real app, you'd have translations
        },
        {
          sentence: `This is another example with "${word.word.toLowerCase()}"`,
          translation: `This is another example with "${word.word.toLowerCase()}"`
        }
      ]
    };
  });
};

const seedDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Word.deleteMany({});
    console.log('Cleared existing data');

    // Create categories and their words
    for (const categoryData of demoCategories) {
      const category = await Category.create(categoryData);
      console.log(`Created category: ${category.name}`);

      const words = createDemoWords(category._id, demoWords[category.name], category.name);
      await Word.insertMany(words);
      console.log(`Added ${words.length} words to ${category.name}`);
    }

    console.log('Demo data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDemoData();
}

module.exports = {
  demoWords,
  demoCategories
}; 