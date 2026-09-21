self.addEventListener("install", event => {
    console.log("⚙️ SW PUSH: INSTALANDO");
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    console.log("⚙️ SW PUSH: ACTIVADO");

    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("push", event => {
    console.log("🔔 SW PUSH: PUSH RECIBIDO");

    let datos = {
        titulo: "CFT Alumno",
        mensaje: "Tienes una nueva notificación."
    };

    if (event.data) {
        try {
            datos = event.data.json();
        } catch {
            datos.mensaje = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(
            datos.titulo,
            {
                body: datos.mensaje,
                icon: "/icon-192.png",
                badge: "/icon-192.png",
                tag: "cft-alumno"
            }
        )
    );
});

self.addEventListener(
    "notificationclick",
    event => {
        event.notification.close();

        event.waitUntil(
            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then(ventanas => {
                if (ventanas.length > 0) {
                    return ventanas[0].focus();
                }

                return clients.openWindow(
                    "/index.html"
                );
            })
        );
    }
);
