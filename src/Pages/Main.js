import React, {useEffect, useRef, useState} from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import useImageLoader from '../hooks/useImageLoader';
import PopupContentCall from '../Components/PopupContentCall';
import PopupContentAttendance from '../Components/PopupContentAttendance';
import Countdown from '../Components/Countdown';
import Gallery from '../Components/Gallery';
import KakaoMap from "../Components/KakaoMap";
import KakaoShareButton from '../Components/KakaoShareButton'
import Poster from '../Components/Poster'
import AccordionItem from '../Components/AccordionItem'
import '../Style/style.scss';
import Lottie from '../Components/Lottie';
import TextAnimation from '../Components/TextAnimation';
import WeddingTitle from '../Components/WeddingTitle';
import icoCouple from '../assets/ico-couple.json';
import icoFreedom from '../assets/ico-freedom.json';
import icoLocation from '../assets/ico-location.json';
import icoCalendar from '../assets/ico-calendar.json';
import icoAlbum from '../assets/ico-album.json';
import icoBalloon from '../assets/ico-balloon.json';
import { gaEvent } from '../utils/ga';

function Main() {
    // account
    const groomAccounts = [
        {bank: '신한', num: '000 00000 00000', name: '신랑 / 김철수'},
        {bank: '농협', num: '000 0000 0000 00', name: '신랑 아버지 / 김대한'},
        {bank: '기업', num: '000 000000 00000', name: '신랑 어머니 / 이순자'},
    ];

    const brideAccounts = [
        {bank: '카카오뱅크', num: '0000 00 0000000', name: '신부 / 박영희'},
        {bank: '우리', num: '000 000000 00 000', name: '신부 아버지 / 박민국'},
        {bank: '우리', num: '000 000000 000', name: '신부 어머니 / 최정숙'},
    ];

    // Popup
    const [popupType, setPopupType] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const popupRef = useRef(null);

    const openPopup = (popupType) => {
        setPopupType(popupType);
        setIsPopupOpen(true);
        document.body.classList.add('scrOff');
    };

    const closePopup = () => {
        document.body.classList.remove('scrOff');
        setIsPopupOpen(false);
    };

    useEffect(() => {
        if (isPopupOpen) {
            const isIOS = document.documentElement.classList.contains('ios26-safari') || document.body.classList.contains('ios26-safari');

            if (isIOS && popupRef.current) {
                const focusableElements = popupRef.current.querySelectorAll('input, textarea, select');

                const handleFocus = () => {
                    window.scrollTo(0, 0);
                };

                focusableElements.forEach(element => {
                    element.addEventListener('focus', handleFocus);
                });

                return () => {
                    focusableElements.forEach(element => {
                        element.removeEventListener('focus', handleFocus);
                    });
                };
            }
        }
    }, [isPopupOpen]);

    // copy URL
    const copyCurrentUrl = () => {
        const currentUrl = window.location.href;
        const tempInput = document.createElement('input');
        tempInput.value = currentUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        alert('주소가 복사되었습니다!');
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    // image Load
    const imageUrls = [
        'img/groom.jpg',
        'img/bride.jpg',
        'img/sub-poster.jpg',
    ];

    const {loaded} = useImageLoader(imageUrls);

    // AOS
    useEffect(() => {
        AOS.init();
    })



    // GA section 추적
    function useSectionAnalytics({ enabled = true, threshold = 0.5 } = {}) {
        const stateRef = useRef({
            io: null,
            seen: new Set(),
            timings: new Map(),
        });

        useEffect(() => {
            if (!enabled) return;

            const sections = Array.from(document.querySelectorAll('[data-section]'));
            if (!sections.length) return;

            const page_path = window.location.pathname || '/';
            const getId = (el) => el.getAttribute('id') || el.dataset.section || '';
            const getName = (el) => el.dataset.sectionName || getId(el) || el.className || 'section';

            const onEnter = (el) => {
                const now = performance.now();
                const rec = stateRef.current.timings.get(el) || { enterTs: 0, totalMs: 0 };
                if (!stateRef.current.seen.has(el)) {
                    stateRef.current.seen.add(el);
                    gaEvent('section_view', {
                        section_id: getId(el),
                        section_name: getName(el),
                        page_path,
                    });
                }
                rec.enterTs = now;
                stateRef.current.timings.set(el, rec);
            };

            const onExit = (el) => {
                const now = performance.now();
                const rec = stateRef.current.timings.get(el);
                if (!rec || !rec.enterTs) return;
                rec.totalMs += now - rec.enterTs;
                rec.enterTs = 0;
                stateRef.current.timings.set(el, rec);
            };

            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.intersectionRatio >= threshold) onEnter(entry.target);
                        else onExit(entry.target);
                    });
                },
                { threshold }
            );
            stateRef.current.io = io;

            sections.forEach((el) => io.observe(el));

            const flush = () => {
                sections.forEach(onExit);
                sections.forEach((el) => {
                    const rec = stateRef.current.timings.get(el);
                    if (rec && rec.totalMs > 0) {
                        gaEvent('section_engagement', {
                            section_id: getId(el),
                            section_name: getName(el),
                            page_path,
                            visible_ms: Math.round(rec.totalMs),
                        });
                        rec.totalMs = 0;
                        stateRef.current.timings.set(el, rec);
                    }
                });
            };

            const onVis = () => {
                if (document.visibilityState === 'hidden') flush();
            };
            window.addEventListener('pagehide', flush);
            document.addEventListener('visibilitychange', onVis);

            return () => {
                flush();
                document.removeEventListener('visibilitychange', onVis);
                window.removeEventListener('pagehide', flush);
                const io = stateRef.current.io;
                if (io) {
                    io.disconnect();
                    stateRef.current.io = null;
                }
                stateRef.current.seen.clear();
                stateRef.current.timings.clear();
            };
        }, [enabled, threshold]);
    }

    useSectionAnalytics({ enabled: loaded, threshold: 0.5 });

    return (
        <div className="wrap">
            <div className="main">
                {!loaded ? (
                    <div className="poster" style={{height: 'calc(var(--vh, 1vh) * 100)'}} id="poster" data-section="poster" data-section-name="포스터">
                        <div className="loading">
                            <div className="heart-wrap">
                                <div className="heart"></div>
                                <div className="txt">Loading...</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* s poster */}
                        <div className="poster" style={{height: 'calc(var(--vh, 1vh) * 100)'}}>
                            <WeddingTitle loaded={loaded}/>
                            <div className="img"/>
                        </div>
                        <div className="view-box">
                            <TextAnimation/>
                            <Poster imgUrl={imageUrls[2]}/>
                        </div>
                        {/* e poster */}

                        {/* s profile */}
                        <div className="content">
                            <div className="profile" id="profile" data-section="profile" data-section-name="프로필">
                                <div className="heading" data-aos="fade">
                                    <div className="img">
                                        <Lottie animationData={icoCouple}/>
                                    </div>
                                    <div className="title">Profile</div>
                                </div>
                                <div className="row">
                                    <div className="col" data-aos="fade-right" data-aos-offset="300" data-aos-easing="ease-in-sine">
                                        <div className="img"><img src={imageUrls[0]} alt="신랑"/></div>
                                        <div className="tit"><span className="color-blue">신랑</span> 김철수</div>
                                        <div className="btns-contact">
                                            <a
                                                className="btn-sms"
                                                href="sms:01000000000"
                                                onClick={() => gaEvent('click_sms', { event_label: 'groom', locale: 'ko', page: '/' })}
                                            >
                                                <i className="ico ico-sms"></i><span className="sr-only">문자</span>
                                            </a>
                                            <a
                                                className="btn-call"
                                                href="tel:01000000000"
                                                onClick={() => gaEvent('click_tel', { event_label: 'groom' })}
                                            >
                                                <i className="ico ico-call"></i><span className="sr-only">전화</span>
                                            </a>
                                        </div>
                                        <div className="desc">XXXX년생, 경기도</div>
                                        <div className="hashtag">#ISFJ #태그</div>
                                        <div className="hashtag">#태그</div>
                                        <div className="name-area"><b>김대한</b><b>이순자</b> <span>아들</span></div>
                                    </div>
                                    <div className="col" data-aos="fade-left" data-aos-offset="300"
                                        data-aos-easing="ease-in-sine">
                                        <div className="img"><img src={imageUrls[1]} alt="신부"/></div>
                                        <div className="tit"><span className="color-point">신부</span> 박영희</div>
                                        <div className="btns-contact">
                                            <a
                                                className="btn-sms"
                                                href="sms:01000000001"
                                                onClick={() => gaEvent('click_sms', { event_label: 'bride', locale: 'ko', page: '/' })}
                                            >
                                                <i className="ico ico-sms"></i><span className="sr-only">문자</span>
                                            </a>
                                            <a
                                                className="btn-call"
                                                href="tel:01000000001"
                                                onClick={() => gaEvent('click_tel', { event_label: 'bride' })}
                                            >
                                                <i className="ico ico-call"></i><span className="sr-only">전화</span>
                                            </a>
                                        </div>
                                        <div className="desc">XXXX년생, 서울</div>
                                        <div className="hashtag">#ESTJ #태그</div>
                                        <div className="hashtag">#태그</div>
                                        <div className="name-area"><b>박민국</b><b>최정숙</b> <span>장녀</span></div>
                                    </div>
                                </div>
                                <div className="btn-wrap">
                                    <button
                                        className="btn btn-lg"
                                        onClick={() => {
                                            gaEvent('open_popup_call', { event_label: '혼주 연락하기' });
                                            openPopup('call');
                                        }}
                                    >
                                        혼주 연락하기
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* e profile */}

                        {/* s calendar */}
                        <div className="content" id="calendar" data-section="calendar" data-section-name="캘린더">
                            <div className="calendar">
                                <div className="heading" data-aos="fade">
                                    <div className="img">
                                        <Lottie animationData={icoCalendar}/>
                                    </div>
                                    <div className="title">10월</div>
                                </div>
                                <div className="table-calendar" data-aos="fade">
                                    <table className="table-body">
                                        <colgroup>
                                            <col style={{width: 'calc(100% / 7)'}} span="7"/>
                                        </colgroup>
                                        <thead>
                                        <tr>
                                            <th className="sun">일</th>
                                            <th>월</th>
                                            <th>화</th>
                                            <th>수</th>
                                            <th>목</th>
                                            <th>금</th>
                                            <th className="sat">토</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td></td><td></td><td></td>
                                            <td>1</td><td>2</td><td>3</td><td>4</td>
                                        </tr>
                                        <tr>
                                            <td>5</td><td>6</td><td>7</td><td>8</td>
                                            <td>9</td><td>10</td><td>11</td>
                                        </tr>
                                        <tr>
                                            <td>12</td><td>13</td><td>14</td><td>15</td>
                                            <td>16</td><td>17</td><td>18</td>
                                        </tr>
                                        <tr>
                                            <td>19</td><td>20</td><td>21</td><td>22</td>
                                            <td>23</td><td>24</td>
                                            <td><div className="d-day"><span>25</span></div></td>
                                        </tr>
                                        <tr>
                                            <td>26</td><td>27</td><td>28</td><td>29</td>
                                            <td>30</td><td>31</td><td></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <Countdown/>
                        </div>
                        {/* e calendar */}

                        {/* s 오시는 길 */}
                        <div className="content">
                            <div className="location" id="location" data-section="location" data-section-name="오시는 길">
                                <div className="heading" data-aos="fade" data-aos-offset="100">
                                    <div className="img">
                                        <Lottie animationData={icoLocation} width={60} height={60}/>
                                    </div>
                                    <div className="title">오시는 길</div>
                                </div>
                                <div className="address" data-aos="fade">
                                    <div className="title">서울 강남구 언주로 711, 셀럽앤어셈 2F</div>
                                    <div className="desc">(서울 강남구 논현동 71-2)</div>
                                    <div className="num"><a href="tel:02-545-2222">02-545-2222</a></div>
                                </div>
                                <div className="map" data-aos="fade">
                                    <div className="filter"/>
                                    <KakaoMap/>
                                    <div className="map-links">
                                        <a className="link" target="_blank" rel="noopener noreferrer"
                                            href="https://tmap.life/c1fef39d"
                                            onClick={() => gaEvent('click_map', { event_label: 'tmap', locale: 'ko', page: '/' })}>
                                            <i className="ico ico-tmap"></i><span className="tit">티맵</span>
                                        </a>
                                        <a className="link" target="_blank" rel="noopener noreferrer"
                                            href="https://map.kakao.com/link/to/셀럽앤어셈,37.517752504536155,127.03500387141798"
                                            onClick={() => gaEvent('click_map', { event_label: 'kakao', locale: 'ko', page: '/' })}>
                                            <i className="ico ico-kakao"></i><span className="tit">카카오맵</span>
                                        </a>
                                        <a className="link" target="_blank" rel="noopener noreferrer"
                                            href="https://naver.me/5yPIw81q"
                                            onClick={() => gaEvent('click_map', { event_label: 'naver', locale: 'ko', page: '/' })}>
                                            <i className="ico ico-naver"></i><span className="tit">네이버 지도</span>
                                        </a>
                                    </div>
                                </div>
                                <div className="transit" data-aos="fade">
                                    <div className="item">
                                        <div className="info">
                                            <div className="title">
                                                <div className="img"><i className="ico ico-subway"></i></div>
                                                <div className="tit">지하철</div>
                                            </div>
                                            <div className="desc">
                                                <div className="d-item">
                                                    <span className="badge" style={{backgroundColor: '#717c01'}}>7호선</span> 학동역 10번 출구 <span className="walk"><i className="ico ico-walk"></i> 7분</span>
                                                </div>
                                                <div className="d-item">
                                                    <span className="badge" style={{backgroundColor: '#F5A200'}}>수인<span style={{fontFamily: 'continuous'}}>·</span>분당선</span>
                                                    <span className="badge" style={{backgroundColor: '#717c01'}}>7호선</span> 강남구청역 3번 출구 <div className="walk"><i className="ico ico-walk"></i> 12분</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="info">
                                            <div className="title">
                                                <div className="img"><i className="ico ico-bus"></i></div>
                                                <div className="tit">버스</div>
                                            </div>
                                            <div className="desc">
                                                <div className="ele">
                                                    <div className="ele-tit"><b>'서울세관'</b> 정류장 하차</div>
                                                    <div className="ele-list">
                                                        <div className="ele-item"><span className="bus-badge" style={{backgroundColor: '#0068b7'}}/>간선버스 141</div>
                                                        <div className="ele-item"><span className="bus-badge" style={{backgroundColor: '#e60012'}}/>직행버스 3600</div>
                                                        <div className="ele-item"><span className="bus-badge" style={{backgroundColor: '#00a0e9'}}/>공항버스 6703</div>
                                                    </div>
                                                </div>
                                                <div className="ele">
                                                    <div className="ele-tit"><b>'서울세관사거리'</b> 정류장 하차</div>
                                                    <div className="ele-list">
                                                        <div className="ele-item"><span className="bus-badge" style={{backgroundColor: '#0068b7'}}/>간선버스 401</div>
                                                        <div className="ele-item"><span className="bus-badge" style={{backgroundColor: '#53b332'}}/>지선버스 6411</div>
                                                        <div className="ele-item"><span className="bus-badge" style={{backgroundColor: '#53b332'}}/>마을버스 강남08</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="info">
                                            <div className="title">
                                                <div className="img"><i className="ico ico-car"></i></div>
                                                <div className="tit">자가용</div>
                                            </div>
                                            <div className="desc">
                                                네비게이션 검색명 : <b>'건설회관', '셀럽앤어셈'</b><br/>
                                                - 도로명주소 : <b>서울 강남구 언주로 711</b><br/>
                                                - 구.지번주소 : <b>서울 강남구 논현동 71-2</b><br/>
                                                <b>* 1시간 30분 주차 무료 (10분당 800원)</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* e 오시는 길 */}

                        {/* s gallery */}
                        <div className="content">
                            <div className="gallery" id="gallery" data-section="gallery" data-section-name="갤러리">
                                <div className="heading" data-aos="fade">
                                    <div className="img"><Lottie animationData={icoAlbum}/></div>
                                    <div className="title">우리의 행복한 시간</div>
                                </div>
                                <Gallery/>
                            </div>
                        </div>
                        {/* e gallery */}

                        {/* s 안내사항 */}
                        <div className="content">
                            <div className="information" id="information" data-section="information" data-section-name="안내 사항">
                                <div className="heading" data-aos="fade">
                                    <div className="img"><Lottie animationData={icoBalloon}/></div>
                                    <div className="title">안내 사항</div>
                                </div>
                                <div className="grid">
                                    <div className="item bride" data-aos="fade">
                                        <div className="item-head">🤍 신부대기실 🤍</div>
                                        <div className="item-body">
                                            신부대기실은 예식 시작 <b>10분 전 마감</b>됩니다.<br/>
                                            <b>12시 20분</b>에 문이 닫힐 예정이니,<br/>
                                            여유롭게 오셔서 신부와 인사해주세요!
                                        </div>
                                    </div>
                                    <div className="item ceremony" data-aos="fade">
                                        <div className="item-head">🧡 예식 🧡</div>
                                        <div className="item-body">
                                            본식은 <b>2층</b>에서 진행됩니다.<br/><br/>
                                            저희의 <b>식전 영상</b> 상영이 준비되어 있으니<br/>
                                            여유롭게 자리에 착석해 주시기 바랍니다.
                                        </div>
                                    </div>
                                    <div className="item attendant" data-aos="fade">
                                        <div className="item-head">💛 강아지 화동 💛</div>
                                        <div className="item-body">
                                            저희의 소중한 가족, <br/><b>반려견 망고</b>가 화동으로 함께할 예정입니다.<br/><br/>
                                            다소 번잡하거나 소음이 있을 수 있으나,<br/>
                                            너른 양해 부탁드립니다🙏🏻
                                        </div>
                                    </div>
                                    <div className="item banquet" data-aos="fade">
                                        <div className="item-head">💚 연회장(뷔페) 💚</div>
                                        <div className="item-body">
                                            예식 30분 전부터 <b>본관 지하 1층 연회장</b>에서<br/> 뷔페 식사를 이용하실 수 있습니다.<br/><br/>
                                            예식 시작 30분 전인<br/> <b>오후 12시부터 2시까지 이용 가능</b>합니다.<br/><br/>
                                            <b>주류(생맥주/소주/와인)도 제한 없이</b> 준비하였으니,<br/>즐거운 시간을 보내시기 바랍니다.<br/><br/>
                                            소인 : 만 4세 - 8세 (17~21년생)<br/>
                                            대인 : 10세 이상
                                        </div>
                                    </div>
                                    <div className="item parking" data-aos="fade">
                                        <div className="item-head">🩵 주차 🩵</div>
                                        <div className="item-body">
                                            <b>총 주차대수 : </b> 600대<br/>
                                            <b>무료 주차 : </b> 1시간 30분 (이후 10분당 800원)<br/><br/>
                                            <b>🚩 사전 주차 등록 위치<br/></b>
                                            - 1층 이디야 카페 앞<br/>
                                            - 2층 에스컬레이터 옆<br/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* e 안내사항 */}

                        {/* s 마음을 전하는 곳 */}
                        <div className="content">
                            <div className="convey" id="convey" data-section="convey" data-section-name="마음 전하는 곳">
                                <div className="heading" data-aos="fade">
                                    <div className="img"><Lottie animationData={icoFreedom}/></div>
                                    <div className="title">마음 전하는 곳</div>
                                    <div className="title-sm">참석이 어려우신 분들을 위해 기재했습니다.<br/>너그러운 마음으로 양해 부탁드립니다.
                                        <br/><br/>저희 두 사람의 소중한 시작을<br/> 축하해주시는 모든 분들께 감사드립니다.
                                    </div>
                                </div>
                                <div className="accordion" data-aos="fade">
                                    <AccordionItem title="🤵🏻 신랑측" accounts={groomAccounts}/>
                                    <AccordionItem title="👰🏻 신부측" accounts={brideAccounts}/>
                                </div>
                            </div>
                        </div>
                        {/* e 마음을 전하는 곳 */}

                        {/* s 참석여부 */}
                        <div className="content">
                            <div className="attendance" id="attendance" data-section="attendance" data-section-name="참석 여부">
                                <div className="heading" data-aos="fade">
                                    <div className="title">참석여부</div>
                                    <div className="title-sm">모든 분들을 소중히 모실 수 있도록 전해주세요 !</div>
                                </div>
                                <div className="info" data-aos="fade">
                                    <div className="info-tit">
                                        <span>신랑 김철수</span>
                                        <span><svg width="12" height="9" viewBox="0 0 12 9" fill="none"
                                            xmlns="http://www.w3.org/2000/svg"><path
                                            d="M1.17077 4.73241L5.56178 8.75149C5.81006 8.97873 6.19078 8.97873 6.43905 8.75149L10.8301 4.73241C11.3937 4.21651 11.7147 3.48755 11.7147 2.72344C11.7147 1.21933 10.4954 0 8.99126 0H8.62825C7.85684 0 7.11339 0.288871 6.54435 0.809709L6.0333 1.27747C6.01469 1.29451 5.98615 1.29451 5.96754 1.27747L5.45649 0.80971C4.88745 0.288871 4.144 0 3.37259 0H3.00958C1.50546 0 0.286133 1.21933 0.286133 2.72344C0.286133 3.48755 0.607127 4.21651 1.17077 4.73241Z"
                                            fill="#444444"></path></svg></span>
                                        <span>신부 박영희</span>
                                    </div>
                                    <div className="info-time">
                                        <div>10월 25일 토요일</div>
                                        <div>오후 12:30</div>
                                    </div>
                                    <div className="info-location">
                                        <div>건설회관 2F 셀럽앤어셈</div>
                                    </div>
                                    <div className="btn-wrap">
                                        <button
                                            className="btn btn-lg with-icon"
                                            onClick={() => {
                                                gaEvent('open_popup_attendance', { event_label: '참석여부', locale: 'ko', page: '/' })
                                                openPopup('attendance');
                                            }}
                                        >
                                            <i className="ico ico-check"></i><span>참석 여부 체크하기</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* e 참석여부 */}

                        <div className="content">
                            <div className="share" id="share" data-section="share" data-section-name="공유">
                                <KakaoShareButton/>
                                <button
                                    className="btn btn-secondary btn-lg with-icon"
                                    onClick={() => {
                                        gaEvent('click_copy_url', { event_label: 'share_copy', locale: 'ko', page: '/' })
                                        copyCurrentUrl();
                                    }}
                                >
                                    <i className="ico ico-copy"></i><span>청첩장 주소 복사하기</span>
                                </button>
                            </div>
                        </div>

                        {/* s copyright */}
                        <div className="content">
                            <div className="copyright">
                                <div className="text-caption">© Copyright 2025. <b>Juyeon Lee</b> All rights reserved.</div>
                            </div>
                        </div>
                        {/* e copyright */}

                        <div className={`dim ${isPopupOpen ? 'active' : ''}`} onClick={closePopup}></div>
                        <div className={`popup _popup ${isPopupOpen ? 'active' : ''}`} ref={popupRef}>
                            {popupType === 'call' && <PopupContentCall closePopup={closePopup}/>}
                            {popupType === 'attendance' && <PopupContentAttendance closePopup={closePopup}/>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Main;