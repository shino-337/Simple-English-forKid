import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import { createWord, fetchAllWords, updateWord, deleteWord } from '../store/slices/wordSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Admin = () => {
  const dispatch = useDispatch();
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);
  const { words, isLoading: wordLoading } = useSelector((state) => state.words);
  
  const [activeTab, setActiveTab] = useState('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showWordForm, setShowWordForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: '#4F46E5',
    difficulty: 'beginner'
  });
  const [wordForm, setWordForm] = useState({
    word: '',
    meaning: '',
    category: '',
    image: null,
    audio: null,
    difficulty: 'beginner',
    examples: ['']
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingWord, setEditingWord] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllWords());
  }, [dispatch]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await dispatch(updateCategory({
          id: editingCategory._id,
          categoryData: categoryForm
        }));
        toast.success('Category updated successfully!');
      } else {
        await dispatch(createCategory(categoryForm));
        toast.success('Category created successfully!');
      }
      
      setCategoryForm({
        name: '',
        description: '',
        icon: '📚',
        color: '#4F46E5',
        difficulty: 'beginner'
      });
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error('Error creating category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '📚',
      color: category.color || '#4F46E5',
      difficulty: category.difficulty || 'beginner'
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will delete all associated words.')) {
      try {
        await dispatch(deleteCategory(id));
        toast.success('Category deleted successfully!');
      } catch (error) {
        toast.error('Error deleting category');
      }
    }
  };

  const handleWordSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('word', wordForm.word);
      formData.append('meaning', wordForm.meaning);
      formData.append('category', wordForm.category);
      formData.append('difficulty', wordForm.difficulty);
      
      // Handle examples
      formData.append('examples', JSON.stringify(wordForm.examples.filter(ex => ex.trim() !== '')));
      
      // Handle files
      if (wordForm.image instanceof File) {
        formData.append('image', wordForm.image);
      }
      
      if (wordForm.audio instanceof File) {
        formData.append('audio', wordForm.audio);
      }
      
      if (editingWord) {
        await dispatch(updateWord({
          id: editingWord._id,
          wordData: formData
        }));
        toast.success('Word updated successfully!');
      } else {
        await dispatch(createWord(formData));
        toast.success('Word created successfully!');
      }
      
      // Reset form
      setWordForm({
        word: '',
        meaning: '',
        category: '',
        image: null,
        audio: null,
        difficulty: 'beginner',
        examples: ['']
      });
      setShowWordForm(false);
      setEditingWord(null);
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleEditWord = (word) => {
    setEditingWord(word);
    setWordForm({
      word: word.word,
      meaning: word.meaning,
      category: word.category._id || word.category,
      difficulty: word.difficulty || 'beginner',
      examples: word.examples && word.examples.length > 0 ? word.examples : [''],
      // Don't set image and audio here as they are files and can't be pre-filled
      image: null,
      audio: null
    });
    setShowWordForm(true);
    setActiveTab('words');
  };

  const handleDeleteWord = async (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      try {
        await dispatch(deleteWord(wordId));
        toast.success('Word deleted successfully!');
      } catch (error) {
        toast.error(error.message || 'An error occurred');
      }
    }
  };

  const handleAddExample = () => {
    setWordForm({
      ...wordForm,
      examples: [...wordForm.examples, '']
    });
  };

  const handleRemoveExample = (index) => {
    const updatedExamples = [...wordForm.examples];
    updatedExamples.splice(index, 1);
    setWordForm({
      ...wordForm,
      examples: updatedExamples
    });
  };

  const handleExampleChange = (index, value) => {
    const updatedExamples = [...wordForm.examples];
    updatedExamples[index] = value;
    setWordForm({
      ...wordForm,
      examples: updatedExamples
    });
  };

  const handleFileChange = (e) => {
    setWordForm({
      ...wordForm,
      [e.target.name]: e.target.files[0]
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard 👑</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'categories' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'words' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('words')}
        >
          Words
        </button>
      </div>
      
      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Manage Categories</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
              onClick={() => {
                setShowCategoryForm(true);
                setEditingCategory(null);
                setCategoryForm({
                  name: '',
                  description: '',
                  icon: '📚',
                  color: '#4F46E5',
                  difficulty: 'beginner'
                });
              }}
            >
              Add New Category
            </motion.button>
          </div>
          
          {/* Category Form */}
          {showCategoryForm && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h4 className="text-lg font-medium mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h4>
              <form onSubmit={handleCategorySubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (Emoji)
                    </label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={categoryForm.difficulty}
                      onChange={(e) => setCategoryForm({ ...categoryForm, difficulty: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                      setCategoryForm({
                        name: '',
                        description: '',
                        icon: '📚',
                        color: '#4F46E5',
                        difficulty: 'beginner'
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={categoriesLoading}
                  >
                    {categoriesLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Categories List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoriesLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      No categories found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-2xl">
                        {category.icon}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${category.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                            category.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}
                        >
                          {category.difficulty.charAt(0).toUpperCase() + category.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Words Tab */}
      {activeTab === 'words' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Manage Words</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
              onClick={() => {
                setShowWordForm(true);
                setEditingWord(null);
                setWordForm({
                  word: '',
                  meaning: '',
                  category: '',
                  image: null,
                  audio: null,
                  difficulty: 'beginner',
                  examples: ['']
                });
              }}
            >
              Add New Word
            </motion.button>
          </div>
          
          {/* Word Form */}
          {showWordForm && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h4 className="text-lg font-medium mb-4">Create New Word</h4>
              <form onSubmit={handleWordSubmit} encType="multipart/form-data">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Word
                    </label>
                    <input
                      type="text"
                      value={wordForm.word}
                      onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meaning
                    </label>
                    <input
                      type="text"
                      value={wordForm.meaning}
                      onChange={(e) => setWordForm({ ...wordForm, meaning: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={wordForm.category}
                      onChange={(e) => setWordForm({ ...wordForm, category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={wordForm.difficulty}
                      onChange={(e) => setWordForm({ ...wordForm, difficulty: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Audio
                    </label>
                    <input
                      type="file"
                      name="audio"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {/* Examples Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Examples
                    </label>
                    {wordForm.examples.map((example, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={example}
                          onChange={(e) => handleExampleChange(index, e.target.value)}
                          placeholder="Example sentence"
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        {wordForm.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(index)}
                            className="px-2 py-1 text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddExample}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Example
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    onClick={() => setShowWordForm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={wordLoading}
                  >
                    {wordLoading ? 'Creating...' : 'Create Word'}
                  </motion.button>
                </div>
              </form>
            </div>
          )}
          
          {/* Words List */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Word
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meaning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wordLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="animate-pulse">Loading words...</div>
                    </td>
                  </tr>
                ) : words.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      No words found. Add your first word!
                    </td>
                  </tr>
                ) : (
                  words.map((word) => (
                    <tr key={word._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{word.word}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {word.meaning}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {word.category?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${word.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                            word.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}
                        >
                          {word.difficulty?.charAt(0).toUpperCase() + word.difficulty?.slice(1) || 'Beginner'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {word.imageUrl && (
                            <span className="text-green-500" title="Has image">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                          {word.audioUrl && (
                            <span className="text-blue-500" title="Has audio">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditWord(word)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWord(word._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 