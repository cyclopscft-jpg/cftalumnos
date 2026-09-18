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
        sessionStorage.getItem("cftAlumnoCodigo");

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

        sessionStorage.setItem(
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
                "cft_alumno_login",
                {
                    p_codigo: codigoAlumno,
                    p_password: null
                }
            );


        // Si la sesión guardada no puede recuperarse,
        // volvemos al login.

        if (error || !data || data.length === 0) {

            sessionStorage.removeItem(
                "cftAlumnoCodigo"
            );

            mostrarLogin();

            return;
        }


        alumnoActual = data[0];

        mostrarAplicacion();

        cargarDatosAlumno();


    } catch (error) {

        console.error(
            "Error recuperando alumno:",
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


    // Datos de membresía

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

function mostrarRenovacion() {

    ocultarPantallas();


    const pantalla =
        document.getElementById(
            "pantallaRenovacion"
        );


    if (pantalla) {

        pantalla.style.display =
            "block";

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
