import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  X, 
  Package, 
  IndianRupee, 
  FileText, 
  Image as ImageIcon,
  Save,
  ArrowLeft
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIES, PRODUCT_CONDITIONS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const AddProductContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    color: #2563eb;
    background: #f3f4f6;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

const Form = styled.form`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  
  &:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }
  
  &.dragover {
    border-color: #2563eb;
    background: #eff6ff;
  }
`;

const UploadIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: #e5e7eb;
  border-radius: 50%;
  margin-bottom: 1rem;
  color: #6b7280;
`;

const UploadText = styled.p`
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &.primary {
    background: #2563eb;
    color: white;
    
    &:hover {
      background: #1d4ed8;
    }
  }
  
  &.secondary {
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  }
  
  &:disabled {
    background: #9ca3af;
    color: white;
    cursor: not-allowed;
  }
`;



const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).slice(0, 5 - images.length);
    
    newImages.forEach(file => {
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

  const uploadImages = async () => {
    if (images.length === 0) return [];

    try {
      const uploadPromises = images.map(async (image) => {
        const imageRef = ref(storage, `products/${currentUser.uid}/${uuidv4()}`);
        await uploadBytes(imageRef, image.file);
        return getDownloadURL(imageRef);
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Storage upload failed, using placeholder images:', error);
      // Fallback to placeholder images if storage is not available
      return images.map(() => `https://via.placeholder.com/400x400?text=Product+Image`);
    }
  };

  const onSubmit = async (data) => {
    setUploading(true);
    
    try {
      // Upload images
      const imageUrls = await uploadImages();
      
      // Create product document
      const productData = {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        stock: parseInt(data.stock),
        images: imageUrls,
        sellerId: currentUser.uid,
        sellerName: userProfile?.name || currentUser.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'products'), productData);
      
      toast.success('Product added successfully!');
      navigate('/seller/products');
      
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AddProductContainer>
      <Container>
        <BackButton onClick={() => navigate('/seller/products')}>
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
              <Package size={20} />
              Basic Information
            </SectionTitle>
            
            <FormGroup>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Product name is required' })}
                className={errors.name ? 'error' : ''}
                placeholder="Enter product name"
              />
              {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                {...register('description', { required: 'Description is required' })}
                className={errors.description ? 'error' : ''}
                placeholder="Describe your product in detail"
              />
              {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
            </FormGroup>

            <FormRow columns="1fr 1fr">
              <FormGroup>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  defaultValue=""
                  {...register('category', { required: 'Category is required' })}
                  className={errors.category ? 'error' : ''}
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
                  {...register('condition', { required: 'Condition is required' })}
                  className={errors.condition ? 'error' : ''}
                >
                  <option value="">Select condition</option>
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
              <IndianRupee size={20} />
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
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                  className={errors.price ? 'error' : ''}
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
                  {...register('originalPrice')}
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
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                  className={errors.stock ? 'error' : ''}
                  placeholder="0"
                />
                {errors.stock && <ErrorMessage>{errors.stock.message}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          </Section>

          <Section>
            <SectionTitle>
              <ImageIcon size={20} />
              Product Images
            </SectionTitle>
            
            <ImageUploadArea
              className={dragOver ? 'dragover' : ''}
              onClick={() => document.getElementById('imageInput').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadIcon>
                <Upload size={24} />
              </UploadIcon>
              <UploadText>Click to upload or drag and drop</UploadText>
              <UploadSubtext>PNG, JPG, GIF up to 10MB (max 5 images)</UploadSubtext>
              
              <HiddenInput
                id="imageInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </ImageUploadArea>

            {images.length > 0 && (
              <ImagePreviewGrid>
                {images.map((image) => (
                  <ImagePreview key={image.id}>
                    <PreviewImage src={image.preview} alt="Preview" />
                    <RemoveImageButton
                      type="button"
                      onClick={() => removeImage(image.id)}
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
              className="secondary"
              onClick={() => navigate('/seller/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="primary"
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

export default AddProduct;
