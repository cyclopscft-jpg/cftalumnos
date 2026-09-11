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


    if (!elemento) {
        return;
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

        return;
    }


    const hoy =
        new Date();


    hoy.setHours(
        0, 0, 0, 0
    );


    vencimiento.setHours(
        0, 0, 0, 0
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


    const datos = {

        perfilNombre:
            alumnoActual.NOMBRE || "—",

        perfilDni:
            alumnoActual.DNI || "—",

        perfilCelular:
            alumnoActual.CELULAR || "—",

        perfilCorreo:
            alumnoActual.CORREO || "—",

        perfilHorario:
            alumnoActual.HORARIO || "—",

        perfilPlan:
            alumnoActual.MONTO
                ? `S/ ${alumnoActual.MONTO}`
                : (
                    alumnoActual.PLAN ||
                    "—"
                )

    };


    Object.keys(datos).forEach(
        function (id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (elemento) {

                elemento.textContent =
                    datos[id];

            }

        }
    );

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

function enviarComprobante() {

    if (!planSeleccionado) {

        alert(
            "Primero selecciona un plan."
        );

        return;
    }


    alert(
        "El pago quedará pendiente de verificación.\n\n" +
        "Aquí conectaremos posteriormente el envío del comprobante."
    );

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