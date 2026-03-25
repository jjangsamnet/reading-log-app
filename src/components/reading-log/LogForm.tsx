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
    if (!bookTitle || !bookAuthor || !rating || !summary || !impressiveScene || !thoughts) {
      alert('필수 항목을 모두 작성해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        {
          bookTitle,
          bookAuthor,
          readDate: new Date(readDate).getTime(),
          rating,
          summary,
          impressiveScene,
          favoriteQuote,
          thoughts,
          recommendation,
        },
        coverFile || undefined
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-sm transition-all";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* 책 제목 */}
      <div>
        <label className={labelClass}>
          📕 책 제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="예: 어린왕자"
          className={inputClass}
          required
        />
      </div>

      {/* 저자 + 읽은 날짜 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            ✍️ 저자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            placeholder="예: 생텍쥐페리"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            📅 읽은 날짜 <span className="text-red-500">*</span>
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

      {/* 책 표지 사진 */}
      <div>
        <label className={labelClass}>🖼️ 책 표지 사진</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
            hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="표지" className="max-h-40 mx-auto rounded-lg" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Camera className="w-8 h-8" />
              <span className="text-sm">클릭하여 사진을 올려주세요</span>
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

      {/* 별점 */}
      <div>
        <label className={labelClass}>
          ⭐ 별점 <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onChange={setRating} size="lg" />
      </div>

      {/* 줄거리 요약 */}
      <div>
        <label className={labelClass}>
          📝 줄거리 요약 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="이 책은 어떤 이야기인가요? 간단히 적어보세요."
          className={`${inputClass} min-h-[100px] resize-none`}
          required
        />
      </div>

      {/* 인상 깊은 장면 */}
      <div>
        <label className={labelClass}>
          🌟 인상 깊은 장면 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={impressiveScene}
          onChange={(e) => setImpressiveScene(e.target.value)}
          placeholder="가장 기억에 남는 장면을 적어보세요."
          className={`${inputClass} min-h-[100px] resize-none`}
          required
        />
      </div>

      {/* 좋아하는 구절 */}
      <div>
        <label className={labelClass}>💬 좋아하는 구절</label>
        <textarea
          value={favoriteQuote}
          onChange={(e) => setFavoriteQuote(e.target.value)}
          placeholder="마음에 드는 문장을 적어보세요."
          className={`${inputClass} min-h-[80px] resize-none`}
        />
      </div>

      {/* 나의 생각 */}
      <div>
        <label className={labelClass}>
          💭 나의 생각 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="이 책을 읽고 어떤 생각이 들었나요?"
          className={`${inputClass} min-h-[120px] resize-none`}
          required
        />
      </div>

      {/* 추천 이유 */}
      <div>
        <label className={labelClass}>👍 추천 이유</label>
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          placeholder="친구들에게 이 책을 추천하는 이유를 적어보세요."
          className={`${inputClass} min-h-[80px] resize-none`}
        />
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={submitting || disabled}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-base
          hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            저장 중...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {isEdit ? '독서록 수정하기' : '독서록 저장하기'}
          </>
        )}
      </button>
    </form>
  );
}
