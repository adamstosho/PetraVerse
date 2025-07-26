import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  Upload, 
  X
 
} from 'lucide-react';
import { petsAPI } from '../../lib/pets';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const createPetSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  type: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other']),
  breed: z.string().min(1, 'Breed is required'),
  color: z.string().min(1, 'Color is required'),
  gender: z.enum(['male', 'female', 'unknown']),
  age: z.number().min(0, 'Age must be positive').optional(),
  status: z.enum(['missing', 'found']),
  lastSeenLocation: z.object({
    address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
  }),
  lastSeenDate: z.string().min(1, 'Last seen date is required'),
  additionalNotes: z.string().optional(),
});

type CreatePetFormData = z.infer<typeof createPetSchema>;

const CreatePetPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePetFormData>({
    resolver: zodResolver(createPetSchema),
    defaultValues: {
      type: 'dog',
      gender: 'unknown',
      status: 'missing',
      lastSeenLocation: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length + photos.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    setPhotos(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreatePetFormData) => {
    if (photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Add basic form data
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('breed', data.breed);
      formData.append('color', data.color);
      formData.append('gender', data.gender);
      formData.append('status', data.status);
      formData.append('lastSeenDate', data.lastSeenDate);
      
      if (data.age) {
        formData.append('age', data.age.toString());
      }
      
      if (data.additionalNotes) {
        formData.append('additionalNotes', data.additionalNotes);
      }

      // Add location data
      const locationData = {
        address: data.lastSeenLocation.address,
        city: data.lastSeenLocation.city,
        state: data.lastSeenLocation.state,
        zipCode: data.lastSeenLocation.zipCode,
        coordinates: [0, 0] // Default coordinates - will be updated by backend
      };
      formData.append('lastSeenLocation', JSON.stringify(locationData));

      // Add empty arrays for optional fields
      formData.append('tags', JSON.stringify([]));
      formData.append('collar', JSON.stringify({ hasCollar: false }));

      // Add photos
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      await petsAPI.createPet(formData);
      toast.success('Pet post created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create pet post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Pet Post</h1>
                <p className="text-gray-600 mt-1">Share information about a lost or found pet</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Photos Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pet Photos</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload photos of your pet (max 5 photos, 5MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Choose Photos
                  </label>
                </div>

                {/* Photo Previews */}
                {photoUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photoUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('name')}
                  label="Pet Name"
                  placeholder="Enter pet's name"
                  error={errors.name?.message}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Type
                  </label>
                  <select
                    {...register('type')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="hamster">Hamster</option>
                    <option value="fish">Fish</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Input
                  {...register('breed')}
                  label="Breed"
                  placeholder="e.g., Golden Retriever"
                  error={errors.breed?.message}
                />

                <Input
                  {...register('color')}
                  label="Color"
                  placeholder="e.g., Golden"
                  error={errors.color?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <Input
                  {...register('age', { valueAsNumber: true })}
                  label="Age (optional)"
                  type="number"
                  placeholder="e.g., 2"
                  error={errors.age?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="missing">Missing</option>
                    <option value="found">Found</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Last Seen Location</h2>
              <div className="space-y-4">
                <Input
                  {...register('lastSeenLocation.address')}
                  label="Address"
                  placeholder="Street address"
                  error={errors.lastSeenLocation?.address?.message}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    {...register('lastSeenLocation.city')}
                    label="City"
                    placeholder="City"
                    error={errors.lastSeenLocation?.city?.message}
                  />
                  <Input
                    {...register('lastSeenLocation.state')}
                    label="State"
                    placeholder="State"
                    error={errors.lastSeenLocation?.state?.message}
                  />
                  <Input
                    {...register('lastSeenLocation.zipCode')}
                    label="ZIP Code"
                    placeholder="ZIP Code"
                    error={errors.lastSeenLocation?.zipCode?.message}
                  />
                </div>

                <Input
                  {...register('lastSeenDate')}
                  label="Last Seen Date"
                  type="datetime-local"
                  error={errors.lastSeenDate?.message}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  {...register('additionalNotes')}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information about your pet..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                loadingText="Creating..."
              >
                Create Pet Post
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePetPage; 