const Word = require('../models/Word');
const { getPixabayImage, PixabayError } = require('../utils/pixabay');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all words
// @route   GET /api/words
// @access  Public
exports.getWords = asyncHandler(async (req, res, next) => {
  const words = await Word.find().populate('category');
  res.status(200).json({
    success: true,
    count: words.length,
    data: words
  });
});

// @desc    Get words by category
// @route   GET /api/words/category/:categoryId
// @access  Public
exports.getWordsByCategory = asyncHandler(async (req, res, next) => {
  const words = await Word.find({ category: req.params.categoryId }).populate('category');
  res.status(200).json({
    success: true,
    count: words.length,
    data: words
  });
});

// @desc    Get single word
// @route   GET /api/words/:id
// @access  Public
exports.getWord = asyncHandler(async (req, res, next) => {
  const word = await Word.findById(req.params.id).populate('category');

  if (!word) {
    return next(new ErrorResponse(`Word not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: word
  });
});

// @desc    Create new word
// @route   POST /api/words
// @access  Private/Admin
exports.createWord = asyncHandler(async (req, res, next) => {
  try {
    const { word, meaning, translation, category, examples, difficulty } = req.body;

    // Validate required fields
    if (!word || !meaning || !translation || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    let imageUrl = null;
    try {
      // Attempt to fetch image from Pixabay
      imageUrl = await getPixabayImage(word);
    } catch (pixabayError) {
      console.error('Pixabay error:', pixabayError);
      // If rate limited, send specific message
      if (pixabayError instanceof PixabayError && pixabayError.statusCode === 429) {
        return res.status(429).json({
          success: false,
          error: 'Image service temporarily unavailable. Please try again later.',
          details: pixabayError.details
        });
      }
      // For other errors, use a default image
      imageUrl = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(word);
    }

    const newWord = new Word({
      word,
      meaning,
      translation,
      category,
      examples,
      difficulty,
      imageUrl
    });

    const savedWord = await newWord.save();
    await savedWord.populate('category');
    
    res.status(201).json({
      success: true,
      data: savedWord
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Update word
// @route   PUT /api/words/:id
// @access  Private/Admin
exports.updateWord = asyncHandler(async (req, res, next) => {
  try {
    const { word, meaning, translation, category, examples, difficulty } = req.body;
    
    // Only fetch new image if word text has changed
    let updateData = { word, meaning, translation, category, examples, difficulty };
    
    const existingWord = await Word.findById(req.params.id);
    if (!existingWord) {
      return next(new ErrorResponse(`Word not found with id of ${req.params.id}`, 404));
    }

    if (existingWord.word !== word) {
      try {
        const imageUrl = await getPixabayImage(word);
        if (imageUrl) {
          updateData.imageUrl = imageUrl;
        }
      } catch (pixabayError) {
        console.error('Pixabay error during update:', pixabayError);
        // If rate limited, keep the old image
        if (pixabayError instanceof PixabayError && pixabayError.statusCode === 429) {
          updateData.imageUrl = existingWord.imageUrl;
        } else {
          // For other errors, use a default image
          updateData.imageUrl = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(word);
        }
      }
    }

    const updatedWord = await Word.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');

    res.status(200).json({
      success: true,
      data: updatedWord
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Delete word
// @route   DELETE /api/words/:id
// @access  Private/Admin
exports.deleteWord = asyncHandler(async (req, res, next) => {
  const word = await Word.findById(req.params.id);

  if (!word) {
    return next(new ErrorResponse(`Word not found with id of ${req.params.id}`, 404));
  }

  await word.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark word as learned
// @route   PUT /api/words/:id/learn
// @access  Private
exports.markWordAsLearned = asyncHandler(async (req, res, next) => {
  try {
    const word = await Word.findById(req.params.id);
    if (!word) {
      return next(new ErrorResponse(`Word not found with id of ${req.params.id}`, 404));
    }

    word.learned = true;
    word.lastReviewed = new Date();
    word.reviewCount += 1;

    const updatedWord = await word.save();
    res.status(200).json({
      success: true,
      data: updatedWord
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
}); 