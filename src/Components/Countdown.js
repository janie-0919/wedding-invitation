import React, { useState, useEffect } from 'react';
import moment from 'moment';

const Countdown = () => {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [dText, setDText] = useState('일 남았어요 .ᐟ');
    const [leftDayVisible, setLeftDayVisible] = useState(true);
    const [displayDays, setDisplayDays] = useState(0);

    useEffect(() => {
        const targetDate = moment('2025-10-25 12:30');
        const targetDay = moment('2025-10-25').startOf('day');

        const updateCountdown = () => {
            const now = moment();
            const duration = moment.duration(targetDate.diff(now));
            const daysDiff = targetDay.diff(now.startOf('day'), 'days');

            let newHours = duration.hours();
            let newMinutes = duration.minutes();

            newMinutes = Math.max(newMinutes, 0);

            setHours(newHours);
            setMinutes(newMinutes);

            if (daysDiff < 0) {
                setDays(0);
                setHours(0);
                setMinutes(0);
                setDisplayDays(Math.abs(daysDiff));
                setDText(`일 지났어요 .ᐟ`);
                setLeftDayVisible(true);
            } else {
                setDisplayDays(daysDiff);
                if (daysDiff === 0) {
                    setDays(0);
                    setHours(0);
                    setMinutes(0);
                    setDText('오늘입니다 .ᐟ');
                    setLeftDayVisible(false);
                } else {
                    setDays(daysDiff-1);
                    setDText(`일 남았어요 .ᐟ`);
                    setLeftDayVisible(true);
                }
            }
        };

        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div className="d-day-counter" data-aos="fade">
            <div className="countdown">
                <div className="time">
                    <span className="val">{days}</span>
                    <span className="tit">Days</span>
                </div>
                <div className="time">
                    <span className="val">{hours}</span>
                    <span className="tit">Hours</span>
                </div>
                <div className="time">
                    <span className="val">{minutes}</span>
                    <span className="tit">Minutes</span>
                </div>
            </div>
            <div className="txt">
                <span className="heart">❤️&nbsp;</span>
                {leftDayVisible && displayDays > 0 && <span className="day">{displayDays}</span>}
                <span className="d-text _dTxt">{dText}</span>
                <span className="heart">&nbsp;❤️</span>
            </div>
        </div>
    );
};

export default Countdown;