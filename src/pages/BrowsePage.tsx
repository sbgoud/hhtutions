import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'
import { TuitionPost } from '../lib/supabase'
import { Search, Filter, MapPin, Calendar, DollarSign, Users, Grid, List, SortAsc } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
  'History', 'Geography', 'Economics', 'Computer Science', 'Accountancy',
  'Business Studies', 'Social Science', 'Science', 'General Knowledge'
]

const TUITION_TYPES = ['Home Tuition', 'At Tutor Home', 'At Institute', 'Online']
const TIMINGS = ['Morning', 'Afternoon', 'Evening', 'AnyTime']

interface Filters {
  city: string
  course: string
  subjects: string[]
  tuition_type: string
  minPrice: string
  maxPrice: string
  timing: string
  sortBy: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { posts, loading, fetchPosts } = usePostsStore()
  const { user, profile } = useAuthStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [filters, setFilters] = useState<Filters>({
    city: searchParams.get('city') || '',
    course: searchParams.get('course') || '',
    subjects: searchParams.getAll('subjects'),
    tuition_type: searchParams.get('tuition_type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    timing: searchParams.get('timing') || '',
    sortBy: (searchParams.get('sortBy') as Filters['sortBy']) || 'date_desc'
  })

  useEffect(() => {
    const params = new URLSearchParams()

    if (filters.city) params.set('city', filters.city)
    if (filters.course) params.set('course', filters.course)
    if (filters.tuition_type) params.set('tuition_type', filters.tuition_type)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.timing) params.set('timing', filters.timing)
    if (filters.sortBy !== 'date_desc') params.set('sortBy', filters.sortBy)

    filters.subjects.forEach(subject => params.append('subjects', subject))

    setSearchParams(params)
  }, [filters, setSearchParams])

  useEffect(() => {
    fetchPosts({
      city: filters.city || undefined,
      course: filters.course || undefined,
      tuition_type: filters.tuition_type || undefined,
      minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined
    })
  }, [fetchPosts, filters])

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subjects?.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSubjects = filters.subjects.length === 0 ||
      filters.subjects.some(filterSubject =>
        post.subjects?.some(postSubject =>
          postSubject.toLowerCase().includes(filterSubject.toLowerCase())
        )
      )

    return matchesSearch && matchesSubjects
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'date_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'price_asc':
        return a.asked_price - b.asked_price
      case 'price_desc':
        return b.asked_price - a.asked_price
      case 'date_desc':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number, type: string) => {
    const unit = type === 'hourly' ? '/hr' : type === 'monthly' ? '/month' : ''
    return `₹${price}${unit}`
  }

  const handleSubjectToggle = (subject: string) => {
    setFilters(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const clearFilters = () => {
    setFilters({
      city: '',
      course: '',
      subjects: [],
      tuition_type: '',
      minPrice: '',
      maxPrice: '',
      timing: '',
      sortBy: 'date_desc'
    })
    setSearchQuery('')
  }

  const PostCard = ({ post }: { post: TuitionPost }) => (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{post.locality ? `${post.locality}, ` : ''}{post.city}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            {formatPrice(post.asked_price, post.price_type || 'hourly')}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(post.posted_on)}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {post.course && (
          <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {post.course}
          </div>
        )}
        {post.subjects && post.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.subjects.slice(0, 3).map((subject, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                {subject}
              </span>
            ))}
            {post.subjects.length > 3 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{post.subjects.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>{post.gender_pref}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{post.timing}</span>
        </div>
      </div>

      {post.description && (
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {post.description}
        </p>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {post.tuition_type}
        </span>
        <button className="btn-primary text-sm px-4 py-2">
          View Details
        </button>
      </div>
    </div>
  )

  const PostListItem = ({ post }: { post: TuitionPost }) => (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
            <div className="text-right ml-4">
              <div className="text-lg font-bold text-primary">
                {formatPrice(post.asked_price, post.price_type || 'hourly')}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(post.posted_on)}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{post.locality ? `${post.locality}, ` : ''}{post.city}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {post.course && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {post.course}
              </span>
            )}
            {post.subjects?.slice(0, 4).map((subject, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                {subject}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>{post.tuition_type}</span>
            <span>{post.gender_pref} tutor preferred</span>
            <span>{post.timing}</span>
          </div>

          {post.description && (
            <p className="text-gray-700 text-sm line-clamp-2">
              {post.description}
            </p>
          )}
        </div>

        <div className="ml-4">
          <button className="btn-primary text-sm px-4 py-2">
            View Details
          </button>
        </div>
      </div>
    </div>
  )

  if (loading && posts.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Tuition Posts</h1>
        <p className="text-lg text-gray-600">Find tuition opportunities in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-gray-600" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as Filters['sortBy'] }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input
                  type="text"
                  value={filters.course}
                  onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                  placeholder="e.g., Engineering, Medical"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tuition Type</label>
                <select
                  value={filters.tuition_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, tuition_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">All Types</option>
                  {TUITION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timing</label>
                <select
                  value={filters.timing}
                  onChange={(e) => setFilters(prev => ({ ...prev, timing: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Any Time</option>
                  {TIMINGS.map(timing => (
                    <option key={timing} value={timing}>{timing}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {SUBJECTS.map(subject => (
                  <label key={subject} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={clearFilters} className="text-gray-600 hover:text-gray-800 text-sm">
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {sortedPosts.length} tuition {sortedPosts.length === 1 ? 'post' : 'posts'}
        </p>
        {user && profile?.role === 'student' && (
          <div className="text-sm text-gray-500">
            💡 Create your own tuition post to find tutors
          </div>
        )}
      </div>

      {/* Posts Grid/List */}
      {sortedPosts.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tuition posts found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))
              ? 'Try adjusting your search or filters'
              : 'Be the first to post a tuition requirement!'}
          </p>
          {user && profile?.role === 'student' && (
            <button
              onClick={() => window.location.href = '/create'}
              className="btn-primary"
            >
              Create Tuition Post
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {sortedPosts.map(post => (
            viewMode === 'grid' ? (
              <PostCard key={post.id} post={post} />
            ) : (
              <PostListItem key={post.id} post={post} />
            )
          ))}
        </div>
      )}
    </div>
  )
}
