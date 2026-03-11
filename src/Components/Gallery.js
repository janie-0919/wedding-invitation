import React, { useEffect, useState } from 'react';
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import AOS from 'aos';
import { supabase } from '../supabase';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/scss/lightgallery.scss';
import 'lightgallery/scss/lg-zoom.scss';
import { gaEvent } from '../utils/ga';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [visibleImages] = useState(9);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleBeforeOpen = () => document.body.classList.add('scrOff');
    const handleClose = () => document.body.classList.remove('scrOff');

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const { data, error } = await supabase.storage
                    .from('gallery')
                    .list('', { sortBy: { column: 'name', order: 'asc' } });

                if (error) throw error;

                const urls = data
                    .filter(file => file.name !== '.emptyFolderPlaceholder')
                    .map(file => {
                        const { data: thumbData } = supabase.storage
                            .from('gallery')
                            .getPublicUrl(file.name, {
                                transform: { width: 1000, quality: 75 }
                            });
                        const { data: originalData } = supabase.storage
                            .from('gallery')
                            .getPublicUrl(file.name);
                        return {
                            thumb: thumbData.publicUrl,
                            full: originalData.publicUrl,
                        };
                    });

                setImages(urls);
                gaEvent('gallery_loaded', { total: urls.length, locale: 'ko', page: '/' });
            } catch (err) {
                console.error('Gallery 불러오기 실패:', err);
                setError('이미지를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    useEffect(() => {
        if (!loading && !error && images.length > 0) {
            setTimeout(() => {
                AOS.init({ duration: 800, once: true });
                AOS.refresh();
            }, 100);
        }
    }, [loading, error, images]);

    const handleShowMore = () => {
        gaEvent('click_show_more', {
            event_label: '사진 더보기',
            visible_before: visibleImages,
            total: images.length,
            locale: 'ko',
            page: '/',
        });
        setShowAll(true);
    };

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="gallery">
            <LightGallery
                elementClassNames="list"
                download={false}
                controls={false}
                mobileSettings={{ controls: false, showCloseIcon: true, download: false }}
                plugins={[lgThumbnail]}
                thumbnail={true}
                onBeforeOpen={handleBeforeOpen}
                onAfterClose={handleClose}
            >
                {(showAll ? images : images.slice(0, visibleImages)).map((item, index) => (
                    <a
                        href={item.full}
                        key={index}
                        data-aos="fade"
                        data-aos-delay={index * 50}
                        onClick={() =>
                            gaEvent('click_gallery_item', { index, locale: 'ko', page: '/' })
                        }
                    >
                        <img src={item.thumb} alt={`gallery-${index}`} />
                    </a>
                ))}
            </LightGallery>

            {!showAll && images.length > visibleImages && (
                <div className="btn-more-wrap" data-aos="fade" data-aos-delay="200">
                    <div className="shade" />
                    <button onClick={handleShowMore} className="btn btn-lg with-icon">
                        <i className="ico ico-plus" />
                        <span>사진 더보기</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Gallery;