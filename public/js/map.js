





mapboxgl.accessToken = 'pk.eyJ1Ijoic2F0eWFtMzQxIiwiYSI6ImNsenp2cGtxYjFrZnIycXM4bmV5YTJrN2YifQ.qdaI2MPitSWwQvPC3kgDMA';
    const map = new mapboxgl.Map({
        container: 'map',
        zoom: 11.53,
        center: [84.9914, 24.6950],
        pitch: 65,
        bearing: -180,
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/outdoors-v12',
        interactive: false
    });

    // `routes` comes from https://docs.mapbox.com/mapbox-gl-js/assets/routes.js,
    // which has properties that are in the shape of an array of arrays that correspond
    //  to the `coordinates` property of a GeoJSON linestring, for example:
    // [
    //   [6.56158, 46.05989],
    //   [6.56913, 46.05679],
    //   ...
    // ]
    // this is the path the camera will look at
    const targetRoute = routes.target;
    // this is the path the camera will move along
    const cameraRoute = routes.camera;

    // add terrain, sky, and line layers once the style has loaded
    map.on('style.load', () => {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        map.addSource('trace', {
            type: 'geojson',
            data: {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': targetRoute
                }
            }
        });
        map.addLayer({
            type: 'line',
            source: 'trace',
            id: 'line',
            paint: {
                'line-color': 'black',
                'line-width': 7
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        });
    });

    // wait for the terrain and sky to load before starting animation
    map.on('load', () => {
        const animationDuration = 80000;
        const cameraAltitude = 4000;
        // get the overall distance of each route so we can interpolate along them
        const routeDistance = turf.lineDistance(turf.lineString(targetRoute));
        const cameraRouteDistance = turf.lineDistance(
            turf.lineString(cameraRoute)
        );

        let start;

        function frame(time) {
            if (!start) start = time;
            // phase determines how far through the animation we are
            const phase = (time - start) / animationDuration;

            // phase is normalized between 0 and 1
            // when the animation is finished, reset start to loop the animation
            if (phase > 1) {
                // wait 1.5 seconds before looping
                setTimeout(() => {
                    start = 0.0;
                }, 1500);
            }

            // use the phase to get a point that is the appropriate distance along the route
            // this approach syncs the camera and route positions ensuring they move
            // at roughly equal rates even if they don't contain the same number of points
            const alongRoute = turf.along(
                turf.lineString(targetRoute),
                routeDistance * phase
            ).geometry.coordinates;

            const alongCamera = turf.along(
                turf.lineString(cameraRoute),
                cameraRouteDistance * phase
            ).geometry.coordinates;

            const camera = map.getFreeCameraOptions();

            // set the position and altitude of the camera
            camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
                {
                    lng: alongCamera[0],
                    lat: alongCamera[1]
                },
                cameraAltitude
            );

            // tell the camera to look at a point along the route
            camera.lookAtPoint({
                lng: alongRoute[0],
                lat: alongRoute[1]
            });

            map.setFreeCameraOptions(camera);

            window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
    });