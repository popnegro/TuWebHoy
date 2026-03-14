        let map, marker, geocoder;
        let userLatLng = "";
        let userAddress = "mi ubicación actual";
        const miTelefono = "5492613871088";
        let timerInterval, startTime;

        function initMap() {
            const mza = { lat: -32.9815, lng: -68.7890 };
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 17, center: mza, disableDefaultUI: true,
                styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
            });
            marker = new google.maps.Marker({ map: map, position: mza, animation: google.maps.Animation.DROP });
            geocoder = new google.maps.Geocoder();
            obtenerUbicacion();
        }

        function actualizarCronometro() {
            const diff = (Date.now() - startTime) / 1000;
            document.getElementById('timer-count').innerText = diff.toFixed(1);
        }

        // CORREGIDO: Sintaxis de template strings
        function actualizarDireccionManual() {
            userAddress = document.getElementById('manual-address').value;
            userLatLng = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userAddress)}`;
        }

        function obtenerUbicacion() {
            const statusText = document.getElementById('ubicacion-status');
            const manualContainer = document.getElementById('manual-address-container');
            const mapElement = document.getElementById('map');
            const timerContainer = document.getElementById('timer-container');
            const btnRetry = document.querySelector('button[onclick="obtenerUbicacion()"] i');

            // Feedback visual de carga
            btnRetry.classList.add('bi-spin'); // Necesitas añadir CSS para esta rotación
            manualContainer.classList.add('d-none');
            mapElement.style.display = "block";
            statusText.innerText = "Localizando...";

            clearInterval(timerInterval);
            startTime = Date.now();
            timerContainer.classList.remove('d-none');
            timerInterval = setInterval(actualizarCronometro, 100);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearInterval(timerInterval);
                    btnRetry.classList.remove('bi-spin');
                    const pos = { lat: position.coords.latitude, lng: position.coords.longitude };

                    // CORREGIDO: URL de Google Maps para coordenadas exactas
                    userLatLng = `https://www.google.com/maps?q=${pos.lat},${pos.lng}`;

                    marker.setPosition(pos);
                    map.setCenter(pos);
                    document.getElementById('beep-success').play().catch(() => { });

                    geocoder.geocode({ location: pos }, (results, status) => {
                        if (status === "OK" && results[0]) {
                            userAddress = results[0].formatted_address;
                            statusText.innerHTML = '<span class="text-success">Ubicación Lista</span>';
                        }
                    });
                },
                () => {
                    clearInterval(timerInterval);
                    btnRetry.classList.remove('bi-spin');
                    timerContainer.classList.add('d-none');
                    statusText.innerText = "GPS no detectado";
                    manualContainer.classList.remove('d-none');
                    mapElement.style.display = "none";
                },
                { enableHighAccuracy: true, timeout: 10000 } // Aumentado a 10s para mejor precisión
            );
        }

        function iniciarContadorETA() {
            const etaContainer = document.getElementById('eta-container');
            const etaTimer = document.getElementById('eta-timer');
            const etaProgress = document.getElementById('eta-progress');
            etaContainer.classList.remove('d-none');

            let tiempoRestante = 7 * 60;
            const total = tiempoRestante;

            const intervalo = setInterval(() => {
                tiempoRestante--;
                let m = Math.floor(tiempoRestante / 60);
                let s = tiempoRestante % 60;
                etaTimer.innerText = `${m}:${s < 10 ? '0' : ''}${s} min`;
                etaProgress.style.width = `${(tiempoRestante / total) * 100}%`;
                if (tiempoRestante <= 0) clearInterval(intervalo);
            }, 1000);
        }

        function validarYEnviar(e) {
            e.preventDefault();
            const nombreInput = document.getElementById('user-name');
            const nombre = nombreInput.value.trim();
            const ahora = new Date();
            const horaPedido = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

            if (!nombre) {
                alert("Por favor, dinos tu nombre para que el chofer te identifique.");
                nombreInput.focus();
                return;
            }

            // Construcción del mensaje profesional
            const texto = `🚕 *NUEVO PEDIDO - TAXIGO*\n\n👤 *Pasajero:* ${nombre}\n📍 *Dirección:* ${userAddress}\n🕒 *Hora:* ${horaPedido}\n🗺️ *Mapa:* ${userLatLng}`;

            // Abrir WhatsApp
            window.open(`https://wa.me/${miTelefono}?text=${encodeURIComponent(texto)}`, '_blank');

            // UI Feedback
            iniciarContadorETA();
            const modal = new bootstrap.Modal(document.getElementById('modalExito'));
            modal.show();
        }

        function compartirViajeSeguro() {
            const texto = `🛡️ *Viaje Seguro - TaxiGo*\n📍 Salida: ${userAddress}\n🗺️ Mapa: ${userLatLng}`;
            if (navigator.share) {
                navigator.share({ title: 'Mi Taxi', text: texto, url: window.location.href });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
            }
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js');
        }
