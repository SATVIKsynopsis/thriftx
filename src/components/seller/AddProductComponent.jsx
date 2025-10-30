"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// Removed styled-components import
import { useForm } from 'react-hook-form';
import {
  Upload,
  X,
  Package,
  IndianRupee,
  ImageIcon,
  Save,
  ArrowLeft,
  ChevronDown,
  Plus
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { db, storage } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { CATEGORIES, PRODUCT_CONDITIONS } from '@/utils/constants';
import { COLORS, SIZES } from '@/utils/filterConstants';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

// MultiSelectDropdown Component
const MultiSelectDropdown = ({
  id,
  label,
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  allowCustom = true,
  error,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCustomInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const addCustomItem = () => {
    if (customValue.trim() && !value.includes(customValue.trim()) && !options.includes(customValue.trim())) {
      onChange([...value, customValue.trim()]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const removeItem = (item) => {
    onChange(value.filter(v => v !== item));
  };

  const availableOptions = options.filter(option => !value.includes(option));

  return (
    <div className="mb-4">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative" ref={dropdownRef}>
        {/* Selected Items Display */}
        <div className={`min-h-[48px] w-full py-2 px-3 border-2 ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white transition-all focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 cursor-pointer`}
             onClick={() => setIsOpen(!isOpen)}
             {...rest}>
          <div className="flex flex-wrap gap-1 items-center">
            {value.length > 0 ? (
              value.map((item, index) => (
                <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {/* Custom Input Section */}
            {allowCustom && (
              <>
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Add Custom
                  </button>
                ) : (
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex gap-2">
                      <Input
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="Type custom value..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomItem();
                          } else if (e.key === 'Escape') {
                            setShowCustomInput(false);
                            setCustomValue('');
                          }
                        }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={addCustomItem}
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Available Options */}
            {availableOptions.length > 0 && (
              <div className="py-1">
                {availableOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {availableOptions.length === 0 && !allowCustom && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

// --- Tailwind Wrapper Components (Replacing Styled Components) ---

const AddProductContainer = ({ children }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    {children}
  </div>
);

const Container = ({ children }) => (
  <div className="max-w-4xl mx-auto px-8 lg:px-4 sm:px-2">
    {children}
  </div>
);

const BackButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 bg-transparent border-none text-gray-600 cursor-pointer mb-8 p-2 rounded-lg transition-all hover:text-blue-600 hover:bg-gray-100"
  >
    {children}
  </button>
);

const Header = ({ children }) => (
  <div className="mb-8">
    {children}
  </div>
);

const Title = ({ children }) => (
  <h1 className="text-4xl font-bold text-gray-900 mb-2">
    {children}
  </h1>
);

const Subtitle = ({ children }) => (
  <p className="text-lg text-gray-600">
    {children}
  </p>
);

const Form = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
    {children}
  </form>
);

const Section = ({ children }) => (
  <div className="mb-8 last:mb-0">
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
    {children}
  </h2>
);

const FormRow = ({ columns, children }) => (
  <div className={`grid ${columns === '1fr 1fr' ? 'grid-cols-1 md:grid-cols-2' : columns === '1fr 1fr 1fr' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-6 mb-4`}>
    {children}
  </div>
);

const FormGroup = ({ children }) => (
  <div className="mb-0">
    {children}
  </div>
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block font-medium text-gray-700 mb-1">
    {children}
  </label>
);

const Input = React.forwardRef(({ error, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={`w-full py-3 px-4 border-2 ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg text-base transition-all focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100`}
  />
));
Input.displayName = 'Input';

const TextArea = React.forwardRef(({ error, ...props }, ref) => (
  <textarea
    ref={ref}
    {...props}
    className={`w-full py-3 px-4 border-2 ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg text-base resize-y min-h-[120px] font-sans transition-all focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100`}
  />
));
TextArea.displayName = 'TextArea';

const Select = React.forwardRef(({ error, ...props }, ref) => (
  <select
    ref={ref}
    {...props}
    className={`w-full py-3 px-4 border-2 ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg text-base bg-white transition-all focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100`}
  />
));
Select.displayName = 'Select';

const ErrorMessage = ({ children }) => (
  <span className="text-red-600 text-sm mt-1 block">
    {children}
  </span>
);

const ImageUploadArea = ({ dragOver, onClick, onDragOver, onDragLeave, onDrop, children }) => (
  <div
    onClick={onClick}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    className={`
      border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all bg-gray-50
      ${dragOver ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
    `}
  >
    {children}
  </div>
);

const UploadIcon = ({ children }) => (
  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4 text-gray-600">
    {children}
  </div>
);

const UploadText = ({ children }) => (
  <p className="text-gray-600 font-medium mb-1">
    {children}
  </p>
);

const UploadSubtext = ({ children }) => (
  <p className="text-gray-400 text-sm">
    {children}
  </p>
);

const HiddenInput = (props) => (
  <input {...props} className="hidden" />
);

const ImagePreviewGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
    {children}
  </div>
);

const ImagePreview = ({ children }) => (
  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
    {children}
  </div>
);

const PreviewImage = ({ alt, ...props }) => (
  <img
    className="w-full h-full object-cover"
    alt={alt}
    {...props}
  />
);

const RemoveImageButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all hover:bg-opacity-70"
  >
    {children}
  </button>
);

const ActionButtons = ({ children }) => (
  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 flex-col sm:flex-row">
    {children}
  </div>
);

const Button = ({ primary, secondary, disabled, onClick, children, ...props }) => (
  <button
    {...props}
    onClick={onClick}
    disabled={disabled}
    className={`
      flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base cursor-pointer transition-all duration-200 border border-transparent
      ${primary
        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
        : secondary
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 disabled:bg-gray-200 disabled:text-gray-500'
          : ''
      }
    `}
  >
    {children}
  </button>
);


// --- Component Logic ---

const AddProductComponent = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const { currentUser, userProfile } = useAuth();
  const navigate = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleImageUpload = (files) => {
    // Determine how many more images can be added (max 5)
    const maxFilesToAdd = 5 - images.length;
    const newFiles = Array.from(files).slice(0, maxFilesToAdd);

    if (newFiles.length === 0 && files.length > 0) {
      toast.error('Maximum of 5 images reached.');
      return;
    }

    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: uuidv4(),
            file,
            preview: e.target.result
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileSelect = (e) => {
    handleImageUpload(e.target.files);
    // Clear file input value to allow re-uploading the same file if removed
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Upload images via /api/upload-images for webp optimization
  const uploadImages = async () => {
    if (images.length === 0) return [];

    try {
      const formData = new FormData();
      images.forEach((img) => {
        formData.append('images', img.file);
      });
      formData.append('userId', currentUser.uid);

      const res = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Image optimization/upload failed');
      }
      const data = await res.json();
      return data.urls || [];
    } catch (error) {
      console.error('Image upload/optimization failed:', error);
      toast.error('Image upload failed. Submitting product without images.', { id: 'img-fail' });
      return [];
    }
  };

  const onSubmit = async (data) => {
    if (!currentUser) {
      toast.error('You must be logged in to add a product.');
      return;
    }

    setUploading(true);

    if (images.length === 0) {
      toast.error('Please upload at least one product image.');
      setUploading(false);
      return;
    }

    try {
      const imageUrls = await uploadImages();

      // Validate selections
      if (selectedSizes.length === 0) {
        toast.error('Please select at least one size.');
        setUploading(false);
        return;
      }

      if (selectedColors.length === 0) {
        toast.error('Please select at least one color.');
        setUploading(false);
        return;
      }

      // Create product document
      const productData = {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        stock: parseInt(data.stock),
        images: imageUrls,
        sizes: selectedSizes,  // Use arrays directly
        colors: selectedColors,  // Use arrays directly
        sellerId: currentUser.uid,
        sellerName: userProfile?.name || currentUser.displayName || 'Unknown Seller',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'products'), productData);

      toast.success('Product added successfully! 🎉');
      navigate.push('/seller/products');

    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product. Please check your data and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AddProductContainer>
      <Container>
        <BackButton onClick={() => navigate.push('/seller/products')}>
          <ArrowLeft size={20} />
          Back to Products
        </BackButton>

        <Header>
          <Title>Add New Product</Title>
          <Subtitle>Create a new listing for your marketplace</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Section>
            <SectionTitle>
              <Package size={20} className="text-blue-600" />
              Basic Information
            </SectionTitle>

            <FormGroup>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Product name is required' })}
                error={!!errors.name}
                placeholder="Enter product name"
              />
              {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                {...register('description', { required: 'Description is required' })}
                error={!!errors.description}
                placeholder="Describe your product in detail"
              />
              {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="brand">Brand</Label>
              <Input
              id="brand"
              {...register('brand', { required: 'Brand is required' })}
              error={!!errors.brand}
              placeholder="Enter brand name"
              />
              {errors.brand && <ErrorMessage>{errors.brand.message}</ErrorMessage>}
            </FormGroup>
            <FormRow columns="1fr 1fr">
              <MultiSelectDropdown
                id="sizes"
                label="Available Sizes"
                options={SIZES}
                value={selectedSizes}
                onChange={setSelectedSizes}
                placeholder="Select sizes (e.g. S, M, L)"
                allowCustom={true}
                error={!selectedSizes.length}
              />

              <MultiSelectDropdown
                id="colors"
                label="Available Colors"
                options={COLORS.map(color => color.name)}
                value={selectedColors}
                onChange={setSelectedColors}
                placeholder="Select colors (e.g. Red, Blue)"
                allowCustom={true}
                error={!selectedColors.length}
              />
            </FormRow>



            <FormRow columns="1fr 1fr">
              <FormGroup>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  defaultValue=""
                  {...register('category', { required: 'Category is required' })}
                  error={!!errors.category}
                >
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
                {errors.category && <ErrorMessage>{errors.category.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="condition">Condition</Label>
                <Select
                  id="condition"
                  defaultValue=""
                  {...register('condition', { required: 'Condition is required' })}
                  error={!!errors.condition}
                >
                  <option value="" disabled>Select condition</option>
                  {PRODUCT_CONDITIONS.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </Select>
                {errors.condition && <ErrorMessage>{errors.condition.message}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          </Section>

          <Section>
            <SectionTitle>
              <IndianRupee size={20} className="text-blue-600" />
              Pricing & Inventory
            </SectionTitle>

            <FormRow columns="1fr 1fr 1fr">
              <FormGroup>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' },
                    valueAsNumber: true,
                  })}
                  error={!!errors.price}
                  placeholder="0.00"
                />
                {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('originalPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  {...register('stock', {
                    required: 'Stock quantity is required',
                    min: { value: 0, message: 'Stock cannot be negative' },
                    valueAsNumber: true,
                  })}
                  error={!!errors.stock}
                  placeholder="0"
                />
                {errors.stock && <ErrorMessage>{errors.stock.message}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          </Section>

          <Section>
            <SectionTitle>
              <ImageIcon size={20} className="text-blue-600" />
              Product Images
            </SectionTitle>

            <ImageUploadArea
              dragOver={dragOver}
              onClick={() => document.getElementById('imageInput').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon>
                <Upload size={24} />
              </UploadIcon>
              <UploadText>Click to upload or drag and drop</UploadText>
              <UploadSubtext>PNG, JPG, GIF up to 10MB (max 5 images) - Images will be optimized automatically</UploadSubtext>

              <HiddenInput
                id="imageInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={images.length >= 5}
              />
            </ImageUploadArea>
            {images.length >= 5 && <ErrorMessage className="mt-2 text-center">Maximum of 5 images uploaded.</ErrorMessage>}


            {images.length > 0 && (
              <ImagePreviewGrid>
                {images.map((image) => (
                  <ImagePreview key={image.id}>
                    <PreviewImage src={image.preview} alt="Preview" />
                    <RemoveImageButton
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the file input
                        removeImage(image.id);
                      }}
                    >
                      <X size={12} />
                    </RemoveImageButton>
                  </ImagePreview>
                ))}
              </ImagePreviewGrid>
            )}
          </Section>

          <ActionButtons>
            <Button
              type="button"
              secondary
              onClick={() => navigate.push('/seller/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              primary
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="20px" inline />
                  Uploading...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Add Product
                </>
              )}
            </Button>
          </ActionButtons>
        </Form>
      </Container>
    </AddProductContainer>
  );
};

export default AddProductComponent;
