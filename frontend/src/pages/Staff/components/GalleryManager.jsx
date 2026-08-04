import { useState, useEffect } from 'react';
import api from '../../../api';
import { Upload, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';
import UploadModal from './UploadModal';

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
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Media Gallery</h1>
          <p className="text-gray-500 mt-1 font-medium">Upload and organize sanctuary photography for production.</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center bg-utonga-green text-white px-8 py-4 rounded-2xl font-black hover:bg-opacity-90 transition-all text-sm shadow-xl shadow-utonga-green/20"
        >
          <Upload size={18} className="mr-3" /> Upload New Photo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-500 italic">Accessing media assets...</div>
        ) : images.length > 0 ? images.map((img) => (
          <div key={img.id} className="group bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden hover:border-utonga-accent transition-all">
            <div className="relative aspect-square bg-black overflow-hidden">
              <img
                src={img.image_url || img.image || `https://r2-placeholder.com/${img.image_key}`}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-3 bg-black/80 backdrop-blur-md rounded-xl text-white hover:text-utonga-accent"><Edit2 size={16} /></button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-3 bg-black/80 backdrop-blur-md rounded-xl text-white hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-utonga-accent">{img.category}</span>
              <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{img.title}</h4>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 bg-gray-900 border border-gray-800 border-dashed rounded-[3rem] text-center">
            <ImageIcon size={64} className="mx-auto text-gray-800 mb-6" />
            <p className="text-gray-500 font-bold max-w-xs mx-auto">Your sanctuary gallery is currently empty. Start uploading photos to build your brand.</p>
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
