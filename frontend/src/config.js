// Use Vite's environment variables system
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AVATAR_OPTIONS = [
  '/avatars/bear.png',
  '/avatars/cat.png',
  '/avatars/dog.png',
  '/avatars/fox.png',
  '/avatars/lion.png',
  '/avatars/monkey.png',
  '/avatars/panda.png',
  '/avatars/penguin.png',
  '/avatars/rabbit.png',
  '/avatars/tiger.png'
];

export const DIFFICULTY_LEVELS = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard'
};

export const MAX_DAILY_MISTAKES = 3;
export const MAX_DAILY_CHALLENGES = 10;

// Sample word images from reliable CDNs
export const WORD_IMAGES = {
  'lion': 'https://cdn.pixabay.com/photo/2018/07/31/22/08/lion-3576045_640.jpg',
  'elephant': 'https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_640.jpg',
  'red': 'https://cdn.pixabay.com/photo/2016/12/15/20/21/texture-1909992_640.jpg',
  'blue': 'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_640.jpg',
  'pizza': 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
  'water': 'https://cdn.pixabay.com/photo/2014/12/24/05/02/drop-of-water-578897_640.jpg'
}; 