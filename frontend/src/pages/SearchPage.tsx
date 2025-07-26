import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Heart,
  Eye,
  Map,
  List,
  SlidersHorizontal,
  Loader2,
  MessageCircle,
  CheckCircle,
  User
} from 'lucide-react';
import { petsAPI } from '../lib/pets';
import { Pet, SearchFilters, ContactRequest } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

const SearchPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReunitedModal, setShowReunitedModal] = useState(false);
  const [contactForm, setContactForm] = useState<ContactRequest>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    status: '',
    breed: '',
    color: '',
    gender: '',
    page: 1,
    limit: 12,
  });

  const petTypes = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'];
  const statusOptions = ['missing', 'found', 'reunited'];
  const genderOptions = ['male', 'female', 'unknown'];

  useEffect(() => {
    fetchPets();
  }, [filters, currentPage]);

  const fetchPets = async () => {
    setIsLoading(true);
    try {
      const searchFilters = {
        ...filters,
        page: currentPage,
      };
      
      const response = await petsAPI.getPets(searchFilters);
      setPets(response.pets);
      setTotalPages(response.pagination.pages);
    } catch (error: any) {
      console.error('Failed to fetch pets:', error);
      toast.error(error.message || 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      breed: '',
      color: '',
      gender: '',
      page: 1,
      limit: 12,
    });
    setCurrentPage(1);
  };

  const handleContactOwner = (pet: Pet) => {
    if (!isAuthenticated) {
      toast.error('Please log in to contact pet owners');
      return;
    }
    setSelectedPet(pet);
    setContactForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      message: ''
    });
    setShowContactModal(true);
  };

  const handleMarkReunited = (pet: Pet) => {
    if (!isAuthenticated) {
      toast.error('Please log in to mark pets as reunited');
      return;
    }
    setSelectedPet(pet);
    setShowReunitedModal(true);
  };

  const submitContactForm = async () => {
    if (!selectedPet) return;
    
    setIsSubmitting(true);
    try {
      await petsAPI.contactOwner(selectedPet._id, contactForm);
      toast.success('Contact request sent successfully!');
      setShowContactModal(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send contact request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReunited = async () => {
    if (!selectedPet) return;
    
    setIsSubmitting(true);
    try {
      await petsAPI.markAsReunited(selectedPet._id);
      toast.success('Pet marked as reunited successfully!');
      setShowReunitedModal(false);
      fetchPets(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark pet as reunited');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search for Pets</h1>
            <p className="text-gray-600">
              Find lost and found pets in your area. Use filters to narrow your search.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm">
                  <strong>Log in</strong> to contact pet owners and mark pets as reunited
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/login'}
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by pet name, breed, or location..."
                value={filters.breed || ''}
                onChange={(e) => handleFilterChange('breed', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                leftIcon={<List className="w-4 h-4" />}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
                leftIcon={<Map className="w-4 h-4" />}
              >
                Map
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {petTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Breed"
                  placeholder="e.g., Golden Retriever"
                  value={filters.breed}
                  onChange={(e) => handleFilterChange('breed', e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Color"
                  placeholder="e.g., Golden"
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Genders</option>
                  {genderOptions.map(gender => (
                    <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Loading...' : `${pets.length} pets found`}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : pets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pets.map((pet, index) => (
                <motion.div
                  key={pet._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    {/* Pet Image */}
                    <div className="relative mb-4">
                      {pet.photos && pet.photos.length > 0 ? (
                        <img
                          src={pet.photos[0]}
                          alt={pet.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pet.status)}`}>
                          {pet.status}
                        </span>
                      </div>
                    </div>

                    {/* Pet Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                        <p className="text-gray-600 capitalize">
                          {pet.type} • {pet.breed} • {pet.color}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span>Posted by {pet.owner.name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{pet.lastSeenLocation?.city}, {pet.lastSeenLocation?.state}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Last seen {new Date(pet.lastSeenDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                        <span>{pet.views} views</span>
                        <span>{pet.contactCount} contacts</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/pets/${pet._id}`}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        
                        {isAuthenticated && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleContactOwner(pet)}
                              className="flex-1"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                            
                            {pet.status === 'found' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleMarkReunited(pet)}
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Reunited
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets found</h3>
              <p className="text-gray-600">
                Try adjusting your search filters or check back later for new posts.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Contact Owner Modal */}
        <Modal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          title="Contact Pet Owner"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Send a message to the owner of <strong>{selectedPet?.name}</strong>
            </p>
            
            <div className="space-y-3">
              <Input
                label="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              
              <Input
                label="Your Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              
              <Input
                label="Your Phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Tell the owner about your pet sighting or any relevant information..."
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowContactModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitContactForm}
                disabled={isSubmitting || !contactForm.message.trim()}
                className="flex-1"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Mark as Reunited Modal */}
        <Modal
          isOpen={showReunitedModal}
          onClose={() => setShowReunitedModal(false)}
          title="Mark Pet as Reunited"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to mark <strong>{selectedPet?.name}</strong> as reunited?
            </p>
            <p className="text-sm text-gray-500">
              This will update the pet's status and notify the owner. This action cannot be undone.
            </p>
            
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReunitedModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitReunited}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Mark as Reunited'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SearchPage;