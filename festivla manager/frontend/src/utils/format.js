/**
 * 날짜/시간 포맷팅
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 시간만 포맷팅 (HH:mm)
 */
export const formatTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 대기 번호 포맷팅
 */
export const formatWaitingNumber = (number) => {
  if (!number) return '';
  return `#${String(number).padStart(4, '0')}`;
};

/**
 * 전화번호 포맷팅 (010-1234-5678)
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phoneNumber;
};

/**
 * 경과 시간 계산 (분 단위)
 */
export const getElapsedMinutes = (startTime) => {
  if (!startTime) return 0;
  const start = new Date(startTime);
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60));
};
