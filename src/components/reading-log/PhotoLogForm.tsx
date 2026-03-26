import { useState, FormEvent, useRef } from 'react';
import { ReadingLogInput } from '../../types';
import StarRating from '../common/StarRating';
import { Camera, X, Save, Loader2, ImagePlus } from 'lucide-react';

interface PhotoLogFormProps {
  onSubmit: (data: ReadingLogInput, photoFiles: File[]) => Promise<void>;
}

export default function PhotoLogForm({ onSubmit }: PhotoLogFormProps) {
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [readDate, setReadDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [rating, setRating] = useState(0);
  const [thoughts, setThoughts] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (photoFiles.length + newFiles.length > 5) {
      setErrorMessage('ì¬ì§ì ìµë 5ì¥ê¹ì§ ì¬ë¦´ ì ìì´ì.');
      return;
    }

    const updatedFiles = [...photoFiles, ...newFiles];
    setPhotoFiles(updatedFiles);

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!bookTitle.trim() || !bookAuthor.trim() || !rating) {
      setErrorMessage('ì± ì ëª©, ì§ìì´, ë³ì ì ëª¨ë ìë ¥í´ì£¼ì¸ì.');
      return;
    }

    if (photoFiles.length === 0) {
      setErrorMessage('ëìë¡ ì¬ì§ì ìµì 1ì¥ ì¬ë ¤ì£¼ì¸ì.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        {
          bookTitle: bookTitle.trim(),
          bookAuthor: bookAuthor.trim(),
          readDate: new Date(readDate).getTime(),
          rating,
          summary: '',
          impressiveScene: '',
          thoughts: thoughts.trim(),
        },
        photoFiles
      );
    } catch (err) {
      console.error('ëìë¡ ì ì¥ ì¤í¨:', err);
      setErrorMessage('ì ì¥ì ì¤í¨íì´ì. ë¤ì ìëí´ì£¼ì¸ì.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ì± ì ë³´ */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ð ì± ì ëª© <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="ì½ì ì±ì ì ëª©ì ì¨ì£¼ì¸ì"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            âï¸ ì§ìì´ <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            placeholder="ì±ì ì´ ì¬ëì ì´ë¦ì ì¨ì£¼ì¸ì"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ð ì½ì ë ì§
            </label>
            <input
              type="date"
              value={readDate}
              onChange={(e) => setReadDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              â­ ë³ì  <span className="text-red-400">*</span>
            </label>
            <StarRating rating={rating} onChange={setRating} size="lg" />
          </div>
        </div>
      </div>

      {/* ì¬ì§ ìë¡ë ìì­ */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ð¸ ëìë¡ ì¬ì§ <span className="text-red-400">*</span>
          <span className="text-gray-400 font-normal ml-2">
            (ìµë 5ì¥)
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* ê¸°ì¡´ ì¬ì§ ë¯¸ë¦¬ë³´ê¸° */}
          {photoPreviews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-amber-200 group"
            >
              <img
                src={preview}
                alt={`ëìë¡ ì¬ì§ ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handlePhotoRemove(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1">
                {index + 1}ì¥
              </div>
            </div>
          ))}

          {/* ì¬ì§ ì¶ê° ë²í¼ */}
          {photoFiles.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-amber-300 bg-amber-50
                flex flex-col items-center justify-center gap-2
                hover:border-amber-400 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <ImagePlus className="w-10 h-10 text-amber-400" />
              <span className="text-sm text-amber-600 font-medium">
                ì¬ì§ ì¶ê°
              </span>
              <span className="text-xs text-amber-400">
                {photoFiles.length}/5
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoAdd}
          className="hidden"
        />

        <p className="text-xs text-gray-400 mt-2">
          ìê¸ì¨ ëìë¡ì ì°ì´ì ì¬ë ¤ì£¼ì¸ì. ì¹´ë©ë¼ë¡ ë°ë¡ ì°ê±°ë ê°¤ë¬ë¦¬ìì ì íí  ì ìì´ì.
        </p>
      </div>

      {/* íë§ë (ì í) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          ð¬ íë§ë ë¨ê¸°ê¸° <span className="text-gray-400 font-normal">(ì í)</span>
        </label>
        <textarea
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="ì´ ì±ì ëí´ íë§ë ë¨ê²¨ë³¼ê¹ì?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none"
        />
      </div>

      {/* ìë¬ ë©ìì§ */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {errorMessage}
        </div>
      )}

      {/* ì ì¥ ë²í¼ */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300
          text-white font-bold text-lg rounded-xl transition-colors
          flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            ì¬ì§ ì¬ë¦¬ë ì¤...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            ëìë¡ ì ì¥íê¸°
          </>
        )}
      </button>
    </form>
  );
}
