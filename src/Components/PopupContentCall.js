import React from 'react';
import { gaEvent } from '../utils/ga';

const maskPhone = (p) => (p ? p.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2') : '');

const PopupContentCall = ({ closePopup }) => {
    const onClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        gaEvent('call_close_popup');
        closePopup();
    };

    const track = (type, payload) => gaEvent(type, payload);

    return (
        <div className="popup-content">
            <form method="post">
                <div className="popup-head">
                    <button className="btn-popup-close _popupClose" type="button" onClick={onClose}>
                        <i className="ico ico-popup-close"></i>
                    </button>
                </div>

                <div className="popup-body">
                    <div className="call-area">
                        <div className="heading">
                            <div className="title">혼주에게 연락하기</div>
                        </div>

                        <div className="">
                            {/* 신랑측 */}
                            <div className="item groom">
                                <div className="row">
                                    <div className="val">신랑 아버지</div>
                                    <div className="name">김대한</div>
                                    <div className="btns-contact">
                                        <a className="btn-sms" href="sms:01000000000"
                                            onClick={() => track('call_click_sms', { side: 'groom', relation: 'father', name: '김대한', phone: maskPhone('01000000000') })}>
                                            <i className="ico ico-sms"></i><span className="sr-only">문자</span>
                                        </a>
                                        <a className="btn-call" href="tel:01000000000"
                                            onClick={() => track('call_click_tel', { side: 'groom', relation: 'father', name: '김대한', phone: maskPhone('01000000000') })}>
                                            <i className="ico ico-call"></i><span className="sr-only">전화</span>
                                        </a>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="val">신랑 어머니</div>
                                    <div className="name">이순자</div>
                                    <div className="btns-contact">
                                        <a className="btn-sms" href="sms:01000000001"
                                            onClick={() => track('call_click_sms', { side: 'groom', relation: 'mother', name: '이순자', phone: maskPhone('01000000001') })}>
                                            <i className="ico ico-sms"></i><span className="sr-only">문자</span>
                                        </a>
                                        <a className="btn-call" href="tel:01000000001"
                                            onClick={() => track('call_click_tel', { side: 'groom', relation: 'mother', name: '이순자', phone: maskPhone('01000000001') })}>
                                            <i className="ico ico-call"></i><span className="sr-only">전화</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* 신부측 */}
                            <div className="item bride">
                                <div className="row">
                                    <div className="val">신부 아버지</div>
                                    <div className="name">박민국</div>
                                    <div className="btns-contact">
                                        <a className="btn-sms" href="sms:01000000002"
                                            onClick={() => track('call_click_sms', { side: 'bride', relation: 'father', name: '박민국', phone: maskPhone('01000000002') })}>
                                            <i className="ico ico-sms"></i><span className="sr-only">문자</span>
                                        </a>
                                        <a className="btn-call" href="tel:01000000002"
                                            onClick={() => track('call_click_tel', { side: 'bride', relation: 'father', name: '박민국', phone: maskPhone('01000000002') })}>
                                            <i className="ico ico-call"></i><span className="sr-only">전화</span>
                                        </a>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="val">신부 어머니</div>
                                    <div className="name">최정숙</div>
                                    <div className="btns-contact">
                                        <a className="btn-sms" href="sms:01000000003"
                                            onClick={() => track('call_click_sms', { side: 'bride', relation: 'mother', name: '최정숙', phone: maskPhone('01000000003') })}>
                                            <i className="ico ico-sms"></i><span className="sr-only">문자</span>
                                        </a>
                                        <a className="btn-call" href="tel:01000000003"
                                            onClick={() => track('call_click_tel', { side: 'bride', relation: 'mother', name: '최정숙', phone: maskPhone('01000000003') })}>
                                            <i className="ico ico-call"></i><span className="sr-only">전화</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PopupContentCall;