import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  MessageCircle,
  Share2,
  Flag,
  ArrowLeft
} from 'lucide-react';
import { petsAPI } from '../../lib/pets';
import { Pet, ContactRequest } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const PetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactRequest>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;
      
      try {
        const response = await petsAPI.getPet(id);
        setPet(response.pet);
      } catch (error) {
        console.error('Failed to fetch pet:', error);
        toast.error('Failed to load pet information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await petsAPI.contactOwner(id, contactForm);
      toast.success('Message sent successfully!');
      setShowContactForm(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missing':
        return 'bg-red-100 text-red-800';
      case 'found':
        return 'bg-green-100 text-green-800';
      case 'reunited':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pet Not Found</h2>
          <p className="text-gray-600 mb-4">The pet you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/search')}>
            Search for Pets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-600 mt-1">
                {pet.type} • {pet.breed} • {pet.color}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" leftIcon={<Share2 className="w-4 h-4" />}>
                Share
              </Button>
              <Button variant="outline" leftIcon={<Flag className="w-4 h-4" />}>
                Report
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <Card>
              <div className="space-y-4">
                {pet.photos && pet.photos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pet.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${pet.name} photo ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Heart className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </Card>

            {/* Pet Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pet Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Basic Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{pet.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{pet.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Breed:</span>
                      <span className="font-medium">{pet.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{pet.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium capitalize">{pet.gender}</span>
                    </div>
                    {pet.age && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{pet.age} {pet.ageUnit}</span>
                      </div>
                    )}
                    {pet.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{pet.weight} {pet.weightUnit}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Status & Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pet.status)}`}>
                        {pet.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Seen:</span>
                      <span className="font-medium">
                        {new Date(pet.lastSeenDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{pet.lastSeenLocation.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{pet.lastSeenLocation.city}, {pet.lastSeenLocation.state}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Information */}
            {pet.additionalNotes && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{pet.additionalNotes}</p>
              </Card>
            )}

            {/* Tags */}
            {pet.tags && pet.tags.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {pet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Owner */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h2>
              {!showContactForm ? (
                <Button
                  onClick={() => setShowContactForm(true)}
                  className="w-full"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  Contact Owner
                </Button>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <Input
                    label="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell the owner about your message..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            {/* Owner Information */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Posted by</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pet.owner.name}</p>
                    <p className="text-sm text-gray-600">Member since {new Date(pet.owner.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">{pet.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contacts:</span>
                  <span className="font-medium">{pet.contactCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">{new Date(pet.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailPage; 