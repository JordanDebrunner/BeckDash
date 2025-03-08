/**
 * Recipe Modal Component
 * 
 * Modal for creating and editing recipes
 */

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Recipe, CreateRecipeData, UpdateRecipeData } from '../../services/recipe.service';
import Modal from '../common/Modal';
import RecipeForm from './RecipeForm';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRecipeData | UpdateRecipeData) => Promise<void>;
  recipe?: Recipe;
  title: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recipe,
  title,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateRecipeData | UpdateRecipeData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4">
        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
};

export default RecipeModal; 