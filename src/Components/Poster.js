import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const Poster = ({ imgUrl }) => {
    const container = useRef(null);
    const box = useRef(null);

    useGSAP(() => {
        const ctx = gsap.context(() => {
            gsap.to(box.current, {
                scrollTrigger: {
                    trigger: box.current,
                    start: 'top 130%',
                    end: 'top 50%',
                    scrub: true,
                },
                opacity: 1,
                scale: 1,
                duration: 3,
                ease: 'sine.inOut',
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <div className="sub-poster" ref={container}>
            <div className="img">
                <img ref={box} src={imgUrl} alt="서브 이미지"/>
            </div>
        </div>
    );
};

export default Poster;