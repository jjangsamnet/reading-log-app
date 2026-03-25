// 6자리 초대 코드 생성
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되는 문자 제외 (0,O,1,I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 그리드 레이아웃 자동 결정
export function getGridLayout(studentCount: number): string {
  if (studentCount <= 25) return '5x5';
  if (studentCount <= 30) return '5x6';
  return '5x7';
}

// 그리드 크기 파싱
export function parseGridLayout(layout: string): { cols: number; rows: number } {
  const [cols, rows] = layout.split('x').map(Number);
  return { cols, rows };
}

// 다음 빈 좌석 찾기
export function findNextEmptySeat(
  students: { seat: { row: number; col: number } }[],
  layout: string
): { row: number; col: number } | null {
  const { cols, rows } = parseGridLayout(layout);
  const occupied = new Set(students.map((s) => `${s.seat.row}-${s.seat.col}`));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!occupied.has(`${r}-${c}`)) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// 날짜 포맷
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 상대 시간
export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return formatDate(timestamp);
}
