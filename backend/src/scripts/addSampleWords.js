const mongoose = require('mongoose');
const Category = require('../models/Category');
const Word = require('../models/Word');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@mongodb:27017/english-learning-app?authSource=admin';

// Sample words for different categories
const sampleWords = {
  'ANIMALS': [
    {
      word: 'Lion',
      translation: 'Sư tử',
      meaning: 'A large wild cat with a mane, known as the king of the jungle',
      difficulty: 'medium',
      examples: [
        { sentence: 'The lion is the king of the jungle', translation: 'Sư tử là chúa tể rừng xanh' },
        { sentence: 'I saw a lion at the zoo', translation: 'Tôi đã thấy một con sư tử ở sở thú' }
      ]
    },
    {
      word: 'Elephant',
      translation: 'Con voi',
      meaning: 'A very large animal with a long trunk and tusks',
      difficulty: 'easy',
      examples: [
        { sentence: 'The elephant has a long trunk', translation: 'Con voi có một cái vòi dài' },
        { sentence: 'Elephants are very intelligent', translation: 'Voi rất thông minh' }
      ]
    }
  ],
  'COLORS': [
    {
      word: 'Red',
      translation: 'Màu đỏ',
      meaning: 'The color of blood or fire',
      difficulty: 'easy',
      examples: [
        { sentence: 'The apple is red', translation: 'Quả táo màu đỏ' },
        { sentence: 'I like red roses', translation: 'Tôi thích hoa hồng đỏ' }
      ]
    },
    {
      word: 'Blue',
      translation: 'Màu xanh dương',
      meaning: 'The color of the sky or ocean',
      difficulty: 'easy',
      examples: [
        { sentence: 'The sky is blue', translation: 'Bầu trời màu xanh' },
        { sentence: 'She has blue eyes', translation: 'Cô ấy có đôi mắt xanh' }
      ]
    }
  ],
  'FOOD & DRINKS': [
    {
      word: 'Pizza',
      translation: 'Bánh pizza',
      meaning: 'A flat, round bread topped with tomato sauce, cheese, and other ingredients',
      difficulty: 'easy',
      examples: [
        { sentence: 'I love eating pizza', translation: 'Tôi thích ăn pizza' },
        { sentence: 'Let\'s order a pizza', translation: 'Hãy đặt một cái pizza' }
      ]
    },
    {
      word: 'Water',
      translation: 'Nước',
      meaning: 'A clear liquid that has no color, taste, or smell',
      difficulty: 'easy',
      examples: [
        { sentence: 'I drink water every day', translation: 'Tôi uống nước mỗi ngày' },
        { sentence: 'Water is essential for life', translation: 'Nước rất cần thiết cho cuộc sống' }
      ]
    }
  ]
};

const addWordsToCategory = async (categoryName, words) => {
  try {
    // Find the category
    const category = await Category.findOne({ name: categoryName.toUpperCase() });
    if (!category) {
      console.log(`Category ${categoryName} not found`);
      return;
    }

    // Create words for this category
    for (const wordData of words) {
      const word = {
        ...wordData,
        category: category._id,
        imageUrl: `/images/${wordData.word.toLowerCase()}.jpg`,
        audioUrl: `/audio/${wordData.word.toLowerCase()}.mp3`
      };

      // Check if word already exists
      const existingWord = await Word.findOne({ 
        word: word.word,
        category: category._id 
      });

      if (existingWord) {
        console.log(`Word "${word.word}" already exists in category ${categoryName}`);
        continue;
      }

      // Create new word
      await Word.create(word);
      console.log(`Added word "${word.word}" to category ${categoryName}`);
    }
  } catch (error) {
    console.error(`Error adding words to category ${categoryName}:`, error);
  }
};

const addSampleWords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Add words to each category
    for (const [categoryName, words] of Object.entries(sampleWords)) {
      await addWordsToCategory(categoryName, words);
    }

    console.log('Finished adding sample words');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the script if called directly
if (require.main === module) {
  addSampleWords();
}

module.exports = { addSampleWords, sampleWords }; 