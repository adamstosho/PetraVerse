import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Edit, Trash2, Search, Filter } from 'lucide-react';
import { adminAPI } from '../../lib/admin';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

interface Pet {
    _id: string;
    name: string;
    type: string;
    breed: string;
    color: string;
    gender: string;
    status: 'missing' | 'found' | 'reunited';
    isApproved: boolean;
    views: number;
    contactCount: number;
    createdAt: string;
    owner: {
        _id: string;
        name: string;
        email: string;
    };
    approvedBy?: {
        _id: string;
        name: string;
    };
}

const AdminPetsPage: React.FC = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [approvalFilter, setApprovalFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPets, setTotalPets] = useState(0);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
                ...(approvalFilter && { isApproved: approvalFilter === 'true' })
            };

            const response = await adminAPI.getAllPets(params);
            setPets(response.pets);
            setTotalPages(response.pagination.pages);
            setTotalPets(response.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch pets:', error);
            toast.error(error.message || 'Failed to fetch pets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, [currentPage, search, statusFilter, approvalFilter]);

    const handleApprove = async (petId: string) => {
        try {
            console.log('Approving pet:', petId);
            await adminAPI.approvePet(petId);
            toast.success('Pet post approved successfully');
            fetchPets();
        } catch (error: any) {
            console.error('Approve error:', error);
            toast.error(error.message || 'Failed to approve pet');
        }
    };

    const handleReject = async (petId: string) => {
        try {
            await adminAPI.deletePet(petId);
            toast.success('Pet post rejected and removed');
            fetchPets();
        } catch (error: any) {
            console.error('Reject error:', error);
            toast.error(error.message || 'Failed to reject pet');
        }
    };

    const handleDelete = async (petId: string) => {
        if (window.confirm('Are you sure you want to delete this pet post?')) {
            try {
                console.log('Deleting pet:', petId);
                await adminAPI.deletePet(petId);
                toast.success('Pet post deleted successfully');
                fetchPets();
            } catch (error: any) {
                console.error('Delete error:', error);
                toast.error(error.message || 'Failed to delete pet');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            missing: 'warning',
            found: 'info',
            reunited: 'success'
        } as const;
        return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
    };

    const getApprovalBadge = (isApproved: boolean) => {
        return isApproved ? (
            <Badge variant="success">Approved</Badge>
        ) : (
            <Badge variant="warning">Pending</Badge>
        );
    };

    if (loading && pets.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow p-6">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Management</h1>
                    <p className="text-gray-600">Manage and moderate pet posts</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Eye className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Pets</p>
                                <p className="text-2xl font-bold text-gray-900">{totalPets}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pets.filter(pet => pet.isApproved).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pets.filter(pet => !pet.isApproved).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Search className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Views</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pets.reduce((sum, pet) => sum + pet.views, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search pets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="missing">Missing</option>
                                <option value="found">Found</option>
                                <option value="reunited">Reunited</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Approval</label>
                            <select
                                value={approvalFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setApprovalFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All</option>
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('');
                                    setApprovalFilter('');
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Pets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <div key={pet._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                                        <p className="text-sm text-gray-600">{pet.breed} • {pet.color}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {getStatusBadge(pet.status)}
                                        {getApprovalBadge(pet.isApproved)}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Owner:</span> {pet.owner.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Views:</span> {pet.views}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Contacts:</span> {pet.contactCount}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Posted:</span> {new Date(pet.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => navigate(`/pets/${pet._id}`)}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </Button>
                                    {!pet.isApproved && (
                                        <Button
                                            onClick={() => handleApprove(pet._id)}
                                            variant="primary"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                    )}
                                    {pet.isApproved && (
                                        <Button
                                            onClick={() => handleReject(pet._id)}
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => handleDelete(pet._id)}
                                        variant="danger"
                                        size="sm"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                variant="outline"
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {pets.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pets found</h3>
                        <p className="text-gray-600">Try adjusting your search filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPetsPage; 