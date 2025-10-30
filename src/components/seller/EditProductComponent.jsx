"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Removed styled-components import
import { useForm } from 'react-hook-form';
import {
  Upload,
  X,
  Package,
  IndianRupee,
  ImageIcon,
  Save,
  ArrowLeft
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
// Assuming these are accessible constants and components
import { CATEGORIES, PRODUCT_CONDITIONS } from '@/utils/constants';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

// --- Tailwind CSS Helper Components (Replacing Styled Components) ---

const EditProductContainer = ({ children }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    {children}
  </div>
);

const Container = ({ children }) => (
  <div className="max-w-4xl mx-auto px-4 lg:px-6">
    {children}
  </div>
);

const BackButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 bg-transparent border-none text-gray-600 cursor-pointer mb-8 p-2 rounded-lg transition-all duration-200 hover:text-blue-600 hover:bg-gray-100"
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
  <h1 className="text-3xl font-bold text-gray-900 mb-1 sm:text-4xl">
    {children}
  </h1>
);

const Subtitle = ({ children }) => (
  <p className="text-lg text-gray-600">
    {children}
  </p>
);

const Form = ({ children, onSubmit }) => (
  <form
    onSubmit={onSubmit}
    className="bg-white rounded-xl p-6 lg:p-8 shadow-lg border border-gray-100"
  >
    {children}
  </form>
);

const Section = ({ children }) => (
  <div className="mb-8 last:mb-0">
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
    {children}
  </h2>
);

const FormRow = ({ columns = '1fr', children }) => {
  // Translate CSS grid template into Tailwind classes
  let gridClass = 'grid-cols-1 md:grid-cols-1';
  if (columns === '1fr 1fr') {
    gridClass = 'grid-cols-1 md:grid-cols-2';
  } else if (columns === '1fr 1fr 1fr') {
    gridClass = 'grid-cols-1 md:grid-cols-3';
  }

  return (
    <div className={`grid ${gridClass} gap-4 mb-4`}>
      {children}
    </div>
  );
};

const FormGroup = ({ children }) => <div>{children}</div>;

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block font-medium text-gray-700 mb-1.5"
  >
    {children}
  </label>
);

const BaseInput = "w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const ErrorClass = "border-red-500 focus:border-red-500 focus:ring-red-100";

const Input = React.forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={`${BaseInput} ${error ? ErrorClass : ''} ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

const TextArea = React.forwardRef(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`${BaseInput} min-h-[120px] resize-y ${error ? ErrorClass : ''} ${className}`}
    {...props}
  />
));
TextArea.displayName = 'TextArea';

const Select = React.forwardRef(({ className, error, ...props }, ref) => (
  <select
    ref={ref}
    className={`${BaseInput} bg-white ${error ? ErrorClass : ''} ${className}`}
    {...props}
  />
));
Select.displayName = 'Select';


const ErrorMessage = ({ children }) => (
  <span className="text-red-500 text-sm mt-1 block">
    {children}
  </span>
);

const ImageUploadArea = ({ dragOver, onClick, onDragOver, onDragLeave, onDrop, children }) => (
  <div
    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 bg-gray-50
      ${dragOver ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
    `}
    onClick={onClick}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
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
  <input
    className="hidden"
    {...props}
  />
);

const ImagePreviewGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
    {children}
  </div>
);

const ImagePreview = ({ children }) => (
  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
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
    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-opacity-70"
  >
    {children}
  </button>
);

const ActionButtons = ({ children }) => (
  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 flex-col sm:flex-row">
    {children}
  </div>
);

const Button = ({ type = 'button', className, disabled, onClick, children }) => {
  const baseClasses = "flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base cursor-pointer transition-all duration-200 border-none shadow-md";
  const primaryClasses = "bg-blue-600 text-white hover:bg-blue-700";
  const secondaryClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  const disabledClasses = "bg-gray-400 text-white cursor-not-allowed shadow-none";

  let finalClasses = baseClasses;
  if (className === 'primary') {
    finalClasses += ` ${primaryClasses}`;
  } else if (className === 'secondary') {
    finalClasses += ` ${secondaryClasses}`;
  }

  return (
    <button
      type={type}
      className={`${finalClasses} ${disabled ? disabledClasses : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// --- Component Logic ---

const EditProductComponent = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  if (!id) {
    // This handles the server prerender where params might be null/undefined,
    return (
      <div className="max-w-7xl mx-auto p-8 md:p-12 text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Invalid Product ID</h2>
      </div>
    );
  }

  
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');


  const { currentUser } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !currentUser) return;

      try {
        const productDoc = await getDoc(doc(db, 'products', id));

        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };

          // Check if current user owns this product
          if (productData.sellerId !== currentUser.uid) {
            toast.error('You do not have permission to edit this product');
            router.push('/seller/products');
            return;
          }

          setProduct(productData);

          // Set form values
          reset({
            name: productData.name,
            description: productData.description,
            category: productData.category,
            condition: productData.condition,
            price: productData.price,
            originalPrice: productData.originalPrice || '',
            stock: productData.stock,
            brand: productData.brand || '',
            colors: productData.colors || [],
            sizes: productData.sizes || [],
          });

          // Set existing images
          if (productData.images) {
            const existingImages = productData.images.map((url, index) => ({
              id: `existing-${index}`,
              url,
              preview: url,
              isExisting: true
            }));
            setImages(existingImages);
          }

        } else {
          toast.error('Product not found');
          router.push('/seller/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, currentUser, router, reset]); // Added id and router to dependency array

  const handleImageUpload = (files) => {
    // Only allow up to 5 images total
    const maxFiles = 5;
    const currentCount = images.length;
    const newFiles = Array.from(files).slice(0, maxFiles - currentCount);

    if (newFiles.length === 0 && currentCount === maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: uuidv4(),
            file,
            preview: e.target.result,
            isExisting: false
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`File '${file.name}' is not an image and was skipped.`);
      }
    });
  };

  const handleFileSelect = (e) => {
    handleImageUpload(e.target.files);
    // Clear input value to allow selecting the same file(s) again
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

  const uploadNewImages = async () => {
    const newImages = images.filter(img => !img.isExisting);
    if (newImages.length === 0) return [];

    const uploadPromises = newImages.map(async (image) => {
      const imageRef = ref(storage, `products/${currentUser.uid}/${uuidv4()}`);
      await uploadBytes(imageRef, image.file);
      return getDownloadURL(imageRef);
    });

    return Promise.all(uploadPromises);
  };

  const onSubmit = async (data) => {
    setUploading(true);

    if (images.length === 0) {
      toast.error('Please upload at least one image for the product.');
      setUploading(false);
      return;
    }

    try {
      // Upload new images
      const newImageUrls = await uploadNewImages();

      // Get existing image URLs
      const existingImageUrls = images
        .filter(img => img.isExisting)
        .map(img => img.url);

      // Combine all image URLs
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      // Update product document
      const productData = {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        stock: parseInt(data.stock),
        images: allImageUrls,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'products', id), productData);

      toast.success('Product updated successfully! 🎉');
      router.push('/seller/products');

    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <EditProductContainer>
        <Container>
          <LoadingSpinner className="flex items-center justify-center min-h-[400px] text-gray-600 text-lg">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mr-4" />
            Loading product details...
          </LoadingSpinner>
        </Container>
      </EditProductContainer>
    );
  }

  if (!product) {
    // This state is primarily for if the product is not found after loading finishes
    return (
      <EditProductContainer>
        <Container>
          <div className="text-center p-16 bg-white rounded-xl shadow-lg mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found 😔</h2>
            <p className="text-gray-600">The product you're trying to edit doesn't exist or has been removed.</p>
            <Button className="primary mt-6 mx-auto" onClick={() => router.push('/seller/products')}>
              Go to Product List
            </Button>
          </div>
        </Container>
      </EditProductContainer>
    );
  }

  return (
    <EditProductContainer>
      <Container>
        <BackButton onClick={() => router.push('/seller/products')}>
          <ArrowLeft size={20} />
          Back to Products
        </BackButton>

        <Header>
          <Title>Edit Product</Title>
          <Subtitle>Update your product listing</Subtitle>
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
                error={errors.name}
                placeholder="Enter product name"
              />
              {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                {...register('description', { required: 'Description is required' })}
                error={errors.description}
                placeholder="Describe your product in detail"
              />
              {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
  <Label htmlFor="brand">Brand</Label>
  <Input
    id="brand"
    {...register('brand', { required: 'Brand is required' })}
    error={errors.brand}
    placeholder="Enter the brand name"
  />
  {errors.brand && <ErrorMessage>{errors.brand.message}</ErrorMessage>}
</FormGroup>


            <FormRow columns="1fr 1fr">
              <FormGroup>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  error={errors.category}
                >
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
                  error={errors.condition}
                >
                  <option value="">Select condition</option>
                  {PRODUCT_CONDITIONS.map(cond => ( // Using the imported constant
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
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
                  error={errors.price}
                  placeholder="0.00"
                />
                {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="originalPrice">Original Price (₹) <span className="text-gray-400 text-sm">(Optional)</span></Label>
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
                    min: { value: 0, message: 'Stock cannot be negative' },
                    valueAsNumber: true
                  })}
                  error={errors.stock}
                  placeholder="0"
                />
                {errors.stock && <ErrorMessage>{errors.stock.message}</ErrorMessage>}
              </FormGroup>
            </FormRow>
          </Section>
          <Section>
  <SectionTitle>
    Product Variations
  </SectionTitle>

  <FormRow columns="1fr 1fr 1fr">
    <FormGroup>
      <Label htmlFor="colors">Available Colors</Label>
      <Input
        id="colors"
        {...register('colors')}
        placeholder="e.g. red, blue, black"
      />
      <p className="text-gray-500 text-sm">Enter multiple colors separated by commas.</p>
    </FormGroup>

    <FormGroup>
      <Label htmlFor="sizes">Available Sizes</Label>
      <Input
        id="sizes"
        {...register('sizes')}
        placeholder="e.g. S, M, L, XL"
      />
      <p className="text-gray-500 text-sm">Enter multiple sizes separated by commas.</p>
    </FormGroup>

    
  </FormRow>
</Section>


          <Section>
            <SectionTitle>
              <ImageIcon size={20} />
              Product Images
            </SectionTitle>

            {images.length < 5 && (
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
                <UploadSubtext>PNG, JPG, GIF up to 10MB (max 5 images total)</UploadSubtext>

                <HiddenInput
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </ImageUploadArea>
            )}
            {images.length === 5 && (
              <p className="text-sm text-center text-blue-600 font-medium p-4 border border-blue-100 bg-blue-50 rounded-lg">
                Maximum 5 images reached. Remove an image to upload a new one.
              </p>
            )}

            {images.length > 0 && (
              <ImagePreviewGrid>
                {images.map((image) => (
                  <ImagePreview key={image.id}>
                    <PreviewImage src={image.preview} alt="Preview" />
                    <RemoveImageButton
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
              className="secondary"
              onClick={() => router.push('/seller/products')}
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
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Product
                </>
              )}
            </Button>
          </ActionButtons>
        </Form>
      </Container>
    </EditProductContainer>
  );
};

export default EditProductComponent;