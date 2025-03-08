/**
 * Recipe Form Component
 *
 * Form for creating and editing recipes
 */

import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient, CreateRecipeData, UpdateRecipeData } from '../../services/recipe.service';
import Button from '../common/Button';

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  calories?: number;
  tags: string[];
}

interface RecipeFormProps {
  initialData?: Recipe | RecipeFormData;
  onSubmit: (data: CreateRecipeData | UpdateRecipeData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: '',
    prepTime: undefined,
    cookTime: undefined,
    servings: undefined,
    imageUrl: '',
    calories: undefined,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        ingredients: initialData.ingredients || [],
        instructions: initialData.instructions,
        prepTime: initialData.prepTime || undefined,
        cookTime: initialData.cookTime || undefined,
        servings: initialData.servings || undefined,
        imageUrl: initialData.imageUrl || '',
        calories: initialData.calories || undefined,
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle numeric input changes
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : Number(value);
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  // Handle ingredient changes
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  // Add new ingredient
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  // Remove ingredient
  const removeIngredient = (index: number) => {
    if (formData.ingredients.length <= 1) return;
    
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Add tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim().toLowerCase();
    if (!formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
    }
    setTagInput('');
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }
    
    const hasEmptyIngredient = formData.ingredients.some(ing => !ing.name.trim());
    if (hasEmptyIngredient) {
      newErrors.ingredients = 'All ingredients must have a name';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Recipe Title*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
            errors.title ? 'border-red-500' : ''
          }`}
          placeholder="Enter recipe title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Describe your recipe"
        />
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ingredients*
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-primary hover:text-primary-dark"
          >
            + Add Ingredient
          </button>
        </div>
        
        {errors.ingredients && (
          <p className="mt-1 text-sm text-red-500">{errors.ingredients}</p>
        )}
        
        <div className="mt-2 space-y-3">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={ingredient.amount}
                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Amt"
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Unit"
              />
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Ingredient name"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="text-red-500 hover:text-red-700"
                disabled={formData.ingredients.length <= 1}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Instructions*
        </label>
        <textarea
          id="instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          rows={5}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
            errors.instructions ? 'border-red-500' : ''
          }`}
          placeholder="Enter step-by-step instructions"
        />
        {errors.instructions && (
          <p className="mt-1 text-sm text-red-500">{errors.instructions}</p>
        )}
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prep Time (mins)
          </label>
          <input
            type="number"
            id="prepTime"
            name="prepTime"
            value={formData.prepTime || ''}
            onChange={handleNumericChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cook Time (mins)
          </label>
          <input
            type="number"
            id="cookTime"
            name="cookTime"
            value={formData.cookTime || ''}
            onChange={handleNumericChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Servings
          </label>
          <input
            type="number"
            id="servings"
            name="servings"
            value={formData.servings || ''}
            onChange={handleNumericChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Image URL
        </label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Enter image URL"
        />
      </div>

      {/* Calories */}
      <div>
        <label htmlFor="calories" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Calories
        </label>
        <input
          type="number"
          id="calories"
          name="calories"
          value={formData.calories || ''}
          onChange={handleNumericChange}
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags
        </label>
        <div className="mt-1 flex">
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Add a tag (e.g., breakfast, vegetarian)"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <button
            type="button"
            onClick={addTag}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 sm:text-sm"
          >
            Add
          </button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  );
};

export default RecipeForm;
