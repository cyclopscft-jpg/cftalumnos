// =====================================================
// CFT ALUMNO
// Misma base de datos que CFT Manager
// =====================================================

const SUPABASE_URL =
    "https://szugemossswdinahbxxc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_tkep6QjStpeMFZtGtSNEWA_0Zenuh5V";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// VARIABLES
// =====================================================

let alumnoActual = null;
let codigoAlumno = null;
let passwordActualTemporal = null;


// =====================================================
// INICIO
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("🥊 CFT Alumno iniciado");
    console.log("🔗 Supabase conectado");

    const sesionGuardada =
        localStorage.getItem("cftAlumnoCodigo");

    if (sesionGuardada) {

        codigoAlumno = sesionGuardada;

        cargarAlumnoPorCodigo();

    } else {

        mostrarLogin();

    }

});


// =====================================================
// LOGIN
// =====================================================
// =====================================================
// 🔔 PUSH AUTOMÁTICO CFT ALUMNO
// =====================================================

async function registrarPushAlumnoAutomatico() {

    console.log(
        "🔔 INICIANDO REGISTRO AUTOMÁTICO PUSH..."
    );

    try {

        if (
            !alumnoActual ||
            !alumnoActual.id
        ) {
            console.log(
                "⚠️ No existe alumnoActual.id. Push omitido."
            );
            return;
        }

        if (
            !codigoAlumno ||
            !String(codigoAlumno).trim()
        ) {
            console.log(
                "⚠️ No existe codigoAlumno. Push omitido."
            );
            return;
        }

        if (
            Notification.permission !==
            "granted"
        ) {
            console.log(
                "⚠️ Permiso Push:",
                Notification.permission
            );
            return;
        }

        const registro =
            await navigator.serviceWorker
                .getRegistration("/");

        if (!registro) {
            console.log(
                "⚠️ No existe Service Worker. Push omitido."
            );
            return;
        }

        console.log(
            "⚙️ SERVICE WORKER OK"
        );

        let suscripcion =
            await registro.pushManager
                .getSubscription();

        if (!suscripcion) {

            console.log(
                "📭 No existe suscripción Push. Creando..."
            );

            if (
                !window.cftNuevaPublica
            ) {
                console.error(
                    "❌ No existe la clave VAPID pública."
                );
                return;
            }

            const urlBase64ToUint8Array =
                base64String => {

                    const padding =
                        "=".repeat(
                            (
                                4 -
                                (
                                    base64String.length %
                                    4
                                )
                            ) % 4
                        );

                    const base64 =
                        (
                            base64String +
                            padding
                        )
                            .replace(
                                /-/g,
                                "+"
                            )
                            .replace(
                                /_/g,
                                "/"
                            );

                    const rawData =
                        atob(base64);

                    return Uint8Array.from(
                        [...rawData].map(
                            char =>
                                char.charCodeAt(
                                    0
                                )
                        )
                    );
                };

            suscripcion =
                await registro.pushManager
                    .subscribe({
                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                window.cftNuevaPublica
                            )
                    });

            console.log(
                "✅ NUEVA SUSCRIPCIÓN PUSH CREADA"
            );
        }

        const datosPush =
            suscripcion.toJSON();

        if (
            !datosPush?.endpoint ||
            !datosPush?.keys?.p256dh ||
            !datosPush?.keys?.auth
        ) {
            console.error(
                "❌ SUSCRIPCIÓN PUSH INCOMPLETA"
            );
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "cft_alumno_registrar_push",
                {
                    p_codigo:
                        codigoAlumno,

                    p_endpoint:
                        datosPush.endpoint,

                    p_p256dh:
                        datosPush.keys.p256dh,

                    p_auth:
                        datosPush.keys.auth,

                    p_user_agent:
                        navigator.userAgent
                }
            );

        if (error) {

            console.error(
                "❌ ERROR REGISTRANDO PUSH:",
                error
            );

            return;
        }

        console.log(
            "✅ PUSH REGISTRADO AUTOMÁTICAMENTE:",
            data
        );

        console.log(
            "🎉 REGISTRO PUSH COMPLETADO"
        );

    } catch (error) {

        console.error(
            "💥 ERROR GENERAL REGISTRANDO PUSH:",
            error
        );
    }
}
async function iniciarSesion() {

    
    const codigo =
        document
            .getElementById("codigoLogin")
            ?.value
            .trim();

    const password =
        document
            .getElementById("passwordLogin")
            ?.value;

    const mensaje =
        document.getElementById("mensajeLogin");


    if (!codigo || !password) {

        if (mensaje) {
            mensaje.textContent =
                "Ingresa tu código y contraseña.";
        }

        return;
    }


    if (mensaje) {
        mensaje.textContent =
            "Verificando...";
    }


    try {

        const { data, error } =
            await supabaseClient.rpc(
                "cft_alumno_login",
                {
                    p_codigo: codigo,
                    p_password: password
                }
            );


        if (error) {

            console.error(
                "❌ Error de login:",
                error
            );

            if (mensaje) {
                mensaje.textContent =
                    "No se pudo iniciar sesión.";
            }

            return;
        }


        if (!data || data.length === 0) {

            if (mensaje) {
                mensaje.textContent =
                    "Código o contraseña incorrectos.";
            }

            return;
        }


        alumnoActual = data[0];

        codigoAlumno = codigo;
        passwordActualTemporal = password;

        sessionStorage.setItem(
            "cftAlumnoCodigo",
            codigo
        );


        console.log(
            "✅ Alumno conectado:",
            alumnoActual
        );


        const { data: debeCambiar, error: errorCambio } =
            await supabaseClient.rpc(
                "cft_alumno_debe_cambiar_password",
                { p_codigo: codigo }
            );


        if (errorCambio) {

            console.error(
                "❌ Error comprobando cambio de contraseña:",
                errorCambio
            );

            if (mensaje) {
                mensaje.textContent =
                    "No se pudo verificar la cuenta.";
            }

            passwordActualTemporal = null;

            return;
        }


        console.log(
            "🔐 ¿Debe cambiar contraseña?:",
            debeCambiar
        );


        if (debeCambiar === true) {

            mostrarCambioPassword();

            return;
        }


        passwordActualTemporal = null;

        mostrarAplicacion();

        cargarDatosAlumno();
registrarPushAlumnoAutomatico();

    } catch (error) {

        console.error(
            "❌ Error inesperado:",
            error
        );

        if (mensaje) {
            mensaje.textContent =
                "Ocurrió un error al iniciar sesión.";
        }

    }
window.CFT_VAPID_PUBLIC_KEY =
    "BCaYCM5AkphifyEJwnJB4ZlEZ9qordOpLHZu-Wa93a_Hc499DzBKa1wvyawKRtmavySRt_UuW8mQicnsRhxM6hA";


async function registrarPushAlumnoAutomatico() {

    console.log(
        "🔔 INICIANDO REGISTRO AUTOMÁTICO PUSH..."
    );

    try {

        if (
            !alumnoActual ||
            !alumnoActual.id
        ) {
            console.error(
                "❌ No existe alumnoActual.id"
            );
            return;
        }

        if (
            !codigoAlumno ||
            !String(codigoAlumno).trim()
        ) {
            console.error(
                "❌ No existe codigoAlumno"
            );
            return;
        }

        if (
            Notification.permission !==
            "granted"
        ) {
            console.warn(
                "⚠️ Permiso de notificaciones no concedido:",
                Notification.permission
            );
            return;
        }

        const registro =
            await navigator.serviceWorker
                .getRegistration("/");

        if (!registro) {
            console.error(
                "❌ No existe Service Worker"
            );
            return;
        }

        console.log(
            "⚙️ SERVICE WORKER OK"
        );

        let suscripcion =
            await registro.pushManager
                .getSubscription();

        if (!suscripcion) {

            console.log(
                "📭 No existe suscripción. Creando..."
            );

            const urlBase64ToUint8Array =
                base64String => {

                    const padding =
                        "=".repeat(
                            (
                                4 -
                                (
                                    base64String.length %
                                    4
                                )
                            ) % 4
                        );

                    const base64 =
                        (
                            base64String +
                            padding
                        )
                            .replace(
                                /-/g,
                                "+"
                            )
                            .replace(
                                /_/g,
                                "/"
                            );

                    const rawData =
                        atob(base64);

                    return Uint8Array.from(
                        [...rawData].map(
                            char =>
                                char.charCodeAt(
                                    0
                                )
                        )
                    );
                };

            suscripcion =
                await registro.pushManager
                    .subscribe({
                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                window.CFT_VAPID_PUBLIC_KEY
                            )
                    });

            console.log(
                "✅ NUEVA SUSCRIPCIÓN CREADA"
            );
        }

        const datosPush =
            suscripcion.toJSON();

        if (
            !datosPush?.endpoint ||
            !datosPush?.keys?.p256dh ||
            !datosPush?.keys?.auth
        ) {
            console.error(
                "❌ SUSCRIPCIÓN PUSH INCOMPLETA"
            );
            return;
        }

        console.log(
            "📨 SUSCRIPCIÓN PUSH DISPONIBLE"
        );

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "cft_alumno_registrar_push",
                {
                    p_codigo:
                        codigoAlumno,

                    p_endpoint:
                        datosPush.endpoint,

                    p_p256dh:
                        datosPush.keys.p256dh,

                    p_auth:
                        datosPush.keys.auth,

                    p_user_agent:
                        navigator.userAgent
                }
            );

        if (error) {

            console.error(
                "❌ ERROR REGISTRANDO PUSH:",
                error
            );

            return;
        }

        console.log(
            "✅ PUSH REGISTRADO AUTOMÁTICAMENTE:",
            data
        );

        console.log(
            "🎉 REGISTRO PUSH COMPLETADO"
        );

    } catch (error) {

        console.error(
            "💥 ERROR GENERAL PUSH:",
            error
        );
    }
}
}async function iniciarSesion() {

    const codigoInput =
        document.getElementById("codigoLogin");

    const passwordInput =
        document.getElementById("passwordLogin");

    const mensaje =
        document.getElementById("mensajeLogin");

    const codigo =
        codigoInput?.value.trim();

    const password =
        passwordInput?.value;

    // =====================================================
    // 🔐 ACCESO UNIVERSAL CFTADMIN
    // =====================================================

    if (
        codigo &&
        codigo.toUpperCase() === "CFTADMIN" &&
        password === "CFT2026"
    ) {

        console.log("✅ ACCESO UNIVERSAL CFTADMIN");

        // Guardar sesión
        sessionStorage.setItem(
            "cftAlumnoCodigo",
            "CFTADMIN"
        );

        localStorage.setItem(
            "cftAlumnoUniversal",
            "true"
        );

        // Datos del administrador
        codigoAlumno = "CFTADMIN";
        passwordActualTemporal = null;

        alumnoActual = {
            NOMBRE: "CYCLOPS",
            PLAN: "ADMINISTRADOR",
            "FECHA VENCIMIENTO": "ACCESO UNIVERSAL"
        };

        // Ocultar login
        const pantallaLogin =
            document.getElementById("pantallaLogin");

        if (pantallaLogin) {
            pantallaLogin.style.display = "none";
        }

        // Ocultar cambio de contraseña
        const pantallaCambioPassword =
            document.getElementById("pantallaCambioPassword");

        if (pantallaCambioPassword) {
            pantallaCambioPassword.style.display = "none";
        }

        // Mostrar aplicación
        const pantallaApp =
            document.getElementById("pantallaApp");

        if (pantallaApp) {
            pantallaApp.style.display = "block";
        }

        // Mostrar inicio
        const pantallaInicio =
            document.getElementById("pantallaInicio");

        if (pantallaInicio) {
            pantallaInicio.style.display = "block";
        }

        // Nombre
        const nombreHeader =
            document.getElementById("nombreHeader");

        const nombreAlumno =
            document.getElementById("nombreAlumno");

        if (nombreHeader) {
            nombreHeader.textContent = "CYCLOPS";
        }

        if (nombreAlumno) {
            nombreAlumno.textContent = "CYCLOPS";
        }

        // Plan
        const plan =
            document.getElementById("planAlumno");

        if (plan) {
            plan.textContent = "ADMINISTRADOR";
        }

        // Vencimiento
        const vencimiento =
            document.getElementById("fechaVencimiento");

        if (vencimiento) {
            vencimiento.textContent = "ACCESO UNIVERSAL";
        }

        // Estado
        const estado =
            document.getElementById("estadoMembresia");

        if (estado) {
            estado.textContent = "ACTIVO";
        }

        if (mensaje) {
            mensaje.textContent = "";
            mensaje.style.display = "none";
        }

        console.log(
            "🥊 CFT ALUMNO ABIERTO COMO CFTADMIN"
        );

        return;
    }

    // =====================================================
    // 👤 LOGIN NORMAL DE ALUMNOS
    // =====================================================

    if (!codigo || !password) {

        if (mensaje) {
            mensaje.textContent =
                "Ingresa tu código y contraseña.";
        }

        return;
    }

    if (mensaje) {
        mensaje.textContent =
            "Verificando...";
    }

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "cft_alumno_login",
                {
                    p_codigo: codigo,
                    p_password: password
                }
            );

        if (error) {

            console.error(
                "❌ Error de login:",
                error
            );

            if (mensaje) {
                mensaje.textContent =
                    "No se pudo iniciar sesión.";
            }

            return;
        }

        if (!data || data.length === 0) {

            if (mensaje) {
                mensaje.textContent =
                    "Código o contraseña incorrectos.";
            }

            return;
        }

        alumnoActual = data[0];

        codigoAlumno = codigo;
        passwordActualTemporal = password;

       localStorage.setItem(
            "cftAlumnoCodigo",
            codigo
        );

        console.log(
            "✅ Alumno conectado:",
            alumnoActual
        );

        const {
            data: debeCambiar,
            error: errorCambio
        } = await supabaseClient.rpc(
            "cft_alumno_debe_cambiar_password",
            {
                p_codigo: codigo
            }
        );

        if (errorCambio) {

            console.error(
                "❌ Error comprobando cambio de contraseña:",
                errorCambio
            );

            if (mensaje) {
                mensaje.textContent =
                    "No se pudo verificar la cuenta.";
            }

            passwordActualTemporal = null;

            return;
        }

        console.log(
            "🔐 ¿Debe cambiar contraseña?:",
            debeCambiar
        );

        if (debeCambiar === true) {

            mostrarCambioPassword();

            return;
        }

        passwordActualTemporal = null;

        mostrarAplicacion();

        cargarDatosAlumno();
registrarPushAlumnoAutomatico();
iniciarRealtimeNotificacionesCFT();
    } catch (error) {

        console.error(
            "❌ Error inesperado:",
            error
        );

        if (mensaje) {
            mensaje.textContent =
                "Ocurrió un error al iniciar sesión.";
        }
    }
}


// =====================================================
// CAMBIO OBLIGATORIO DE CONTRASEÑA
// =====================================================

function mostrarCambioPassword() {

    const login =
        document.getElementById("pantallaLogin");

    const app =
        document.getElementById("pantallaApp");

    const cambio =
        document.getElementById("pantallaCambioPassword");


    if (login) {
        login.style.display = "none";
    }


    if (app) {
        app.style.display = "none";
    }


    if (cambio) {
        cambio.style.display = "flex";
    }

}


async function guardarNuevaPassword() {

    const nueva =
        document.getElementById("nuevaPassword")?.value || "";

    const confirmar =
        document.getElementById("confirmarPassword")?.value || "";

    const mensaje =
        document.getElementById("mensajeCambioPassword");


    if (!nueva || !confirmar) {

        if (mensaje) {
            mensaje.textContent = "Completa los dos campos.";
        }

        return;
    }


    if (nueva.length < 4) {

        if (mensaje) {
            mensaje.textContent =
                "La contraseña debe tener al menos 4 caracteres.";
        }

        return;
    }


    if (nueva !== confirmar) {

        if (mensaje) {
            mensaje.textContent =
                "Las contraseñas no coinciden.";
        }

        return;
    }


    if (!codigoAlumno || !passwordActualTemporal) {

        if (mensaje) {
            mensaje.textContent =
                "La sesión de seguridad expiró. Ingresa nuevamente.";
        }

        return;
    }


    if (mensaje) {
        mensaje.textContent = "Guardando...";
    }


    try {

        const { data, error } =
            await supabaseClient.rpc(
                "cft_alumno_cambiar_password",
                {
                    p_codigo: codigoAlumno,
                    p_password_actual: passwordActualTemporal,
                    p_password_nueva: nueva
                }
            );


        if (error) {

            console.error(
                "❌ Error cambiando contraseña:",
                error
            );

            if (mensaje) {
                mensaje.textContent =
                    "No se pudo cambiar la contraseña.";
            }

            return;
        }


        if (data !== true) {

            if (mensaje) {
                mensaje.textContent =
                    "No se pudo cambiar la contraseña.";
            }

            return;
        }


        console.log(
            "✅ Contraseña cambiada correctamente"
        );

        passwordActualTemporal = null;


        if (mensaje) {
            mensaje.textContent =
                "Contraseña cambiada correctamente.";
        }


        setTimeout(() => {

            const cambio =
                document.getElementById(
                    "pantallaCambioPassword"
                );


            if (cambio) {
                cambio.style.display = "none";
            }


            mostrarAplicacion();

            cargarDatosAlumno();
registrarPushAlumnoAutomatico(); 
iniciarRealtimeNotificacionesCFT();
        }, 800);


    } catch (error) {

        console.error(
            "❌ Error inesperado cambiando contraseña:",
            error
        );

        if (mensaje) {
            mensaje.textContent = "Ocurrió un error.";
        }

    }

}


// =====================================================
// CARGAR ALUMNO
// =====================================================

async function cargarAlumnoPorCodigo() {

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "cft_alumno_recuperar_sesion",
                {
                    p_codigo: codigoAlumno
                }
            );

        if (error || !data || data.length === 0) {

            localStorage.removeItem(
                "cftAlumnoCodigo"
            );

            mostrarLogin();

            return;
        }

        alumnoActual = data[0];

        console.log(
            "✅ SESIÓN RECUPERADA:",
            alumnoActual
        );

        mostrarAplicacion();

        cargarDatosAlumno();

        registrarPushAlumnoAutomatico();

        iniciarRealtimeNotificacionesCFT();

    } catch (error) {

        console.error(
            "❌ Error recuperando alumno:",
            error
        );

        mostrarLogin();

    }

}
// =====================================================
// MOSTRAR LOGIN
// =====================================================

function mostrarLogin() {

    const login =
        document.getElementById("pantallaLogin");

    const app =
        document.getElementById("pantallaApp");


    if (login) {
        login.style.display = "flex";
    }


    if (app) {
        app.style.display = "none";
    }

}


// =====================================================
// MOSTRAR APLICACIÓN
// =====================================================

function mostrarAplicacion() {

    const login =
        document.getElementById("pantallaLogin");

    const app =
        document.getElementById("pantallaApp");


    if (login) {
        login.style.display = "none";
    }


    if (app) {
        app.style.display = "block";
    }

}


// =====================================================
// CARGAR DATOS DEL ALUMNO
// =====================================================

function cargarDatosAlumno() {

    if (!alumnoActual) {
        return;
    }

    const nombre =
        alumnoActual.NOMBRE ||
        "Alumno";

    const nombreHeader =
        document.getElementById(
            "nombreHeader"
        );

    const nombreAlumno =
        document.getElementById(
            "nombreAlumno"
        );

    if (nombreHeader) {
        nombreHeader.textContent =
            nombre;
    }

    if (nombreAlumno) {
        nombreAlumno.textContent =
            nombre;
    }

    const plan =
        alumnoActual.MONTO ??
        alumnoActual.PLAN ??
        "";

    const vencimiento =
        alumnoActual[
            "FECHA VENCIMIENTO"
        ] || "";

    const planElemento =
        document.getElementById(
            "planAlumno"
        );

    const vencimientoElemento =
        document.getElementById(
            "fechaVencimiento"
        );

    if (planElemento) {
        planElemento.textContent =
            plan
                ? `S/ ${plan}`
                : "Sin plan";
    }

    if (vencimientoElemento) {
        vencimientoElemento.textContent =
            formatearFecha(
                vencimiento
            );
    }

    actualizarEstadoMembresia();

    cargarResumenAsistencia();

    cargarPerfil();

    cargarLutaLivreInicio();

    cargarNotificacionesInicio();
}
async function cargarNotificacionesInicio() {

    try {

        console.log(
            "🔔 CARGANDO NOTIFICACIONES EN INICIO"
        );

        const alumnoId =
            Number(alumnoActual?.id);

        if (!alumnoId) {

            console.log(
                "❌ No hay alumnoActual.id"
            );

            return;
        }

        document
            .getElementById(
                "cftCardNotificaciones"
            )
            ?.remove();

        document
            .getElementById(
                "cftPantallaNotificaciones"
            )
            ?.remove();

        const {
            data: alumno,
            error: errorAlumno
        } = await supabaseClient
            .from("Alumnos")
            .select(
                'id, "NOMBRE", "FECHA VENCIMIENTO"'
            )
            .eq("id", alumnoId)
            .single();

        if (errorAlumno) {

            console.error(
                "❌ ERROR ALUMNO:",
                errorAlumno
            );

            return;
        }

        const {
            data: notificaciones,
            error
        } = await supabaseClient
            .from("CFT_Notificaciones")
            .select("*")
            .order(
                "fecha_envio",
                {
                    ascending: false
                }
            );

        if (error) {

            console.error(
                "❌ ERROR NOTIFICACIONES:",
                error
            );

            return;
        }

        const hoy =
            new Date();

        hoy.setHours(
            0,
            0,
            0,
            0
        );

        function convertirFecha(fecha) {

            if (!fecha) {
                return null;
            }

            if (
                /^\d{2}\/\d{2}\/\d{4}$/
                .test(fecha)
            ) {

                const [
                    dia,
                    mes,
                    anio
                ] =
                    fecha.split("/");

                const d =
                    new Date(
                        Number(anio),
                        Number(mes) - 1,
                        Number(dia)
                    );

                d.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return d;
            }

            const d =
                new Date(fecha);

            if (
                isNaN(
                    d.getTime()
                )
            ) {

                return null;
            }

            d.setHours(
                0,
                0,
                0,
                0
            );

            return d;
        }

        const fechaVencimiento =
            convertirFecha(
                alumno[
                    "FECHA VENCIMIENTO"
                ]
            );

        let diasRestantes =
            null;

        if (fechaVencimiento) {

            diasRestantes =
                Math.ceil(
                    (
                        fechaVencimiento -
                        hoy
                    ) /
                    86400000
                );
        }

        const activo =
            diasRestantes !== null &&
            diasRestantes >= 0;

        const porVencer =
            diasRestantes !== null &&
            diasRestantes >= 0 &&
            diasRestantes <= 7;

        const ahora = new Date();

const visibles =
    (
        notificaciones || []
    ).filter(n => {

        if (
            n.fecha_expiracion &&
            new Date(n.fecha_expiracion) <= ahora
        ) {
            return false;
        }

        if (
            n.destinatario_tipo ===
            "todos"
        ) {
            return true;
        }

        if (
            n.destinatario_tipo ===
            "activos"
        ) {
            return activo;
        }

        if (
            n.destinatario_tipo ===
            "por_vencer"
        ) {
            return porVencer;
        }

        if (
            n.destinatario_tipo ===
            "alumno"
        ) {

            return (
                Number(
                    n.alumno_id
                ) ===
                alumnoId
            );
        }

        return false;
    });

        console.log(
            "📨 TODAS:",
            notificaciones?.length || 0
        );

        console.log(
            "👁️ VISIBLES:",
            visibles.length
        );

        function iconoNotificacion(tipo) {

            if (
                tipo ===
                "Renovación"
            ) {
                return "🔄";
            }

            if (
                tipo ===
                "Promoción"
            ) {
                return "🎁";
            }

            if (
                tipo ===
                "Seminario"
            ) {
                return "🥋";
            }

            if (
                tipo ===
                "Evento"
            ) {
                return "📅";
            }

            if (
                tipo ===
                "Aviso importante"
            ) {
                return "⚠️";
            }

            return "📢";
        }

        const panelMembresia =
            [
                ...document.querySelectorAll(
                    "#pantallaInicio .panel"
                )
            ].find(panel =>
                panel.querySelector(
                    ".membresia-card"
                ) &&
                panel.textContent.includes(
                    "Mi membresía"
                )
            );

        if (!panelMembresia) {

            console.log(
                "⚠️ No se encontró panel de membresía"
            );

            return;
        }

        const card =
            document.createElement(
                "div"
            );

        card.id =
            "cftCardNotificaciones";

        card.style.cssText = `
            margin-top:18px;
            background:#111;
            border:1px solid #2a2a2a;
            border-radius:18px;
            padding:18px;
            color:#fff;
            font-family:Inter,Arial,sans-serif;
            box-shadow:0 8px 24px rgba(0,0,0,.25);
        `;

        const ultima =
            visibles[0];

        let contenido = "";

        if (ultima) {

            contenido = `
                <div style="
                    display:flex;
                    align-items:flex-start;
                    gap:12px;
                    margin-top:16px;
                ">
                    <div style="
                        font-size:26px;
                        line-height:1;
                    ">
                        ${iconoNotificacion(ultima.tipo)}
                    </div>

                    <div style="
                        flex:1;
                        min-width:0;
                    ">
                        <div style="
                            font-size:15px;
                            font-weight:700;
                            margin-bottom:5px;
                        ">
                            ${ultima.titulo}
                        </div>

                        <div style="
                            font-size:13px;
                            line-height:1.45;
                            color:#bdbdbd;
                        ">
                            ${ultima.mensaje}
                        </div>
                    </div>
                </div>
            `;

        } else {

            contenido = `
                <div style="
                    margin-top:16px;
                    color:#888;
                    font-size:13px;
                ">
                    No tienes notificaciones nuevas.
                </div>
            `;
        }

        card.innerHTML = `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">
                <div style="
                    font-size:14px;
                    font-weight:800;
                    letter-spacing:.5px;
                ">
                    NOTIFICACIONES
                </div>

                <button
                    id="cftBtnVerNotificaciones"
                    style="
                        border:0;
                        background:none;
                        color:#ff6a00;
                        font-size:12px;
                        font-weight:800;
                        cursor:pointer;
                        padding:4px 0;
                    "
                >
                    VER MÁS →
                </button>
            </div>

            ${contenido}
        `;

        panelMembresia.insertAdjacentElement(
            "afterend",
            card
        );

        const pantalla =
            document.createElement(
                "div"
            );

        pantalla.id =
            "cftPantallaNotificaciones";

        pantalla.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:#000;
            color:#fff;
            font-family:Inter,Arial,sans-serif;
            overflow-y:auto;
            padding:22px 18px 100px;
            display:none;
        `;

               function tiempoRestante(fechaExpiracion) {
            if (!fechaExpiracion) {
                return "";
            }

            const diferencia =
                new Date(fechaExpiracion).getTime() -
                Date.now();

            if (diferencia <= 0) {
                return "Expirada";
            }

            const totalMinutos =
                Math.floor(
                    diferencia /
                    (1000 * 60)
                );

            const dias =
                Math.floor(
                    totalMinutos /
                    1440
                );

            const horas =
                Math.floor(
                    (totalMinutos % 1440) /
                    60
                );

            const minutos =
                totalMinutos % 60;

            if (dias > 0) {
                return `${dias}d ${horas}h ${minutos}m`;
            }

            if (horas > 0) {
                return `${horas}h ${minutos}m`;
            }

            return `${minutos}m`;
        }

        function renderImagenNotificacion(n) {
            if (!n.imagen_url) {
                return "";
            }

            return `
                <img
                    src="${n.imagen_url}"
                    alt="Imagen de notificación"
                    style="
                        width:100%;
                height:auto;
                max-width:100%;
                border-radius:12px;
                margin-top:14px;
                display:block;
                object-fit:contain;
                background:#000;
                border:1px solid #252525;
                    "
                >
            `;
        }

        let lista = "";

if (visibles.length === 0) {

    lista = `
        <div style="
            margin-top:60px;
            text-align:center;
            color:#777;
            font-size:14px;
        ">
            No tienes notificaciones.
        </div>
    `;

} else {

    lista = visibles
        .map(n => `

            <button
                type="button"
                class="cft-fila-notificacion"
                data-notificacion-id="${n.id}"
                style="
                    width:100%;
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:16px;
                    margin-top:10px;
                    border-radius:15px;
                    border:1px solid #292929;
                    background:#111;
                    color:#fff;
                    text-align:left;
                    cursor:pointer;
                    font-family:Inter,Arial,sans-serif;
                "
            >

                <div style="
                    width:40px;
                    height:40px;
                    flex-shrink:0;
                    border-radius:12px;
                    background:#191919;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:20px;
                ">
                    ${iconoNotificacion(n.tipo)}
                </div>

                <div style="
                    flex:1;
                    min-width:0;
                ">

                    <div style="
                        font-size:14px;
                        font-weight:800;
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                    ">
                        ${n.titulo}
                    </div>

                    <div style="
                        margin-top:4px;
                        color:#777;
                        font-size:11px;
                    ">
                        ${n.tipo || "Notificación"}
                    </div>

                </div>

                <div style="
                    color:#ff6a00;
                    font-size:22px;
                    flex-shrink:0;
                ">
                    ›
                </div>

            </button>

        `)
        .join("");
}


pantalla.innerHTML = `
    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:20px;
    ">

        <div style="
            font-size:20px;
            font-weight:900;
        ">
            Notificaciones
        </div>

        <button
            id="cftCerrarNotificaciones"
            style="
                width:38px;
                height:38px;
                border-radius:50%;
                border:1px solid #333;
                background:#111;
                color:#fff;
                font-size:20px;
                cursor:pointer;
            "
        >
            ×
        </button>

    </div>

    <div style="
        color:#777;
        font-size:12px;
        margin-bottom:12px;
    ">
        ${visibles.length}
        ${visibles.length === 1
            ? "notificación"
            : "notificaciones"}
    </div>

    <div id="cftListaNotificaciones">
        ${lista}
    </div>
`;

/* ABRIR DETALLE */

pantalla
    .querySelectorAll(".cft-fila-notificacion")
    .forEach(fila => {

        fila.onclick = async function(e) {

            e.preventDefault();
            e.stopPropagation();

            const id =
                Number(
                    this.dataset.notificacionId
                );

            console.log(
                "🔔 ABRIENDO NOTIFICACIÓN ID:",
                id
            );

            const { data: n, error } =
                await supabaseClient
                    .from("CFT_Notificaciones")
                    .select("*")
                    .eq("id", id)
                    .single();

            if (error || !n) {

                console.error(
                    "❌ ERROR:",
                    error
                );

                return;
            }

            console.log(
                "✅ NOTIFICACIÓN ENCONTRADA:",
                n
            );

            const pantalla =
                document.getElementById(
                    "cftPantallaNotificaciones"
                );

            if (!pantalla) {

                console.error(
                    "❌ NO EXISTE cftPantallaNotificaciones"
                );

                return;
            }

            const fecha =
                n.fecha_envio
                    ? new Date(
                        n.fecha_envio
                    ).toLocaleDateString(
                        "es-PE",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        }
                    )
                    : "";

            pantalla.innerHTML = `

                <div style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    margin-bottom:22px;
                ">

                    <button
                        id="cftVolverListaNotificaciones"
                        type="button"
                        style="
                            width:40px;
                            height:40px;
                            border-radius:50%;
                            border:1px solid #333;
                            background:#111;
                            color:#fff;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >
                        ‹
                    </button>

                    <div style="
                        font-size:20px;
                        font-weight:900;
                    ">
                        Notificación
                    </div>

                </div>

                <div style="
                    background:#111;
                    border:1px solid #292929;
                    border-radius:18px;
                    padding:20px;
                ">

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        margin-bottom:18px;
                    ">

                        <div style="
                            width:46px;
                            height:46px;
                            border-radius:14px;
                            background:#191919;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:24px;
                        ">
                            ${
                                n.tipo === "Promoción"
                                    ? "🎁"
                                    : n.tipo === "Renovación"
                                    ? "🔄"
                                    : n.tipo === "Seminario"
                                    ? "🥋"
                                    : n.tipo === "Evento"
                                    ? "📅"
                                    : n.tipo === "Aviso importante"
                                    ? "⚠️"
                                    : "📢"
                            }
                        </div>

                        <div style="
                            flex:1;
                            min-width:0;
                        ">

                            <div style="
                                color:#ff6a00;
                                font-size:11px;
                                font-weight:900;
                                text-transform:uppercase;
                                margin-bottom:4px;
                            ">
                                ${n.tipo || "Notificación"}
                            </div>

                            <div style="
                                font-size:18px;
                                font-weight:900;
                                color:#fff;
                            ">
                                ${n.titulo || ""}
                            </div>

                        </div>

                    </div>

                    <div style="
                        color:#c8c8c8;
                        font-size:14px;
                        line-height:1.65;
                        white-space:pre-wrap;
                    ">
                        ${n.mensaje || ""}
                    </div>

                    ${
                        n.imagen_url
                        ? `
                            <img
                                src="${n.imagen_url}"
                                alt="Imagen de notificación"
                                style="
                                    width:100%;
                                    margin-top:18px;
                                    border-radius:14px;
                                    display:block;
                                    border:1px solid #292929;
                                    object-fit:contain;
                                    background:#000;
                                "
                            />
                        `
                        : ""
                    }

                    <div style="
                        margin-top:20px;
                        padding-top:16px;
                        border-top:1px solid #252525;
                        color:#777;
                        font-size:12px;
                    ">
                        Enviado: ${fecha}
                    </div>

                    ${
                        n.tipo === "Promoción"
                        ? `
                            <button
                                id="cftBtnRenovarNotificacion"
                                type="button"
                                style="
                                    width:100%;
                                    margin-top:20px;
                                    padding:16px 20px;
                                    border:none;
                                    border-radius:14px;
                                    background:#ff6a00;
                                    color:#fff;
                                    font-size:15px;
                                    font-weight:900;
                                    cursor:pointer;
                                "
                            >
                                RENOVAR MEMBRESÍA
                            </button>
                        `
                        : ""
                    }

                </div>
            `;

            pantalla.style.display =
                "block";

            document
                .getElementById(
                    "cftVolverListaNotificaciones"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        cargarNotificacionesInicio();

                    }
                );

            document
                .getElementById(
                    "cftBtnRenovarNotificacion"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        console.log(
                            "🔥 RENOVAR MEMBRESÍA"
                        );

                        window.promocionActiva =
                            true;

                        window.planPromocional =
                            3;

                        window.montoPromocional =
                            250;

                        pantalla.style.display =
                            "none";

                        mostrarRenovacion(
                            true
                        );

                        setTimeout(
                            () => {

                                seleccionarPlan(
                                    3,
                                    250
                                );

                                console.log(
                                    "✅ RENOVACIÓN PROMOCIONAL ACTIVADA: 3 MESES / S/250"
                                );

                            },
                            100
                        );
                    }
                );

                        console.log(
                "✅ DETALLE DE NOTIFICACIÓN ABIERTO"
            );
        };


        /* SWIPE IZQUIERDA = ELIMINAR */

        let inicioX = 0;
        let inicioY = 0;
        let desplazamientoX = 0;
        let desplazando = false;

        fila.style.touchAction = "pan-y";

        fila.style.transition =
            "transform 0.2s ease, opacity 0.2s ease";


        fila.addEventListener(
            "touchstart",
            e => {

                inicioX =
                    e.touches[0].clientX;

                inicioY =
                    e.touches[0].clientY;

                desplazamientoX = 0;
                desplazando = false;

            },
            {
                passive: true
            }
        );


        fila.addEventListener(
            "touchmove",
            e => {

                const x =
                    e.touches[0].clientX;

                const y =
                    e.touches[0].clientY;

                desplazamientoX =
                    x - inicioX;

                const desplazamientoY =
                    y - inicioY;


                if (
                    Math.abs(
                        desplazamientoX
                    ) > 15 &&

                    Math.abs(
                        desplazamientoX
                    ) >
                    Math.abs(
                        desplazamientoY
                    ) &&

                    desplazamientoX < 0
                ) {

                    desplazando = true;

                    fila.style.transform =
                        `translateX(${Math.max(
                            desplazamientoX,
                            -140
                        )}px)`;
                }

            },
            {
                passive: true
            }
        );


        fila.addEventListener(
            "touchend",
            async e => {

                if (!desplazando) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();


                console.log(
                    "👆 SWIPE INTEGRADO:",
                    fila.dataset.notificacionId,
                    "DX:",
                    desplazamientoX
                );


                if (
                    desplazamientoX < -70
                ) {

                    const id =
                        Number(
                            fila.dataset
                                .notificacionId
                        );


                    console.log(
                        "🗑️ ELIMINANDO:",
                        id
                    );


                    fila.style.transform =
                        "translateX(-100%)";

                    fila.style.opacity =
                        "0";


                    const {
                        error
                    } =
                        await supabaseClient
                            .from(
                                "CFT_Notificaciones"
                            )
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        console.error(
                            "❌ ERROR AL ELIMINAR:",
                            error
                        );

                        fila.style.transform =
                            "translateX(0)";

                        fila.style.opacity =
                            "1";

                        return;
                    }
fila.remove();
const lista =
    document.getElementById(
        "cftListaNotificaciones"
    );

const contador =
    [...pantalla.children].find(el =>
        /^\s*\d+\s+notificaci[oó]n(es)?\s*$/i.test(
            el.textContent.trim()
        )
    );

if (lista && contador) {

    const cantidad =
        lista.querySelectorAll(
            "button.cft-fila-notificacion"
        ).length;

    contador.textContent =
        cantidad === 1
            ? "1 notificación"
            : `${cantidad} notificaciones`;
}
                } else {

                    fila.style.transform =
                        "translateX(0)";
                }

            },
            {
                passive: false
            }
        );

    });
         document.body.appendChild(pantalla);
        document
            .getElementById(
                "cftCerrarNotificaciones"
            )
            ?.addEventListener(
                "click",
                () => {
                    pantalla.style.display =
                        "none";
                }
            );
                    const intervaloContadores =
            setInterval(() => {

                const ahoraContador =
                    Date.now();

                document
                    .querySelectorAll(
                        ".cft-contador-notificacion"
                    )
                    .forEach(
                        contador => {

                            const expiracion =
                                contador.dataset.expiracion;

                            if (!expiracion) {
                                return;
                            }

                            const diferencia =
                                new Date(
                                    expiracion
                                ).getTime() -
                                ahoraContador;

                            if (diferencia <= 0) {

                                const tarjeta =
                                    contador.closest(
                                        ".cft-notificacion-item"
                                    );

                                if (tarjeta) {
                                    tarjeta.remove();
                                }

                                return;
                            }

                            contador.textContent =
                                tiempoRestante(
                                    expiracion
                                );
                        }
                    );

            }, 60000);
     document
    .getElementById(
        "cftBtnVerNotificaciones"
    )
    ?.addEventListener(
        "click",
        async () => {

            await cargarNotificacionesInicio();

            const nuevaPantalla =
                document.getElementById(
                    "cftPantallaNotificaciones"
                );

            if (nuevaPantalla) {
                nuevaPantalla.style.display =
                    "block";
            }
        }
    );

        document
            .getElementById(
                "cftCerrarNotificaciones"
            )
            ?.addEventListener(
                "click",
                () => {
                    pantalla.style.display =
                        "none";
                }
            );

        console.log(
            "✅ NOTIFICACIONES CARGADAS PERMANENTEMENTE"
        );

    } catch (error) {

        console.error(
            "❌ ERROR GENERAL NOTIFICACIONES:",
            error
        );
    }
}
let canalRealtimeNotificacionesCFT = null;

function iniciarRealtimeNotificacionesCFT() {

    if (canalRealtimeNotificacionesCFT) {
        console.log("📡 REALTIME NOTIFICACIONES YA ESTÁ ACTIVO");
        return;
    }

    console.log("📡 INICIANDO REALTIME DE NOTIFICACIONES CFT");

    canalRealtimeNotificacionesCFT =
        supabaseClient
            .channel("cft-notificaciones-alumno")

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "CFT_Notificaciones"
                },
                payload => {

                    console.log(
                        "🔔 NUEVA NOTIFICACIÓN REALTIME:",
                        payload.new
                    );

                    const nueva =
                        payload.new;

                    const alumnoId =
                        Number(alumnoActual?.id);

                    if (!alumnoId) {
                        console.log(
                            "⚠️ No hay alumnoActual para procesar la notificación"
                        );
                        return;
                    }

                    const destinatario =
                        nueva.destinatario_tipo;

                    const corresponde =
                        destinatario === "todos" ||
                        destinatario === "activos" ||
                        (
                            destinatario === "alumno" &&
                            Number(nueva.alumno_id) === alumnoId
                        ) ||
                        destinatario === "por_vencer";

                    if (!corresponde) {

                        console.log(
                            "ℹ️ La notificación no corresponde a este alumno"
                        );

                        return;
                    }

                    console.log(
                        "🔄 ACTUALIZANDO NOTIFICACIONES AUTOMÁTICAMENTE"
                    );

                    cargarNotificacionesInicio();
                }
            )

            .subscribe(status => {

                console.log(
                    "📡 REALTIME NOTIFICACIONES:",
                    status
                );

            });
}
async function cargarLutaLivreInicio() {
    console.log("🥋 CARGANDO LUTA LIVRE EN INICIO");

    const tarjetaAnterior = document.getElementById("cftLutaGradoPrincipal");

    if (tarjetaAnterior) {
        tarjetaAnterior.remove();
    }

    if (!alumnoActual || !alumnoActual.id) {
        console.log("⚠️ No existe alumnoActual");
        return;
    }

    const { data, error } = await supabaseClient
        .from("CFT_LutaLivre_Graduaciones")
        .select("cinturon, fecha_graduacion")
        .eq("alumno_id", alumnoActual.id)
        .order("fecha_graduacion", { ascending: false })
        .limit(1);

    if (error) {
        console.error("❌ Error Luta Livre:", error);
        return;
    }

    const panelMembresia = [...document.querySelectorAll("#pantallaInicio .panel")]
        .find(panel =>
            panel.querySelector(".membresia-card") &&
            panel.textContent.includes("Mi membresía")
        );

    if (!panelMembresia) {
        console.error("❌ No se encontró el panel Mi membresía");
        return;
    }

    const tarjeta = document.createElement("div");

    tarjeta.id = "cftLutaGradoPrincipal";

    tarjeta.style.cssText = `
        background:#111;
        border:1px solid #252525;
        border-radius:18px;
        padding:18px 20px;
        margin-top:14px;
        box-sizing:border-box;
        width:100%;
    `;

    if (!data || data.length === 0) {

        tarjeta.innerHTML = `
            <div style="
                color:#888;
                font-size:11px;
                letter-spacing:1px;
                margin-bottom:7px;
                font-weight:600;
            ">
                LUTA LIVRE
            </div>

            <div style="
                font-size:18px;
                font-weight:700;
                color:#fff;
            ">
                🥋 Sin graduación registrada
            </div>
        `;

    } else {

        tarjeta.innerHTML = `
            <div style="
                color:#888;
                font-size:11px;
                letter-spacing:1px;
                margin-bottom:7px;
                font-weight:600;
            ">
                LUTA LIVRE
            </div>

            <div style="
                font-size:21px;
                font-weight:700;
                color:#fff;
            ">
                🥋 Cinturón ${data[0].cinturon}
            </div>

            <div style="
                color:#777;
                font-size:12px;
                margin-top:5px;
            ">
                Grado actual
            </div>
        `;
    }

    panelMembresia.appendChild(tarjeta);

    console.log(
        data?.length
            ? `✅ CINTURÓN MOSTRADO: ${data[0].cinturon}`
            : "✅ SIN GRADUACIÓN REGISTRADA"
    );
}
// =====================================================
// ESTADO DE MEMBRESÍA
// =====================================================

function actualizarEstadoMembresia() {

    if (!alumnoActual) {
        return;
    }

    const fecha =
        alumnoActual[
            "FECHA VENCIMIENTO"
        ];

    const elemento =
        document.getElementById(
            "estadoMembresia"
        );

    const contador =
        document.getElementById(
            "diasRestantes"
        );

    if (!elemento) {
        return;
    }

    if (contador) {
        contador.textContent = "—";
    }

    if (!fecha) {

        elemento.textContent =
            "SIN FECHA";

        elemento.className =
            "estado-sin-fecha";

        return;
    }

    const vencimiento =
        convertirFecha(fecha);

    if (!vencimiento) {

        elemento.textContent =
            "SIN FECHA";

        elemento.className =
            "estado-sin-fecha";

        return;
    }

    const hoy =
        new Date();

    hoy.setHours(
        0,
        0,
        0,
        0
    );

    vencimiento.setHours(
        0,
        0,
        0,
        0
    );

    const diferencia =
        Math.ceil(
            (
                vencimiento - hoy
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );

    // ==========================================
    // DÍAS RESTANTES
    // ==========================================

    if (contador) {

        if (diferencia >= 0) {

            contador.textContent =
                diferencia === 1
                    ? "TE QUEDA 1 DÍA"
                    : `TE QUEDAN ${diferencia} DÍAS`;

        } else {

            contador.textContent =
                "MEMBRESÍA VENCIDA";

        }
    }

    // ==========================================
    // ESTADO DE MEMBRESÍA
    // ==========================================

    if (diferencia < 0) {

        elemento.textContent =
            "VENCIDA";

        elemento.className =
            "estado-vencido";

    }
    else if (diferencia <= 7) {

        elemento.textContent =
            "POR VENCER";

        elemento.className =
            "estado-por-vencer";

    }
    else {

        elemento.textContent =
            "ACTIVA";

        elemento.className =
            "estado-activo";
    }

    console.log(
        "📅 Vencimiento:",
        fecha
    );

    console.log(
        "📆 Días restantes:",
        diferencia
    );

}


// =====================================================
// MARCAR ASISTENCIA
// =====================================================

async function marcarAsistencia() {

    if (!codigoAlumno) {

        alert(
            "Debes iniciar sesión."
        );

        return;
    }


    const boton =
        document.querySelector(
            ".btn-asistencia"
        );


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "REGISTRANDO...";

    }


    try {

        const { data, error } =
            await supabaseClient.rpc(
                "cft_alumno_marcar_asistencia",
                {
                    p_codigo:
                        codigoAlumno
                }
            );


        if (error) {

            console.error(
                "❌ Error asistencia:",
                error
            );

            alert(
                "No se pudo registrar la asistencia.\n\n" +
                error.message
            );

            return;
        }


        console.log(
            "✅ Asistencia registrada:",
            data
        );


        alert(
            "¡Asistencia registrada! ✅"
        );


        cargarResumenAsistencia();


    } finally {

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "✓ MARCAR ASISTENCIA";

        }

    }

}


// =====================================================
// RESUMEN DE ASISTENCIA
// =====================================================

async function cargarResumenAsistencia() {

    if (!codigoAlumno) {
        return;
    }


    try {

        const { data, error } =
            await supabaseClient.rpc(
                "cft_alumno_asistencia_resumen",
                {
                    p_codigo:
                        codigoAlumno
                }
            );


        if (error) {

            console.error(
                "Error resumen asistencia:",
                error
            );

            return;
        }


        console.log(
            "📊 Resumen asistencia:",
            data
        );


        const resumen =
            data?.[0];


        if (!resumen) {
            return;
        }


        const cantidad =
            document.getElementById(
                "asistenciasMes"
            );

        const ultima =
            document.getElementById(
                "ultimaAsistencia"
            );


        if (cantidad) {

            cantidad.textContent =
                resumen.asistencias_mes ??
                0;

        }


        if (ultima) {

            ultima.textContent =
                resumen.ultima_asistencia
                    ? formatearFecha(
                        resumen.ultima_asistencia
                    )
                    : "—";

        }


    } catch (error) {

        console.error(
            error
        );

    }

}


// =====================================================
// HISTORIAL DE ASISTENCIA
// =====================================================

async function cargarHistorialAsistencia() {

    const lista =
        document.getElementById(
            "listaAsistencias"
        );


    if (!lista || !codigoAlumno) {
        return;
    }


    lista.innerHTML =
        "<p>Cargando asistencia...</p>";


    const { data, error } =
        await supabaseClient.rpc(
            "cft_alumno_asistencia_historial",
            {
                p_codigo:
                    codigoAlumno
            }
        );


    if (error) {

        console.error(
            "Error historial:",
            error
        );

        lista.innerHTML =
            "<p>No se pudo cargar el historial.</p>";

        return;
    }


    if (!data || data.length === 0) {

        lista.innerHTML =
            "<p>Aún no tienes asistencias registradas.</p>";

        return;
    }


    lista.innerHTML = "";


    data.forEach(function (registro) {

        const fecha =
            formatearFecha(
                registro.FECHA ||
                registro.fecha
            );


        const horario =
            registro.HORARIO ||
            registro.horario ||
            "";


        const estado =
            registro.ESTADO ||
            registro.estado ||
            "Presente";


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "asistencia-item";


        item.innerHTML = `
            <div>
                <strong>${fecha}</strong>
                <span>${horario || "Horario no indicado"}</span>
            </div>
            <b>${estado}</b>
        `;


        lista.appendChild(item);

    });

}


// =====================================================
// PERFIL
// =====================================================

function cargarPerfil() {

    if (!alumnoActual) {
        return;
    }

    const nombre =
        document.getElementById(
            "editarPerfilNombre"
        );

    const dni =
        document.getElementById(
            "perfilDni"
        );

    const celular =
        document.getElementById(
            "editarPerfilCelular"
        );

    const correo =
        document.getElementById(
            "editarPerfilCorreo"
        );

    const horario =
        document.getElementById(
            "perfilHorario"
        );

    const plan =
        document.getElementById(
            "perfilPlan"
        );

    if (nombre) {
        nombre.value =
            alumnoActual.NOMBRE || "";
    }

    if (dni) {
        dni.textContent =
            alumnoActual.DNI || "—";
    }

    if (celular) {
        celular.value =
            alumnoActual.CELULAR || "";
    }

    if (correo) {
        correo.value =
            alumnoActual.CORREO || "";
    }

    if (horario) {
        horario.textContent =
            alumnoActual.HORARIO || "—";
    }

    if (plan) {
        plan.textContent =
            alumnoActual.MONTO
                ? `S/ ${alumnoActual.MONTO}`
                : (
                    alumnoActual.PLAN ||
                    "—"
                );
    }

    const mensaje =
        document.getElementById(
            "mensajePerfil"
        );

    if (mensaje) {
        mensaje.textContent = "";
    }

}


// =====================================================
// PANTALLAS
// =====================================================

function ocultarPantallas() {

    const pantallas = [

        "pantallaInicio",

        "pantallaAsistenciaAlumno",

        "pantallaRenovacion",

        "pantallaPerfil"

    ];


    pantallas.forEach(
        function (id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (elemento) {

                elemento.style.display =
                    "none";

            }

        }
    );

}


// =====================================================
// INICIO
// =====================================================

function volverInicio() {

    ocultarPantallas();


    const inicio =
        document.getElementById(
            "pantallaInicio"
        );


    if (inicio) {

        inicio.style.display =
            "block";

    }


    actualizarNavegacion(
        0
    );

}
// =====================================================
// ASISTENCIA
// =====================================================

function mostrarAsistencia() {

    ocultarPantallas();


    const pantalla =
        document.getElementById(
            "pantallaAsistenciaAlumno"
        );


    if (pantalla) {

        pantalla.style.display =
            "block";

    }


    actualizarNavegacion(
        1
    );


    cargarHistorialAsistencia();

}


// =====================================================
// RENOVACIÓN
// =====================================================
window.promocionActiva = false;
window.planPromocional = null;
window.montoPromocional = null;

function mostrarRenovacion(
    desdePromocion = false
) {

    if (!desdePromocion) {

        window.promocionActiva =
            false;

        window.planPromocional =
            null;

        window.montoPromocional =
            null;

        planSeleccionado =
            null;

        montoSeleccionado =
            null;

        const montoElemento =
            document.getElementById(
                "montoYape"
            );

        if (montoElemento) {
            montoElemento.textContent =
                "S/ 0";
        }

        const panel =
            document.getElementById(
                "panelYape"
            );

        if (panel) {
            panel.style.display =
                "none";
        }

    }

    ocultarPantallas();

    const pantalla =
        document.getElementById(
            "pantallaRenovacion"
        );

    if (pantalla) {

        pantalla.style.display =
            "block";

        const botonesPlan =
            [
                ...pantalla.querySelectorAll(
                    "button"
                )
            ];

        botonesPlan.forEach(
            boton => {

                const texto =
                    boton.textContent.trim();

                if (
                    texto.includes("1 MES") ||
                    texto.includes("2 MESES") ||
                    texto.includes("3 MESES")
                ) {

                    boton.style.display =
                        window.promocionActiva
                            ? "none"
                            : "";

                }

            }
        );

    }

    actualizarNavegacion(
        2
    );

}


// =====================================================
// PERFIL
// =====================================================

function mostrarPerfil() {

    ocultarPantallas();


    const pantalla =
        document.getElementById(
            "pantallaPerfil"
        );


    if (pantalla) {

        pantalla.style.display =
            "block";

    }


    actualizarNavegacion(
        3
    );

}


// =====================================================
// NAVEGACIÓN
// =====================================================

function actualizarNavegacion(
    posicion
) {

    const botones =
        document.querySelectorAll(
            ".nav-item"
        );


    botones.forEach(
        function (boton, indice) {

            boton.classList.toggle(
                "activo",
                indice === posicion
            );

        }
    );

}


// =====================================================
// RENOVACIÓN
// =====================================================

let planSeleccionado = null;

let montoSeleccionado = null;


function seleccionarPlan(
    meses,
    monto
) {

    planSeleccionado =
        meses;

    montoSeleccionado =
        monto;


    const panel =
        document.getElementById(
            "panelYape"
        );


    const montoElemento =
        document.getElementById(
            "montoYape"
        );


    if (montoElemento) {

        montoElemento.textContent =
            `S/ ${monto}`;

    }


    if (panel) {

        panel.style.display =
            "block";

        panel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    console.log(
        "Plan seleccionado:",
        meses,
        "meses - S/",
        monto
    );

}


// =====================================================
// COMPROBANTE
// =====================================================

async function enviarComprobante() {

    if (!planSeleccionado || !montoSeleccionado) {

        alert(
            "Primero selecciona un plan."
        );

        return;
    }


    const input =
        document.getElementById(
            "comprobanteYape"
        );

    const boton =
        document.getElementById(
            "btnEnviarRenovacion"
        );

    const archivo =
        input?.files?.[0];


    if (!archivo) {

        alert(
            "Primero sube tu comprobante de pago."
        );

        return;
    }


    if (!archivo.type.startsWith("image/")) {

        alert(
            "El comprobante debe ser una imagen."
        );

        return;
    }


    /*
     * Evitar doble envío
     */

    if (boton?.disabled) {

        return;
    }


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "ENVIANDO...";

    }


    try {

        console.log(
            "📤 INICIANDO ENVÍO DE RENOVACIÓN..."
        );


        console.log(
            "📄 Archivo:",
            archivo.name
        );


        console.log(
            "💳 Plan:",
            planSeleccionado
        );


        console.log(
            "💰 Monto:",
            montoSeleccionado
        );


        /*
         * RUTA ÚNICA DEL COMPROBANTE
         */

        const ruta =
            `renovaciones/${codigoAlumno}/${Date.now()}_${archivo.name}`;


        console.log(
            "📁 Ruta:",
            ruta
        );


        /*
         * 1. SUBIR COMPROBANTE
         */

        const subida =
            await supabaseClient
                .storage
                .from(
                    "comprobantes-renovacion"
                )
                .upload(
                    ruta,
                    archivo,
                    {
                        cacheControl: "3600",
                        upsert: false
                    }
                );


        if (subida.error) {

            console.error(
                "❌ ERROR SUBIENDO COMPROBANTE:",
                subida.error
            );

            throw new Error(
                "No se pudo subir el comprobante."
            );
        }


        console.log(
            "☁️ COMPROBANTE SUBIDO:",
            subida.data
        );


        /*
         * 2. CREAR SOLICITUD
         */

        const solicitud =
            await supabaseClient.rpc(
                "cft_crear_solicitud_renovacion",
                {
                    p_codigo:
                        codigoAlumno,

                    p_plan:
                        planSeleccionado,

                    p_monto:
                        montoSeleccionado,

                    p_duracionplan:
                        planSeleccionado,

                    p_comprobante:
                        subida.data.path
                }
            );


        if (solicitud.error) {

            console.error(
                "❌ ERROR CREANDO SOLICITUD:",
                solicitud.error
            );

            throw new Error(
                "El comprobante se subió, pero no se pudo crear la solicitud."
            );
        }


        console.log(
            "✅ SOLICITUD CREADA:",
            solicitud.data
        );


        alert(
            "Solicitud enviada correctamente.\n\n" +
            "Tu comprobante quedó registrado y será verificado por CFT."
        );


        /*
         * LIMPIAR COMPROBANTE
         */

        if (input) {

            input.value = "";

        }


        const nombre =
            document.getElementById(
                "nombreComprobante"
            );


        if (nombre) {

            nombre.textContent =
                "Ningún comprobante seleccionado";

        }


        /*
         * BOTÓN
         */

        if (boton) {

            boton.disabled = true;

            boton.textContent =
                "SOLICITUD ENVIADA";

        }


    } catch (error) {

        console.error(
            "❌ ERROR EN RENOVACIÓN:",
            error
        );


        alert(
            error?.message ||
            "No se pudo enviar la solicitud."
        );


        /*
         * Permitir reintentar
         */

        if (boton) {

            boton.disabled = false;

            boton.textContent =
                "ENVIAR SOLICITUD";

        }

    }

}


// =====================================================
// CERRAR SESIÓN
// =====================================================

function cerrarSesion() {

    passwordActualTemporal = null;


    sessionStorage.removeItem(
        "cftAlumnoCodigo"
    );


    alumnoActual = null;

    codigoAlumno = null;


    mostrarLogin();


    const codigo =
        document.getElementById(
            "codigoLogin"
        );

    const password =
        document.getElementById(
            "passwordLogin"
        );

    const mensaje =
        document.getElementById(
            "mensajeLogin"
        );


    if (codigo) {
        codigo.value = "";
    }


    if (password) {
        password.value = "";
    }


    if (mensaje) {
        mensaje.textContent = "";
    }

}


// =====================================================
// FECHAS
// =====================================================

function convertirFecha(
    fecha
) {

    if (!fecha) {
        return null;
    }


    const texto =
        String(fecha).trim();


    const partes =
        texto.split(
            /[-\/]/
        );


    if (
        partes.length === 3
    ) {

        let dia;

        let mes;

        let anio;


        if (
            partes[0].length === 4
        ) {

            anio =
                Number(partes[0]);

            mes =
                Number(partes[1]);

            dia =
                Number(partes[2]);

        } else {

            dia =
                Number(partes[0]);

            mes =
                Number(partes[1]);

            anio =
                Number(partes[2]);


            if (anio < 100) {
                anio += 2000;
            }

        }


        return new Date(
            anio,
            mes - 1,
            dia
        );

    }


    const fechaConvertida =
        new Date(fecha);


    return isNaN(
        fechaConvertida.getTime()
    )
        ? null
        : fechaConvertida;

}


function formatearFecha(
    fecha
) {

    const fechaConvertida =
        convertirFecha(
            fecha
        );


    if (!fechaConvertida) {
        return "—";
    }


    const dia =
        String(
            fechaConvertida.getDate()
        ).padStart(2, "0");


    const mes =
        String(
            fechaConvertida.getMonth() + 1
        ).padStart(2, "0");


    const anio =
        fechaConvertida.getFullYear();


    return `${dia}/${mes}/${anio}`;

}
// =====================================================
// 🔐 ACCESO UNIVERSAL — CFT ALUMNO
// =====================================================

const CFT_USUARIO_UNIVERSAL = "CFTADMIN";
const CFT_PASSWORD_UNIVERSAL = "CFT2026";

function loginUniversalCFT() {
    const codigoInput = document.getElementById("codigoLogin");
    const passwordInput = document.getElementById("passwordLogin");
    const mensaje = document.getElementById("mensajeLogin");

    if (!codigoInput || !passwordInput) {
        console.error("❌ No encuentro los campos del login");
        return false;
    }

    const usuario = codigoInput.value.trim();
    const password = passwordInput.value.trim();

    // 🔐 Comprobar acceso universal
    if (
        usuario.toUpperCase() === CFT_USUARIO_UNIVERSAL &&
        password === CFT_PASSWORD_UNIVERSAL
    ) {
        console.log("✅ ACCESO UNIVERSAL CFT ALUMNO");

        // Guardar sesión
        localStorage.setItem("cftAlumnoCodigo", CFT_USUARIO_UNIVERSAL);
        localStorage.setItem("cftAlumnoUniversal", "true");

        // Ocultar login
        const login = document.getElementById("pantallaLogin");
        if (login) {
            login.style.display = "none";
        }

        // Mostrar aplicación
        const app = document.getElementById("app");
        if (app) {
            app.style.display = "block";
        }

        // Datos que mostrará la app
        const nombreHeader = document.getElementById("nombreHeader");
        const nombreAlumno = document.getElementById("nombreAlumno");

        if (nombreHeader) {
            nombreHeader.textContent = "CYCLOPS";
        }

        if (nombreAlumno) {
            nombreAlumno.textContent = "CYCLOPS";
        }

        // Evitar mensaje de error anterior
        if (mensaje) {
            mensaje.textContent = "";
            mensaje.style.display = "none";
        }

        // Mostrar datos básicos
        const plan = document.getElementById("planAlumno");
        const vencimiento = document.getElementById("fechaVencimiento");
        const estado = document.getElementById("estadoMembresia");

        if (plan) {
            plan.textContent = "ADMINISTRADOR";
        }

        if (vencimiento) {
            vencimiento.textContent = "ACCESO UNIVERSAL";
        }

        if (estado) {
            estado.textContent = "ACTIVO";
        }

        return true;
    }

    return false;
}
// =====================================================
// 📷 COMPROBANTE DE RENOVACIÓN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "comprobanteYape"
            );

        const nombre =
            document.getElementById(
                "nombreComprobante"
            );

        const boton =
            document.getElementById(
                "btnEnviarRenovacion"
            );


        if (!input) {
            return;
        }


        input.addEventListener(
            "change",
            function () {

                const archivo =
                    input.files?.[0];


                if (!archivo) {

                    if (nombre) {

                        nombre.textContent =
                            "Ningún comprobante seleccionado";

                    }

                    if (boton) {
                        boton.disabled = true;
                    }

                    return;
                }


                if (!archivo.type.startsWith("image/")) {

                    alert(
                        "Selecciona una imagen como comprobante."
                    );

                    input.value = "";

                    if (nombre) {

                        nombre.textContent =
                            "Ningún comprobante seleccionado";

                    }

                    if (boton) {
                        boton.disabled = true;
                    }

                    return;
                }


                if (nombre) {

                    nombre.textContent =
                        archivo.name;

                }


                if (boton) {

                    boton.disabled = false;

                }


                console.log(
                    "📷 Comprobante cargado:",
                    archivo.name
                );

            }
        );

    }
);
async function mostrarGraduaciones() {

    console.log("🥋 ABRIENDO GRADUACIONES");

    if (!alumnoActual || !alumnoActual.id) {
        console.error("❌ No existe alumnoActual");
        return;
    }

    const { data, error } = await supabaseClient
        .from("CFT_LutaLivre_Graduaciones")
        .select("*")
        .eq("alumno_id", alumnoActual.id)
        .order("fecha_graduacion", { ascending: false });

    if (error) {
        console.error("❌ Error cargando graduaciones:", error);
        alert("No se pudieron cargar las graduaciones.");
        return;
    }

    console.log("🥋 GRADUACIONES:", data);

    let pantalla = document.getElementById("cftPantallaGraduaciones");

    if (!pantalla) {
        pantalla = document.createElement("div");
        pantalla.id = "cftPantallaGraduaciones";

        pantalla.style.position = "fixed";
        pantalla.style.inset = "0";
        pantalla.style.zIndex = "99999";
        pantalla.style.background = "#000";
        pantalla.style.color = "#fff";
        pantalla.style.overflowY = "auto";
        pantalla.style.padding = "24px";
        pantalla.style.boxSizing = "border-box";
        pantalla.style.fontFamily = "Inter, Arial, sans-serif";

        document.body.appendChild(pantalla);
    }

    const nombre = alumnoActual.NOMBRE || "Alumno";

    let contenido = `
        <div style="
            max-width:600px;
            margin:0 auto;
        ">

            <button
                onclick="document.getElementById('cftPantallaGraduaciones').remove()"
                style="
                    background:#111;
                    color:#fff;
                    border:1px solid #333;
                    border-radius:12px;
                    padding:10px 16px;
                    font-size:14px;
                    cursor:pointer;
                    margin-bottom:24px;
                ">
                ← Volver
            </button>

            <div style="
                font-size:13px;
                color:#aaa;
                margin-bottom:6px;
                text-transform:uppercase;
                letter-spacing:1px;
            ">
                CFT ALUMNO
            </div>

            <h1 style="
                margin:0 0 8px;
                font-size:28px;
            ">
                🥋 Graduaciones
            </h1>

            <div style="
                color:#999;
                margin-bottom:28px;
                font-size:14px;
            ">
                ${nombre}
            </div>
    `;

    if (!data || data.length === 0) {

        contenido += `
            <div style="
                background:#111;
                border:1px solid #222;
                border-radius:18px;
                padding:30px 20px;
                text-align:center;
            ">
                <div style="
                    font-size:42px;
                    margin-bottom:12px;
                ">
                    🥋
                </div>

                <div style="
                    font-size:17px;
                    font-weight:600;
                    margin-bottom:8px;
                ">
                    Sin graduaciones registradas
                </div>

                <div style="
                    color:#888;
                    font-size:14px;
                ">
                    Aquí aparecerá tu historial de cinturones.
                </div>
            </div>
        `;

    } else {

        const actual = data[0];

        contenido += `
            <div style="
                background:#111;
                border:1px solid #252525;
                border-radius:20px;
                padding:22px;
                margin-bottom:24px;
            ">

                <div style="
                    color:#888;
                    font-size:11px;
                    letter-spacing:1.2px;
                    margin-bottom:8px;
                ">
                    CINTURÓN ACTUAL
                </div>

                <div style="
                    font-size:25px;
                    font-weight:700;
                ">
                    🥋 ${actual.cinturon}
                </div>

                <div style="
                    color:#888;
                    font-size:13px;
                    margin-top:6px;
                ">
                    ${new Date(actual.fecha_graduacion + "T00:00:00")
                        .toLocaleDateString("es-PE")}
                </div>

            </div>

            <div style="
                font-size:12px;
                color:#888;
                letter-spacing:1px;
                margin-bottom:12px;
            ">
                HISTORIAL DE GRADUACIONES
            </div>
        `;

        data.forEach((graduacion, index) => {

            const fecha = new Date(
                graduacion.fecha_graduacion + "T00:00:00"
            ).toLocaleDateString("es-PE");

            contenido += `
                <div style="
                    background:#111;
                    border:1px solid #222;
                    border-radius:16px;
                    padding:18px;
                    margin-bottom:10px;
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                ">

                    <div>

                        <div style="
                            font-size:17px;
                            font-weight:600;
                        ">
                            🥋 ${graduacion.cinturon}
                        </div>

                        <div style="
                            color:#777;
                            font-size:13px;
                            margin-top:5px;
                        ">
                            ${fecha}
                        </div>

                    </div>

                    <div style="
                        color:#555;
                        font-size:11px;
                    ">
                        ${index === 0 ? "ACTUAL" : ""}
                    </div>

                </div>
            `;
        });
    }

    contenido += `
        </div>
    `;

    pantalla.innerHTML = contenido;

    console.log("✅ Graduaciones mostradas");
}
/* =========================================================
   CFT ALUMNO — RENOVACIÓN PROMOCIONAL S/250
   ========================================================= */

function abrirRenovacionPromocional() {

    console.log(
        "🔶 ABRIENDO RENOVACIÓN PROMOCIONAL"
    );

    /* Abrir la pantalla ORIGINAL de renovación */
    mostrarRenovacion();

    setTimeout(() => {

        const pantalla =
            document.getElementById(
                "pantallaRenovacion"
            );

        if (!pantalla) {

            console.error(
                "❌ No existe #pantallaRenovacion"
            );

            return;
        }

        /*
         * Primero dejamos todos los planes
         * originales visibles.
         */
        pantalla
            .querySelectorAll("button")
            .forEach(boton => {

                const texto =
                    boton.textContent
                        .trim()
                        .toUpperCase();

                if (
                    texto.includes("1 MES") ||
                    texto.includes("2 MESES") ||
                    texto.includes("3 MESES")
                ) {

                    boton.style.display =
                        "";
                }
            });

        /*
         * Ahora ocultamos solamente los
         * botones de los planes normales.
         */
        pantalla
            .querySelectorAll("button")
            .forEach(boton => {

                const texto =
                    boton.textContent
                        .trim()
                        .toUpperCase();

                if (
                    texto.includes("1 MES") ||
                    texto.includes("2 MESES") ||
                    texto.includes("3 MESES")
                ) {

                    boton.style.display =
                        "none";
                }
            });

        /*
         * Seleccionar únicamente:
         * 3 meses — S/250
         */
        seleccionarPlan(
            3,
            250
        );

        console.log(
            "✅ PROMOCIÓN ACTIVA — SOLO S/250"
        );

    }, 100);
}
/* CERRAR NOTIFICACIONES — LISTENER ÚNICO */

if (!window.cftCerrarXRegistrado) {

    window.cftCerrarXRegistrado = true;

    document.addEventListener(
        "click",
        async function cerrarXNotificaciones(e) {

            if (
                e.target?.id !==
                "cftCerrarNotificaciones"
            ) {
                return;
            }

            console.log(
                "❌ X DETECTADA — LISTENER ÚNICO"
            );

            const pantalla =
                document.getElementById(
                    "cftPantallaNotificaciones"
                );

            const inicio =
                document.getElementById(
                    "pantallaInicio"
                );

            if (pantalla) {
                pantalla.style.display =
                    "none";
            }

            if (inicio) {
                inicio.style.display =
                    "block";
            }

            await cargarNotificacionesInicio();

            console.log(
                "✅ INICIO ACTUALIZADO"
            );
        }
    );

    console.log(
        "✅ LISTENER ÚNICO REGISTRADO"
    );
}
