import { useState, FormEvent, useRef } from 'react';
import { ReadingLogInput } from '../../types';
import StarRating from '../common/StarRating';
import { Camera, Save, Loader2 } from 'lucide-react';

interface LogFormProps {
  initialData?: Partial<ReadingLogInput>;
  onSubmit: (data: ReadingLogInput, coverFile?: File) => Promise<void>;
  isEdit?: boolean;
  disabled?: boolean;
}

export default function LogForm({ initialData, onSubmit, isEdit = false, disabled = false }: LogFormProps) {
  const [bookTitle, setBookTitle] = useState(initialData?.bookTitle || '');
  const [bookAuthor, setBookAuthor] = useState(initialData?.bookAuthor || '');
  const [readDate, setReadDate] = useState(
    initialData?.readDate
      ? new Date(initialData.readDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [impressiveScene, setImpressiveScene] = useState(initialData?.impressiveScene || '');
  const [favoriteQuote, setFavoriteQuote] = useState(initialData?.favoriteQuote || '');
  const [thoughts, setThoughts] = useState(initialData?.thoughts || '');
  const [recommendation, setRecommendation] = useState(initialData?.recommendation || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.coverImage || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!bookTitle.trim() || !bookAuthor.trim() || !rating || !summary.trim() || !impressiveScene.trim() || !thoughts.trim()) {
      setErrorMessage('íì í­ëª©ì ëª¨ë ìì±í´ì£¼ì¸ì.');
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
          summary: summary.trim(),
          impressiveScene: impressiveScene.trim(),
          favoriteQuote: favoriteQuote.trim(),
          thoughts: thoughts.trim(),
          recommendation: recommendation.trim(),
        },
        coverFile || undefined
      );
    } catch (err) {
      console.error('ëìë¡ ì ì¥ ì¤í¨:', err);
      setErrorMessage('ì ì¥ì ì¤í¨íì´ì. ë¤ì ìëí´ì£¼ì¸ì.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-sm transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* ì± ì ëª© */}
      <div>
        <label className={labelClass}>
          ð ì± ì ëª© <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="ì: ì´ë¦°ìì"
          className={inputClass}
          required
        />
      </div>

      {/* ì ì + ì½ì ë ì§ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            âï¸ ì ì <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            placeholder="ì: ìíì¥íë¦¬"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            ð ì½ì ë ì§ <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={readDate}
            onChange={(e) => setReadDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* ì± íì§ ì¬ì§ */}
      <div>
        <label className={labelClass}>ð¼ï¸ ì± íì§ ì¬ì§</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
            hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="íì§" className="max-h-40 mx-auto rounded-lg" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Camera className="w-8 h-8" />
              <span className="text-sm">í´ë¦­íì¬ ì¬ì§ì ì¬ë ¤ì£¼ì¸ì</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      {/* ë³ì  */}
      <div>
        <label className={labelClass}>
          â­ ë³ì  <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onChange={setRating} size="lg" />
      </div>

      {/* ì¤ê±°ë¦¬ ìì½ */}
      <div>
        <label className={labelClass}>
          ð ì¤ê±°ë¦¬ ìì½ <span className="text-red-500">*</span>
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="ì´ ì±ì ì´ë¤ ì´ì¼ê¸°ì¸ê°ì? ê°ë¨í ì ì´ë³´ì¸ì."
          className={`${inputClass} min-h-[100px] resize-none`}
          required
        />
      </div>

      {/* ì¸ì ê¹ì ì¥ë©´ */}
      <div>
        <label className={labelClass}>
          ð ì¸ì ê¹ì ì¥ë©´ <span className="text-red-500">*</span>
        </label>
        <textarea
          value={impressiveScene}
          onChange={(e) => setImpressiveScene(e.target.value)}
          placeholder="ê°ì¥ ê¸°ìµì ë¨ë ì¥ë©´ì ì ì´ë³´ì¸ì."
          className={`${inputClass} min-h-[100px] resize-none`}
          required
        />
      </div>

      {/* ì¢ìíë êµ¬ì  */}
      <div>
        <label className={labelClass}>ð¬ ì¢ìíë êµ¬ì </label>
        <textarea
          value={favoriteQuote}
          onChange={(e) => setFavoriteQuote(e.target.value)}
          placeholder="ë§ìì ëë ë¬¸ì¥ì ì ì´ë³´ì¸ì."
          className={`${inputClass} min-h-[80px] resize-none`}
        />
      </div>

      {/* ëì ìê° */}
      <div>
        <label className={labelClass}>
          ð­ ëì ìê° <span className="text-red-500">*</span>
        </label>
        <textarea
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="ì´ ì±ì ì½ê³  ì´ë¤ ìê°ì´ ë¤ìëì?"
          className={`${inputClass} min-h-[120px] resize-none`}
          required
        />
      </div>

      {/* ì¶ì² ì´ì  */}
      <div>
        <label className={labelClass}>ð ì¶ì² ì´ì </label>
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          placeholder="ì¹êµ¬ë¤ìê² ì´ ì±ì ì¶ì²íë ì´ì ë¥¼ ì ì´ë³´ì¸ì."
          className={`${inputClass} min-h-[80px] resize-none`}
        />
      </div>

      {/* ìë¬ ë©ìì§ */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {errorMessage}
        </div>
      )}

      {/* ì ì¶ ë²í¼ */}
      <button
        type="submit"
        disabled={submitting || disabled}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-base
          hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            ì ì¥ ì¤...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {isEdit ? 'ëìë¡ ìì íê¸°' : 'ëìë¡ ì ì¥íê¸°'}
          </>
        )}
      </button>
    </form>
  );
}
