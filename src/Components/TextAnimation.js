import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const TextAnimation = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger, SplitText);

        const init = () => {
            const split = new SplitText(
                containerRef.current.querySelectorAll('.txt'),
                { type: 'chars', charsClass: 'letter' }
            );
            const chars = split.chars;

            gsap.set(chars, { y: 100, opacity: 0 });
            gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 70%',
                    once: true,
                }
            })
                .to(chars, {
                    y: 0,
                    opacity: 1,
                    duration: 1.4,
                    ease: 'expo.out',
                    delay: 0.3,
                    stagger: 0.03,
                });

            return () => {
                split.revert();
                ScrollTrigger.getAll().forEach(st => st.kill());
            };
        };

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(init);
        } else {
            window.addEventListener('load', init);
        }
    }, []);

    return (
        <div className="text-animation">
          <div className="circle"/>
            <div className="sub-txt" ref={containerRef}>
                <div className="txt-group">
                    <div className="txt">
                        <div className="main-letter">철</div>
                        <div className="sub-letter">없는 날들도 있었지만</div>
                    </div>
                    <div className="txt">
                        <div className="main-letter">수</div>
                        <div className="sub-letter">많은 시간을 함께 지나</div>
                    </div>
                    <div className="txt">
                        <div className="main-letter">영</div>
                        <div className="sub-letter">원히 서로의 편이 되어</div>
                    </div>
                    <div className="txt">
                        <div className="main-letter">희</div>
                        <div className="sub-letter">망 가득한 내일을 시작합니다</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextAnimation;