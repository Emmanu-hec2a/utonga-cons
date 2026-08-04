import { useState } from 'react';
import api from '../../../api';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('trail');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0] && !title) {
      // Auto-fill title from filename
      const name = e.target.files[0].name.split('.')[0];
      setTitle(name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image to upload.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('alt_text', altText);

    try {
      await api.post('/api/admin/gallery/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess();
      onClose();
      // Reset form
      setFile(null);
      setTitle('');
      setAltText('');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Ensure you are logged in as admin.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-8 border-b border-gray-800">
          <h2 className="text-2xl font-black italic">Upload Media</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="gallery-upload"
                accept="image/*"
              />
              <label
                htmlFor="gallery-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-800 rounded-[2rem] cursor-pointer hover:border-utonga-green transition-all bg-black/40 group-hover:bg-black/60"
              >
                {file ? (
                  <div className="text-center px-4">
                    <CheckCircle2 size={40} className="text-utonga-green mx-auto mb-2" />
                    <p className="text-sm font-bold truncate max-w-[250px]">{file.name}</p>
                    <p className="text-xs text-gray-500">Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={40} className="text-gray-700 mx-auto mb-2 group-hover:text-utonga-green transition-colors" />
                    <p className="text-sm font-bold text-gray-500">Drop image here or click to browse</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-2 font-black">JPG, PNG, WebP up to 10MB</p>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Image Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Mist at Hippo Point"
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-accent text-sm font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-accent text-sm font-bold appearance-none"
                >
                  <option value="trail">Forest Trail</option>
                  <option value="wetland">Wetland</option>
                  <option value="hippo">Hippo Point</option>
                  <option value="garden">Botanical Garden</option>
                  <option value="camp">Camp Site</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Alt Text (Accessibility)</label>
              <textarea
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe what's in the photo for visually impaired users..."
                className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-accent text-sm font-medium h-20 resize-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-utonga-green text-white py-5 rounded-[1.5rem] font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-utonga-green/20 flex items-center justify-center gap-3"
          >
            {uploading ? 'Processing Transaction...' : (
              <><Upload size={20} /> Deploy to Sanctuary Gallery</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
