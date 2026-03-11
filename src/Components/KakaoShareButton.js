import React, { useEffect, useRef } from 'react';
import { gaEvent } from '../utils/ga';

const KakaoShareButton = () => {
    const busyRef = useRef(false);

    useEffect(() => {
        initKakao();
    }, []);

    const initKakao = () => {
        if (!window.Kakao) return;
        const kakao = window.Kakao;
        if (!kakao.isInitialized()) {
            try {
                kakao.init(process.env.REACT_APP_KAKAO_APP_KEY);
            } catch (e) {
                gaEvent('click_kakao_share_error', { reason: 'init_failed', message: String(e), locale: 'ko', page: '/' });
            }
        }
    };

    const shareKakao = () => {
        if (busyRef.current) return;
        busyRef.current = true;
        setTimeout(() => (busyRef.current = false), 1500);

        gaEvent('click_kakao_share', { event_label: '카카오톡 공유하기', locale: 'ko', page: '/' });
        gaEvent('share', { method: 'kakaotalk', content_type: 'invitation', content_id: 'wedding-20251025-ko', locale: 'ko', page: '/' });

        if (!window.Kakao) {
            gaEvent('click_kakao_share_error', { reason: 'no_kakao_sdk', locale: 'ko', page: '/' });
            alert('카카오 SDK가 아직 로드되지 않았어요. 잠시 후 다시 시도해주세요.');
            return;
        }

        const kakao = window.Kakao;
        if (!kakao.isInitialized()) {
            try {
                kakao.init(process.env.REACT_APP_KAKAO_APP_KEY);
            } catch (e) {
                gaEvent('click_kakao_share_error', { reason: 'init_failed_retry', message: String(e), locale: 'ko', page: '/' });
                alert('카카오 초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.');
                return;
            }
        }

        const siteUrl = window.location.origin;

        kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: '철수♥️영희 결혼식에 초대합니다.',
                description: '10월 25일(토) 12:30 셀럽앤어셈',
                imageUrl: `${siteUrl}/img/og.jpg`,
                link: {
                    mobileWebUrl: siteUrl,
                    webUrl: siteUrl,
                },
            },
            buttons: [
                {
                    title: '청첩장 보기',
                    link: {
                        mobileWebUrl: siteUrl,
                        webUrl: siteUrl,
                    },
                },
                {
                    title: '위치 보기',
                    link: {
                        mobileWebUrl: 'https://kko.to/_o-c2MsbDM',
                        webUrl: 'https://kko.to/_o-c2MsbDM',
                    },
                },
            ],
        });
    };

    return (
        <button className="btn btn-lg btn-kakao with-icon" onClick={shareKakao}>
            <i className="ico ico-kakao" />
            <span>카카오톡으로 공유하기</span>
        </button>
    );
};

export default KakaoShareButton;