import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import { createWord } from '../store/slices/wordSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Admin = () => {
  const dispatch = useDispatch();
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);
  const { isLoading: wordLoading } = useSelector((state) => state.words);
  
  const [activeTab, setActiveTab] = useState('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showWordForm, setShowWordForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📚',
    difficulty: 'beginner'
  });
  const [wordForm, setWordForm] = useState({
    word: '',
    translation: '',
    category: '',
    image: null,
    audio: null,
    difficulty: 'easy',
    examples: [{ sentence: '', translation: '' }]
  });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
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
      
      // Append basic fields
      formData.append('word', wordForm.word);
      formData.append('translation', wordForm.translation);
      formData.append('category', wordForm.category);
      formData.append('difficulty', wordForm.difficulty);
      
      // Append files
      if (wordForm.image) {
        formData.append('image', wordForm.image);
      }
      
      if (wordForm.audio) {
        formData.append('audio', wordForm.audio);
      }
      
      // Append examples as JSON
      formData.append('examples', JSON.stringify(wordForm.examples));
      
      await dispatch(createWord(formData));
      toast.success('Word created successfully!');
      
      setWordForm({
        word: '',
        translation: '',
        category: '',
        image: null,
        audio: null,
        difficulty: 'easy',
        examples: [{ sentence: '', translation: '' }]
      });
      setShowWordForm(false);
    } catch (error) {
      toast.error('Error creating word');
    }
  };

  const handleAddExample = () => {
    setWordForm({
      ...wordForm,
      examples: [...wordForm.examples, { sentence: '', translation: '' }]
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

  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...wordForm.examples];
    updatedExamples[index][field] = value;
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
                setWordForm({
                  word: '',
                  translation: '',
                  category: '',
                  image: null,
                  audio: null,
                  difficulty: 'easy',
                  examples: [{ sentence: '', translation: '' }]
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
                      Translation
                    </label>
                    <input
                      type="text"
                      value={wordForm.translation}
                      onChange={(e) => setWordForm({ ...wordForm, translation: e.target.value })}
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
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
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
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={example.sentence}
                          onChange={(e) => handleExampleChange(index, 'sentence', e.target.value)}
                          placeholder="Example sentence"
                          className="p-2 border border-gray-300 rounded-md"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={example.translation}
                            onChange={(e) => handleExampleChange(index, 'translation', e.target.value)}
                            placeholder="Translation"
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
          
          {/* Word List - We'll implement this in the future */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-center text-gray-500">
              Word management interface will be implemented in the next phase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 