import React, { useRef, useState, memo } from 'react';
import moment from 'moment/moment';
import { supabase } from '../supabase';
import { gaEvent } from '../utils/ga';

const INITIAL_FORM = {
    gender: 'groom',
    attendance: 'attendance1',
    name: '',
    phone1: '',
    phone2: '',
    phone3: '',
    party: '',
    meal: 'meal1',
    textarea: ''
};

const buildPhoneFull = (p1, p2, p3) => `${p1}${p2}${p3}`;

async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const PhoneTripleInputs = memo(function PhoneTripleInputs({ formData, onPhoneChange, disabled = false, idPrefix = 'ph', partyRef }) {
    const p1 = useRef(null);
    const p2 = useRef(null);
    const p3 = useRef(null);

    const onChangeLocal = (e) => onPhoneChange(e, { p1, p2, p3, partyRef });

    return (
        <div className="phone">
            <input type="text" className="form-input" id={`${idPrefix}-p1`} name="phone1"
                value={formData.phone1} onChange={onChangeLocal} placeholder="010"
                maxLength={3} inputMode="numeric" pattern="[0-9]*" autoComplete="tel"
                disabled={disabled} ref={p1} />
            <input type="text" className="form-input" id={`${idPrefix}-p2`} name="phone2"
                value={formData.phone2} onChange={onChangeLocal} placeholder="1234"
                maxLength={4} inputMode="numeric" pattern="[0-9]*" autoComplete="tel"
                disabled={disabled} ref={p2} />
            <input type="text" className="form-input" id={`${idPrefix}-p3`} name="phone3"
                value={formData.phone3} onChange={onChangeLocal} placeholder="5678"
                maxLength={4} inputMode="numeric" pattern="[0-9]*" autoComplete="tel"
                disabled={disabled} ref={p3} />
        </div>
    );
});

const PopupContentAttendance = ({ closePopup }) => {
    const [mode, setMode] = useState('new');
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [banner, setBanner] = useState(null);
    const [pwdInput, setPwdInput] = useState('');
    const [storedHash, setStoredHash] = useState(null);
    const [docId, setDocId] = useState(null);
    const [unlocked, setUnlocked] = useState(false);
    const [pwdNew, setPwdNew] = useState('');
    const [pwdNewConfirm, setPwdNewConfirm] = useState('');

    const partyRef = useRef(null);
    const pwdNewRef = useRef(null);
    const pwdInputRef = useRef(null);

    const showBanner = (type, text) => {
        setBanner({ type, text });
        setTimeout(() => setBanner(null), 3000);
    };

    const isPhoneComplete =
        formData.phone1.length === 3 &&
        formData.phone2.length === 4 &&
        formData.phone3.length === 4;

    const hardReset = () => {
        setFormData({ ...INITIAL_FORM });
        setErrors({});
        setSubmitted(false);
        setLoading(false);
        setBanner(null);
        setPwdInput('');
        setPwdNew('');
        setPwdNewConfirm('');
        setStoredHash(null);
        setDocId(null);
        setUnlocked(false);
    };

    const switchToNew = (prefillPhone) => {
        hardReset();
        setMode('new');
        gaEvent('rsvp_switch_tab', { tab: 'new' });
        if (prefillPhone) setFormData(prev => ({ ...prev, ...prefillPhone }));
    };

    const switchToEdit = () => {
        hardReset();
        setMode('edit');
        gaEvent('rsvp_switch_tab', { tab: 'edit' });
    };

    const handlePhoneChange = (e, { p1, p2, p3, partyRef }) => {
        const { name, value } = e.target;
        const numeric = (value || '').replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: numeric }));
        setErrors(prev => ({ ...prev, phone: '' }));

        requestAnimationFrame(() => {
            if (name === 'phone1' && numeric.length === 3) p2.current?.focus();
            if (name === 'phone2' && numeric.length === 4) p3.current?.focus();
            if (name === 'phone3' && numeric.length === 4) partyRef.current?.focus();
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'gender') gaEvent('rsvp_change_gender', { value });
        if (name === 'attendance') gaEvent('rsvp_change_attendance', { value });
        if (name === 'meal') gaEvent('rsvp_change_meal', { value });

        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'attendance' && value === 'attendance2') {
                next.meal = 'meal2';
                next.party = '';
            }
            return next;
        });
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateCommon = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = '이름을 입력해 주세요.';
        if (!isPhoneComplete) newErrors.phone = '올바른 휴대폰 번호(3-4-4)를 입력해 주세요.';
        if (!formData.party && formData.attendance !== 'attendance2') {
            newErrors.party = '동행 인원을 입력해 주세요.';
        }
        return newErrors;
    };

    const onClosePopup = (e) => {
        e.preventDefault();
        e.stopPropagation();
        gaEvent('rsvp_close_popup');
        closePopup();
    };

    // NEW 저장
    const handleSubmitNew = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        gaEvent('rsvp_submit_new_attempt');

        const newErrors = validateCommon();
        if (!pwdNew) newErrors.pwdNew = '비밀번호를 입력해 주세요.';
        if (!pwdNewConfirm) newErrors.pwdNewConfirm = '비밀번호 확인을 입력해 주세요.';
        if (pwdNew && pwdNew.length < 4) newErrors.pwdNew = '비밀번호는 4자 이상이어야 합니다.';
        if (pwdNew && pwdNewConfirm && pwdNew !== pwdNewConfirm) newErrors.pwdNewConfirm = '비밀번호가 일치하지 않습니다.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            gaEvent('rsvp_submit_new_validation_error', { fields: Object.keys(newErrors).join(',') });
            return;
        }

        const id = buildPhoneFull(formData.phone1, formData.phone2, formData.phone3);

        try {
            setLoading(true);

            const { data: existing } = await supabase
                .from('attendance')
                .select('id')
                .eq('id', id)
                .maybeSingle();

            if (existing) {
                showBanner('error', '이미 등록된 번호입니다. 불러오기·수정 탭을 이용해 주세요.');
                gaEvent('rsvp_submit_new_duplicate');
                return;
            }

            const payload = {
                id,
                ...formData,
                party: parseInt(formData.party, 10) || 0,
                timestamp: moment().format(),
                phone_full: id,
                password_hash: await sha256(pwdNew)
            };

            const { error } = await supabase.from('attendance').insert(payload);
            if (error) throw error;

            alert('참석 정보가 저장되었습니다.');
            gaEvent('rsvp_submit_new_success', { attendance: formData.attendance, party: formData.party || '0' });
            closePopup();
        } catch (err) {
            showBanner('error', '저장 중 오류가 발생했습니다.');
            alert('에러: ' + err.message);
            gaEvent('rsvp_submit_new_error', { message: err.message });
        } finally {
            setLoading(false);
        }
    };

    // EDIT 불러오기
    const handleLoadExisting = async () => {
        setSubmitted(true);
        const errs = {};
        if (!isPhoneComplete) errs.phone = '휴대폰 번호(3-4-4)를 입력해 주세요.';
        if (!pwdInput || pwdInput.length < 4) errs.password = '비밀번호(4자 이상)를 입력해 주세요.';
        setErrors(prev => ({ ...prev, ...errs }));
        if (Object.keys(errs).length > 0) return;

        const id = buildPhoneFull(formData.phone1, formData.phone2, formData.phone3);

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            setDocId(id);

            if (error || !data) {
                switchToNew({ phone1: formData.phone1, phone2: formData.phone2, phone3: formData.phone3 });
                showBanner('info', '저장된 정보가 없어 새로 작성 탭으로 이동했습니다.');
                return;
            }

            const hash = data.password_hash || null;
            setStoredHash(hash);

            if (!hash) {
                setUnlocked(true);
                setFormData(prev => ({ ...prev, ...data, party: String(data.party ?? '') }));
                showBanner('success', '정보를 불러왔습니다.');
                return;
            }

            const inputHash = await sha256(pwdInput);
            if (inputHash !== hash) {
                setErrors(prev => ({ ...prev, password: '비밀번호가 일치하지 않습니다.' }));
                showBanner('error', '비밀번호가 일치하지 않습니다.');
                return;
            }

            setUnlocked(true);
            setFormData(prev => ({ ...prev, ...data, party: String(data.party ?? '') }));
            showBanner('success', '본인 확인 완료! 내용을 수정할 수 있어요.');
        } catch (err) {
            showBanner('error', '불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // EDIT 저장
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        if (!unlocked) {
            showBanner('info', '먼저 휴대폰 번호와 비밀번호로 불러오기 해주세요.');
            return;
        }

        const newErrors = validateCommon();
        setErrors(prev => ({ ...prev, ...newErrors }));
        if (Object.keys(newErrors).length > 0) return;

        const id = docId || buildPhoneFull(formData.phone1, formData.phone2, formData.phone3);
        const payload = {
            ...formData,
            party: parseInt(formData.party, 10) || 0,
            timestamp: moment().format(),
            phone_full: id
        };

        if (!storedHash && pwdInput) {
            payload.password_hash = await sha256(pwdInput);
        }

        try {
            setLoading(true);
            const { error } = await supabase.from('attendance').update(payload).eq('id', id);
            if (error) throw error;

            alert('참석 정보가 수정되었습니다.');
            gaEvent('rsvp_submit_edit_success', { attendance: formData.attendance, party: formData.party || '0' });
            closePopup();
        } catch (err) {
            showBanner('error', '저장 중 오류가 발생했습니다.');
            alert('에러: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="popup-content">
            <form onSubmit={mode === 'new' ? handleSubmitNew : handleSubmitEdit}>
                <div className="popup-head">
                    <button type="button" className="btn-popup-close _popupClose" onClick={onClosePopup}>
                        <i className="ico ico-popup-close"></i>
                    </button>
                </div>

                {banner && (
                    <div className={`banner banner-${banner.type}`} role="status" aria-live="polite">
                        {banner.text}
                    </div>
                )}

                <div className="popup-body">
                    <div className="attendance-form">
                        <div className="heading">
                            <div className="title">참석여부</div>
                        </div>

                        <div className="rsvp-tabs">
                            <button type="button" onClick={() => switchToNew()} className={`rsvp-tab ${mode === 'new' ? 'active' : ''}`}>새로 작성</button>
                            <button type="button" onClick={() => switchToEdit()} className={`rsvp-tab ${mode === 'edit' ? 'active' : ''}`}>불러오기·수정</button>
                        </div>

                        {mode === 'new' && (
                            <>
                                <div className="auth-box">
                                    <div className="form-group">
                                        <label className="label">휴대폰 번호</label>
                                        <PhoneTripleInputs formData={formData} onPhoneChange={handlePhoneChange} disabled={false} idPrefix="new" partyRef={pwdNewRef} />
                                        {submitted && errors.phone && <span className="error">{errors.phone}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">비밀번호 설정</label>
                                        <input type="password" className="form-input" placeholder="새 비밀번호 (4자 이상)" value={pwdNew}
                                            onChange={(e) => { setPwdNew(e.target.value); setErrors(prev => ({ ...prev, pwdNew: '' })); }} ref={pwdNewRef} />
                                        {submitted && errors.pwdNew && <span className="error">{errors.pwdNew}</span>}
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-input" placeholder="비밀번호 확인" value={pwdNewConfirm}
                                            onChange={(e) => { setPwdNewConfirm(e.target.value); setErrors(prev => ({ ...prev, pwdNewConfirm: '' })); }} />
                                        {submitted && errors.pwdNewConfirm && <span className="error">{errors.pwdNewConfirm}</span>}
                                    </div>
                                </div>

                                <div>
                                    <div className="form-group">
                                        <label className="label">어느 쪽 하객이신가요?</label>
                                        <div className="form-row">
                                            <label htmlFor="groom" className="form-radio">
                                                <input type="radio" id="groom" name="gender" value="groom" checked={formData.gender === 'groom'} onChange={handleChange} />
                                                <span>신랑측</span>
                                            </label>
                                            <label htmlFor="bride" className="form-radio">
                                                <input type="radio" id="bride" name="gender" value="bride" checked={formData.gender === 'bride'} onChange={handleChange} />
                                                <span>신부측</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">참석여부</label>
                                        <div className="form-row">
                                            <label htmlFor="attendance1" className="form-radio">
                                                <input type="radio" id="attendance1" name="attendance" value="attendance1" checked={formData.attendance === 'attendance1'} onChange={handleChange} />
                                                <span>참석</span>
                                            </label>
                                            <label htmlFor="attendance2" className="form-radio">
                                                <input type="radio" id="attendance2" name="attendance" value="attendance2" checked={formData.attendance === 'attendance2'} onChange={handleChange} />
                                                <span>불참석</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label" htmlFor="name">성함 <small className="color-point">(필수)</small></label>
                                        <input type="text" className="form-input" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="예: 홍길동" />
                                        {submitted && errors.name && <span className="error">{errors.name}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label" htmlFor="party">동행인원 <span>(본인 포함)</span> <small className="color-point">(필수)</small></label>
                                        <div className="party">
                                            <input type="number" className="form-input" id="party" name="party" value={formData.party} onChange={handleChange}
                                                style={{ width: '50px' }} ref={partyRef} min={formData.attendance === 'attendance1' ? 1 : undefined}
                                                disabled={formData.attendance === 'attendance2'} placeholder={formData.attendance === 'attendance2' ? '—' : '1'} />
                                            <span className="unit">명</span>
                                        </div>
                                        {submitted && errors.party && <span className="error">{errors.party}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">식사여부 <small className="color-point">(필수)</small></label>
                                        <div className="form-row">
                                            <label htmlFor="meal1" className="form-radio">
                                                <input type="radio" id="meal1" name="meal" value="meal1" checked={formData.meal === 'meal1'} onChange={handleChange} />
                                                <span>식사 가능</span>
                                            </label>
                                            <label htmlFor="meal2" className="form-radio">
                                                <input type="radio" id="meal2" name="meal" value="meal2" checked={formData.meal === 'meal2'} onChange={handleChange} />
                                                <span>식사 불가</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label" htmlFor="textarea">전하는 말 <small>(생략 가능)</small></label>
                                        <textarea name="textarea" className="form-input" id="textarea" placeholder="추가로 전달하고 싶은 내용을 작성해 주세요." value={formData.textarea} onChange={handleChange} />
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === 'edit' && (
                            <>
                                <div className="auth-box">
                                    <div className="form-group">
                                        <label className="label">휴대폰 번호</label>
                                        <PhoneTripleInputs formData={formData} onPhoneChange={handlePhoneChange} disabled={unlocked} idPrefix="verify" partyRef={pwdInputRef} />
                                        {submitted && errors.phone && <span className="error">{errors.phone}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">비밀번호</label>
                                        <input type="password" className="form-input" placeholder="비밀번호 (4자 이상)" value={pwdInput}
                                            onChange={(e) => { setPwdInput(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                                            disabled={unlocked} ref={pwdInputRef} />
                                        {submitted && errors.password && <span className="error">{errors.password}</span>}
                                    </div>
                                    {!unlocked && (
                                        <div className="btn-rsvp-wrap">
                                            <button type="button" onClick={handleLoadExisting} disabled={loading} className="btn btn-sm btn-brown">
                                                {loading ? '처리 중...' : '입력정보 불러오기'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={unlocked ? undefined : { opacity: 0.5, pointerEvents: 'none' }}>
                                    <div className="form-group">
                                        <label className="label">어느 쪽 하객이신가요?</label>
                                        <div className="form-row">
                                            <label htmlFor="groom" className="form-radio">
                                                <input type="radio" id="groom" name="gender" value="groom" checked={formData.gender === 'groom'} onChange={handleChange} />
                                                <span>신랑측</span>
                                            </label>
                                            <label htmlFor="bride" className="form-radio">
                                                <input type="radio" id="bride" name="gender" value="bride" checked={formData.gender === 'bride'} onChange={handleChange} />
                                                <span>신부측</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">참석여부</label>
                                        <div className="form-row">
                                            <label htmlFor="attendance1" className="form-radio">
                                                <input type="radio" id="attendance1" name="attendance" value="attendance1" checked={formData.attendance === 'attendance1'} onChange={handleChange} />
                                                <span>참석</span>
                                            </label>
                                            <label htmlFor="attendance2" className="form-radio">
                                                <input type="radio" id="attendance2" name="attendance" value="attendance2" checked={formData.attendance === 'attendance2'} onChange={handleChange} />
                                                <span>불참석</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label" htmlFor="name">성함 <small className="color-point">(필수)</small></label>
                                        <input type="text" className="form-input" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="예: 홍길동" />
                                        {submitted && errors.name && <span className="error">{errors.name}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label" htmlFor="party">동행인원 <span>(본인 포함)</span> <small className="color-point">(필수)</small></label>
                                        <div className="party">
                                            <input type="number" className="form-input" id="party" name="party" value={formData.party} onChange={handleChange}
                                                style={{ width: '50px' }} ref={partyRef} min={formData.attendance === 'attendance1' ? 1 : undefined}
                                                disabled={formData.attendance === 'attendance2'} placeholder={formData.attendance === 'attendance2' ? '—' : '1'} />
                                            <span className="unit">명</span>
                                        </div>
                                        {submitted && errors.party && <span className="error">{errors.party}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">식사여부 <small className="color-point">(필수)</small></label>
                                        <div className="form-row">
                                            <label htmlFor="meal1" className="form-radio">
                                                <input type="radio" id="meal1" name="meal" value="meal1" checked={formData.meal === 'meal1'} onChange={handleChange} />
                                                <span>식사 가능</span>
                                            </label>
                                            <label htmlFor="meal2" className="form-radio">
                                                <input type="radio" id="meal2" name="meal" value="meal2" checked={formData.meal === 'meal2'} onChange={handleChange} />
                                                <span>식사 불가</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label" htmlFor="textarea">전하는 말 <small>(생략 가능)</small></label>
                                        <textarea name="textarea" className="form-input" id="textarea" placeholder="추가로 전달하고 싶은 내용을 작성해 주세요." value={formData.textarea} onChange={handleChange} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="popup-footer">
                    {mode === 'new' ? (
                        <input className="btn btn-xl" type="submit" value="참석 여부 전달하기" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }} />
                    ) : (
                        <input className="btn btn-xl" type="submit" value="참석 정보 수정하기" disabled={loading || !unlocked} style={{ opacity: (loading || !unlocked) ? 0.6 : 1 }} />
                    )}
                </div>
            </form>
        </div>
    );
};

export default PopupContentAttendance;