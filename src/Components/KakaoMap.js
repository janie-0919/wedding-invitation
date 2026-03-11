import React, { useEffect } from "react";

const KakaoMap = () => {
    useEffect(() => {
        const mapScript = document.createElement('script');

        mapScript.async = true;
        mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_APP_KEY}&autoload=false`;
        document.head.appendChild(mapScript);

        mapScript.addEventListener('load', () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(37.517752504536155, 127.03500387141798),
                    level: 3,
                };

                let map = new window.kakao.maps.Map(container, options);
                let marker = new window.kakao.maps.Marker({
                    position: map.getCenter()
                });
                marker.setMap(map);
            });
        });
    }, []);

    return (
        <div id="map" style={{width: '100%', height: '300px'}}></div>
    );
};

export default KakaoMap;