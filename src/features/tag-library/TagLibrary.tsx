import { useState, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext-v2';
import { Plus, Search, Filter } from 'lucide-react';
import TagCard from './components/TagCard';
import TagModal from './components/TagModal';
import { Tag } from '../../types/tag';
import tagLibraryData from '../../data/tagLibrary.json';

/**
 * Tag Library - Main View
 *
 * Browse and manage tags for intelligent journey orchestration.
 * Tags qualify members based on properties, activities, associations, and scores.
 *
 * Features:
 * - Browse 30 pre-built banking tags
 * - Search and filter by category
 * - Add tags to implementation
 * - Create custom tags
 * - View tag qualification rules
 */

type CategoryType = 'all' | 'origin' | 'behavior' | 'opportunity';

type CategoryStats = {
  all: number;
  origin: number;
  behavior: number;
  opportunity: number;
};

export default function TagLibrary() {
  const { state, addTagFromLibrary } = useProject();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showTagModal, setShowTagModal] = useState<boolean>(false);

  // Get all available tags (pre-built library)
  const availableTags = tagLibraryData.tags as Tag[];

  // Get tags already added to this implementation
  const implementationTags = state.tags?.library || [];
  const customTags = state.tags?.custom || [];
  const allImplementationTagIds = [
    ...implementationTags.map((t) => t.id),
    ...customTags.map((t) => t.id),
  ];

  // Filter tags based on search and category
  const filteredTags = useMemo(() => {
    return availableTags.filter((tag) => {
      // Category filter
      if (selectedCategory !== 'all' && tag.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          tag.name.toLowerCase().includes(search) ||
          tag.description.toLowerCase().includes(search) ||
          tag.category.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [availableTags, searchTerm, selectedCategory]);

  // Category statistics
  const categoryStats = useMemo<CategoryStats>(() => {
    const stats: CategoryStats = {
      all: availableTags.length,
      origin: 0,
      behavior: 0,
      opportunity: 0,
    };

    availableTags.forEach((tag) => {
      const category = tag.category as 'origin' | 'behavior' | 'opportunity';
      stats[category]++;
    });

    return stats;
  }, [availableTags]);

  const handleAddTag = async (tag: Tag): Promise<void> => {
    const { error } = await addTagFromLibrary(tag);
    if (error) {
      console.error('Failed to add tag:', error);
      // TODO: Show error notification
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tag Library</h1>
            <p className="mt-2 text-gray-600">
              Browse and add pre-built banking tags to your implementation
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTagModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Custom Tag
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-blue-500 p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Tags
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {categoryStats.all}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-blue-700 p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Origin</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {categoryStats.origin}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-green-700 p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Behavior
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {categoryStats.behavior}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-purple-700 p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Opportunity
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {categoryStats.opportunity}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tags by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              showFilters
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({categoryStats.all})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('origin')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedCategory === 'origin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Origin ({categoryStats.origin})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('behavior')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedCategory === 'behavior'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Behavior ({categoryStats.behavior})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('opportunity')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedCategory === 'opportunity'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Opportunity ({categoryStats.opportunity})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredTags.length} of {availableTags.length} tags
          {implementationTags.length > 0 && (
            <span className="ml-2">
              ({implementationTags.length} added to implementation)
            </span>
          )}
        </p>
      </div>

      {/* Tag Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            isAdded={allImplementationTagIds.includes(tag.id)}
            onAdd={handleAddTag}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tags found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Tag Modal */}
      <TagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        mode="create"
      />
    </div>
  );
}
