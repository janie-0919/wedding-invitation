import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const WeddingTitle = ({ loaded }) => {
  const titleRef = useRef(null);
  const nameRef  = useRef(null);
  const dateRef  = useRef(null);

  useLayoutEffect(() => {
    if (!loaded) return;

    document.fonts.ready.then(() => {
      const split = new SplitText(titleRef.current, { type: 'chars' });
      const chars = split.chars;

      gsap.set(chars,             { autoAlpha: 0, y: 20, scale: 0.9 });
      gsap.set(nameRef.current,   { autoAlpha: 0, y: 20 });
      gsap.set(dateRef.current,   { autoAlpha: 0, y: 20 });

      const tl = gsap.timeline();

      tl.set(titleRef.current, { visibility: 'visible' });

      tl.to(chars, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'sine.out',
        stagger: { each: 0.1, from: 'start' }
      }, 0);

      tl.to(nameRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '>-0.1');

      tl.to(dateRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '>-0.1');
    });
  }, [loaded]);

  return (
      <>
        <div ref={nameRef} className="name">
          KIM CHEOL SU &amp; PARK YOUNG HEE
        </div>
        <div ref={titleRef} className="title">
          Wedding Day
        </div>
        <div ref={dateRef} className="date">
          October 25, 2025 SAT 12:30PM<br/>
          CELEB N ASSEM
        </div>
      </>
  );
};

export default WeddingTitle;