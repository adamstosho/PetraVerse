import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { petsAPI } from '../../lib/pets';
import { Pet } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const MyPetsPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMyPets();
  }, [currentPage]);

  const fetchMyPets = async () => {
    try {
      const response = await petsAPI.getMyPets({ page: currentPage, limit: 10 });
      setPets(response.pets);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch pets:', error);
      toast.error('Failed to load your pets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet post? This action cannot be undone.')) {
      return;
    }

    try {
      await petsAPI.deletePet(petId);
      toast.success('Pet post deleted successfully');
      fetchMyPets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete pet post');
    }
  };

  const handleMarkAsReunited = async (petId: string) => {
    try {
      await petsAPI.markAsReunited(petId);
      toast.success('Pet marked as reunited!');
      fetchMyPets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark pet as reunited');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Pet Posts</h1>
              <p className="text-gray-600 mt-2">
                Manage your lost and found pet posts
              </p>
            </div>
            <Link to="/pets/create">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Create New Post
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Pets Grid */}
        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, index) => (
              <motion.div
                key={pet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full w-max">
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
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{pet.lastSeenLocation.city}, {pet.lastSeenLocation.state}</span>
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

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Link
                        to={`/pets/${pet._id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="w-4 h-4" />}>
                          View
                        </Button>
                      </Link>
                      
                      {pet.status !== 'reunited' && (
                        <>
                          <Link to={`/pets/${pet._id}/edit`}>
                            <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                              Edit
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsReunited(pet._id)}
                            leftIcon={<CheckCircle className="w-4 h-4" />}
                          >
                            Reunited
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePet(pet._id)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pet Posts Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any pet posts yet. Start by creating your first post.
            </p>
            <Link to="/pets/create">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Create Your First Post
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center justify-center"
          >
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyPetsPage; 