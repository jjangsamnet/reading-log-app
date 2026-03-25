import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export default function StarRating({
  rating,
  onChange,
  size = 'md',
  readonly = false,
}: StarRatingProps) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${sizeMap[size]} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
