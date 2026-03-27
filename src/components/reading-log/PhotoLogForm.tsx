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
      setErrorMessage('사진은 최대 5장까지 올릴 수 있어요.');
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
      setErrorMessage('책 제목, 지은이, 별점을 모두 입력해주세요.');
      return;
    }

    if (photoFiles.length === 0) {
      setErrorMessage('독서록 사진을 최소 1장 올려주세요.');
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
      console.error('독서록 저장 실패:', err);
      setErrorMessage('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 책 정보 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            📖 책 제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="읽은 책의 제목을 써주세요"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ✏️ 지은이 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            placeholder="책을 쓴 사람의 이름을 써주세요"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              📅 읽은 날짜
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
              ⭐ 별점 <span className="text-red-400">*</span>
            </label>
            <StarRating rating={rating} onChange={setRating} size="lg" />
          </div>
        </div>
      </div>

      {/* 사진 업로드 영역 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📸 독서록 사진 <span className="text-red-400">*</span>
          <span className="text-gray-400 font-normal ml-2">
            (최대 5장)
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 기존 사진 미리보기 */}
          {photoPreviews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-amber-200 group"
            >
              <img
                src={preview}
                alt={`독서록 사진 ${index + 1}`}
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
                {index + 1}장
              </div>
            </div>
          ))}

          {/* 사진 추가 버튼 */}
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
                사진 추가
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
          손글씨 독서록을 찍어서 올려주세요. 카메라로 바로 찍거나 갤러리에서 선택할 수 있어요.
        </p>
      </div>

      {/* 한마디 (선택) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          💬 한마디 남기기 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="이 책에 대해 한마디 남겨볼까요?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none"
        />
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {errorMessage}
        </div>
      )}

      {/* 저장 버튼 */}
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
            사진 올리는 중...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            독서록 저장하기
          </>
        )}
      </button>
    </form>
  );
}
