import { useState, useEffect } from 'react';
import api from '../../../api';
import { Upload, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';
import UploadModal from './UploadModal';
import { GallerySkeleton } from './Skeleton';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetchImages();
    // Sync gallery every 2 minutes (media changes are less frequent)
    const interval = setInterval(fetchImages, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchImages = async () => {
    try {
      const res = await api.get('/api/admin/gallery/');
      if (Array.isArray(res.data)) {
        setImages(res.data);
      }
    } catch (err) {
      console.error('Gallery sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this image from the gallery?')) return;
    try {
      await api.delete(`/api/admin/gallery/${id}/`);
      fetchImages();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black">Media Assets</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">Sanctuary photography and production media.</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center bg-utonga-green text-white px-5 py-2.5 rounded-lg font-black hover:bg-opacity-90 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-utonga-green/20 cursor-pointer"
        >
          <Upload size={14} className="mr-2" /> Upload Asset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? (
          <>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <GallerySkeleton key={i} />)}
          </>
        ) : images.length > 0 ? images.map((img) => (
          <div key={img.id} className="group bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800/50 transition-all shadow-lg">
            <div className="relative aspect-square bg-black overflow-hidden">
              <img
                src={img.image_url || img.image || `https://r2-placeholder.com/${img.image_key}`}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-black/80 backdrop-blur-md rounded-lg text-white hover:text-utonga-accent transition-colors cursor-pointer"><Edit2 size={12} /></button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2 bg-black/80 backdrop-blur-md rounded-lg text-white hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-utonga-accent leading-none">{img.category}</span>
              <h4 className="text-[10px] font-bold text-gray-200 mt-1 line-clamp-1 leading-tight">{img.title}</h4>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 bg-gray-900 border border-gray-800 border-dashed rounded-2xl text-center">
            <ImageIcon size={32} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Gallery vault empty.</p>
          </div>
        )}
      </div>

      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={fetchImages}
        />
      )}
    </div>
  );
};

export default GalleryManager;
