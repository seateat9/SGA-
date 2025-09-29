(function () {
    // Detectar si la app está instalada como PWA (modo standalone)
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true; // Para Safari en iOS
    }
    // Si no está instalada como PWA, no hacer nada
    if (!isAppInstalled()) return;

    // Detectar tipo de dispositivo
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    // Obtener UUID previamente guardado en IndexedDB (sin generar uno nuevo)
    function obtenerUUIDExistente() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('app_storage', 1);
            request.onupgradeneeded = event => {
                // Creamos el object store si no existe, pero sin generar UUID
                if (!event.target.result.objectStoreNames.contains('settings')) {
                    event.target.result.createObjectStore('settings');
                }
            };
            request.onsuccess = event => {
                const db = event.target.result;
                const tx = db.transaction('settings', 'readonly');
                const store = tx.objectStore('settings');
                const getReq = store.get('device_uuid');

                getReq.onsuccess = () => {
                    // Retorna el UUID si existe, o null si no está guardado
                    resolve(getReq.result || null);
                };

                getReq.onerror = () => reject('Error leyendo UUID existente');
            };

            request.onerror = () => reject('Error abriendo IndexedDB');
        });
    }

    // Rutas de los scripts de Firebase necesarios para FCM
    const firebaseScripts = [
        // Versión local (para evitar depender de CDN)
        "/static/firebase/firebase-app-compat.js",
        "/static/firebase/firebase-messaging-compat.js"
    ];

    // Configuración de Firebase para tu proyecto
    const firebaseConfig = {
        apiKey: "AIzaSyDU075BA2Sinh4ZHtrcMy7d2kC8TKKrPeA",
        authDomain: "sga-notificacion-push-41211.firebaseapp.com",
        projectId: "sga-notificacion-push-41211",
        storageBucket: "sga-notificacion-push-41211.firebasestorage.app",
        messagingSenderId: "765659764573",
        appId: "1:765659764573:web:0f789609c6cab5f6c3bab4"
    };

    if (!window.firebase) {
        // Cargar scripts de Firebase de forma asíncrona antes de inicializar
        Promise.all(firebaseScripts.map(loadScript))
            .then(initFirebase)
            .catch(err => console.error("❌ Error cargando scripts de Firebase:", err));
    } else {
        console.log("⚡ Firebase ya estaba cargado, reusando instancia");
        initFirebase();
    }
    // Función auxiliar para cargar scripts JS en el DOM
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.type = 'text/javascript';
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Inicializar Firebase y manejar la suscripción de notificaciones
    function initFirebase() {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        // firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging(); // Servicio de mensajería
        // Verificar si existe UUID en este dispositivo
        obtenerUUIDExistente().then(uuid => {
            if (uuid) {
                // Control para no actualizar FCM en cada carga
                const fcm_actualizado = localStorage.getItem('fcm_actualizado');
                if (!fcm_actualizado) {
                    // Registrar el Service Worker de notificaciones
                    navigator.serviceWorker.register('/static/pwa/serviceworker.js')
                        .then(registration => {
                            if (Notification.permission === 'granted') {
                                return messaging.getToken({
                                    vapidKey: 'BBwbVdQvBiVE-EEL3KU-Pk85zEN7risbda9zZh514jtpZOcCOe5iNE40fKMufgc39mXJmSDG9ANHVTR6ZjOH-s0',
                                    serviceWorkerRegistration: registration
                                });
                            } else {
                                return null
                            }
                        }).then(token => {
                        // Enviar token y UUID al servidor para actualización
                        return fetch('/notificacionpush/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrftoken
                            },
                            body: JSON.stringify({
                                token: token? token: '' ,
                                uuid: uuid,
                                action: 'actualizadispositivo'
                            })
                        }).then(res => res.json())
                            .then(data => {
                                localStorage.setItem('fcm_actualizado', true);
                            });
                    }).catch(err => console.error('❌ Error en registro de notificaciones:', err));
                }
            } else {
                console.log("⚠️ No hay UUID guardado en este dispositivo");
            }
        });

        // MANEJO DE NOTIFICACIONES EN PRIMER PLANO
        messaging.onMessage(async (payload) => {
            console.log("Notificación en primer plano:", payload);
            const data = payload.data || {};
            const notification = payload.notification || {};
            const title = data.title || notification.title || "SGA UTEQ";
            const body = data.body || notification.body || "";
            const icon = data.icon || notification.icon || "";
            const image = data.image || notification.image || null;
            const url = data.url || "/";
            // Acumular mensajes
            if (!window.mensajesAcumulados) window.mensajesAcumulados = {};
            if (!window.mensajesAcumulados[title]) window.mensajesAcumulados[title] = [];
            // Evitar duplicados: si el último body es igual, no lo agregamos
            const ultimoBody = window.mensajesAcumulados[title].slice(-1)[0];
            if (ultimoBody !== body) {
                window.mensajesAcumulados[title].push(body);
            }
            // Solo mostramos los últimos 5 mensajes
            const bodyConcatenado = window.mensajesAcumulados[title].slice(-5).join("\n");
            // ESTRATEGIA ESPECÍFICA PARA ANDROID
            if (isAndroid()) {
                // 1. Forzar a través del Service Worker
                const swSuccess = await forzarNotificacionServiceWorker(title, bodyConcatenado, icon, image, url);
                // 2. Vibración como respaldo
                if (navigator.vibrate) {
                    navigator.vibrate([500, 200, 500]);
                }
                // 3. Toast visual prominente
                mostrarToastVisual(title, bodyConcatenado, icon);
            } else {
                // Dispositivos no Android - metodo estándar
                mostrarNotificacionEstandar(title, bodyConcatenado, icon, image, url);
            }
        });

        // FUNCIÓN CRÍTICA: Forzar notificación via Service Worker
        async function forzarNotificacionServiceWorker(title, body, icon, image, url) {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                try {
                    const channel = new MessageChannel();
                    return new Promise((resolve) => {
                        const timeout = setTimeout(() => resolve(false), 3000);
                        channel.port1.onmessage = (event) => {
                            clearTimeout(timeout);
                            resolve(event.data.success);
                        };
                        navigator.serviceWorker.controller.postMessage({
                            type: 'FORCE_SHOW_NOTIFICATION',
                            payload: { title, body, icon, image, url }
                        }, [channel.port2]);
                    });
                } catch (error) {
                    console.error('Error Service Worker:', error);
                    return false;
                }
            }
            return false;
        }

        // Notificación estándar
        function mostrarNotificacionEstandar(title, body, icon, image, url) {
            if (Notification.permission === "granted") {
                const options = {
                    body: body,
                    icon: icon,
                    badge: icon,
                    tag: title,
                    renotify: true,
                    requireInteraction: isMobile(),
                    silent: false,
                    vibrate: [200, 100, 200],
                    data: { url: url }
                };
                if (image) options.image = image;
                try {
                    const notification = new Notification(title, options);
                    notification.onclick = function(event) {
                        event.preventDefault();
                        window.focus();
                        if (url && url !== '/') {
                            window.location.href = url;
                        }
                        notification.close();
                    };
                } catch (error) {
                    console.error('Error notificación estándar:', error);
                    mostrarToastVisual(title, body, icon);
                }
            } else {
                mostrarToastVisual(title, body, icon);
            }
        }

        // TOAST VISUAL ESPECÍFICO PARA ANDROID
        function mostrarToastVisual(title, body, icon) {
            // Remover toast anterior
            const existingToast = document.getElementById('android-pwa-toast');
            if (existingToast) existingToast.remove();
            const toast = document.createElement('div');
            toast.id = 'android-pwa-toast';
            toast.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #000000, #333333);
                color: white;
                padding: 20px;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                transform: translateY(-100%);
                transition: transform 0.3s ease-out;
                cursor: pointer;
            `;
            toast.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <img src=${icon} 
                         style="width: 40px; height: 40px; margin-right: 15px; border-radius: 8px;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${title}</div>
                        <div style="font-size: 14px; opacity: 0.9;">${body}</div>
                    </div>
                    <div style="margin-left: 15px; font-size: 24px;">×</div>
                </div>
            `;
            document.body.appendChild(toast);
            // Mostrar con animación
            setTimeout(() => {
                toast.style.transform = 'translateY(0)';
            }, 100);
            // Auto-ocultar
            const hideTimer = setTimeout(() => {
                toast.style.transform = 'translateY(-100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 8000);
            // Click para cerrar
            toast.addEventListener('click', () => {
                clearTimeout(hideTimer);
                toast.style.transform = 'translateY(-100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            });
            // Vibración al mostrar
            if (navigator.vibrate) {
                navigator.vibrate([300, 100, 300]);
            }
        }
        // Escuchar mensajes del Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'BACKGROUND_NOTIFICATION') {
                    const { title, body, icon } = event.data.payload;
                    mostrarToastVisual(title, body, icon);
                }
            });
        }
    }
})();
