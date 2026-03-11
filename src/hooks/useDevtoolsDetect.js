import { useEffect } from 'react';
import detect from 'devtools-detect';

export function useDevtoolsDetect(onChange) {
  useEffect(() => {
    // 초기 상태 알림
    if (detect.isOpen) {
      onChange(true);
    }

    // 이벤트 리스너 등록 (패키지 내부에서 custom event를 띄워줍니다)
    window.addEventListener('devtoolschange', handleChange);

    function handleChange(e) {
      // e.detail.isOpen: boolean
      onChange(e.detail.isOpen);
    }

    return () => {
      window.removeEventListener('devtoolschange', handleChange);
    };
  }, [onChange]);
}