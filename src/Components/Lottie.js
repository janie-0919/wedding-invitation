import React, { useState, useRef, useEffect } from "react";
import Lottie from "lottie-web";

const LottieComponent = ({animationData, loop, autoplay, speed, isPaused, isStopped, ...restProps}) => {
    const animationContainer = useRef(null);
    const [animationInstance, setAnimationInstance] = useState(null);

    useEffect(() => {
        const animationOptions = {
            container: animationContainer.current,
            renderer: 'svg',
            loop: loop !== undefined ? loop : true,
            autoplay: autoplay !== undefined ? autoplay : true,
            animationData: animationData,
            rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
            },
        };

        const animation = Lottie.loadAnimation(animationOptions);
        setAnimationInstance(animation);

        return () => {
            animation.destroy();
        };
    }, [animationData, loop, autoplay]);

    useEffect(() => {
        if (animationInstance !== null) {
            if (isPaused) {
                animationInstance.pause();
            } else {
                animationInstance.play();
            }

            if (isStopped) {
                animationInstance.stop();
            }

            if (speed !== undefined) {
                animationInstance.setSpeed(speed);
            }
        }
    }, [isPaused, isStopped, speed, animationInstance]);

    return <div ref={animationContainer} {...restProps} />;
};

export default LottieComponent;