// Definir los parámetros de referido para cada tienda
const storeReferalParams = [
    {
        store: "Amazon",
        referal: "?tag=gpap-21"
    },
    {
        store: "Eneba",
        referal: "?af_id=GamePassAP"
    },
    {
        store: "Instant Gaming",
        referal: "?igr=gamepassap"
    },
    {
        store: "Gamivo",
        referal: "?glv=slpeycbv"
    },
    {
        store: "G2A",
        referal: ""
    },
    {
        store: "Fanatical",
        referal: "?ref=gamehub"
    },
    {
        store: "Humble Bundle",
        referal: "?partner=hache"
    }
];

// Función para obtener el parámetro de referido basado en la tienda seleccionada
function getReferalParam(storeName) {
    const store = storeReferalParams.find(s => s.store === storeName);
    return store ? store.referal : "";
}

window.onload = function() {
    // Cargar datos almacenados en localStorage al cargar la página
    if (localStorage.getItem("storeForm")) {
        const storedData = JSON.parse(localStorage.getItem("storeForm"));
        document.getElementById("referalURL").textContent = JSON.stringify(storedData, null, 2);
    }

    // Mostrar una alerta si el usuario intenta recargar la página con datos almacenados
    window.addEventListener("beforeunload", function(event) {
        if (localStorage.getItem("storeForm")) {
            event.preventDefault();
            event.returnValue = ''; // Esto activa la alerta de recarga
        }
    });
};

// Escuchar el envío del formulario
document.getElementById("storeForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario

    // Obtener los valores del formulario
    const storeUrlInput = document.getElementById("storeURL").value.trim();
    const storeName = document.getElementById("storeName").value;

    // Validar que se haya ingresado una URL y seleccionado una tienda
    if (!storeUrlInput) {
        alert("Por favor, ingresa la URL de la tienda.");
        return;
    }

    if (!storeName) {
        alert("Por favor, selecciona una tienda.");
        return;
    }

    // Obtener el parámetro de referido correspondiente
    const referalParam = getReferalParam(storeName);

    // Crear la URL final con el parámetro de referido
    let fullUrl = storeUrlInput.split('?')[0]; // Obtener solo la parte base de la URL
    if (referalParam) {
        fullUrl += referalParam; // Añadir el parámetro de referido
    }

    // Crear el objeto para el referido
    const storeForm = {
        store: storeName,
        originalURL: storeUrlInput,
        referalURL: fullUrl
    };

    // Recuperar los datos existentes de localStorage o inicializar uno vacío
    let storedData = JSON.parse(localStorage.getItem("storeForm")) || [];

    // Añadir el nuevo referido al array
    storedData.push(storeForm);

    // Guardar los datos actualizados en localStorage
    localStorage.setItem("storeForm", JSON.stringify(storedData));

    // Mostrar el JSON generado en el <pre> con id="referalURL"
    document.getElementById("referalURL").textContent = JSON.stringify(storedData, null, 2);

    // Opcional: Limpiar el formulario después de guardar
    document.getElementById("storeForm").reset();
});

// Función para limpiar localStorage
function clearStorage() {
    if (confirm("¿Estás seguro de que deseas limpiar todas las URLs de referido?")) {
        localStorage.removeItem("storeForm");
        document.getElementById("referalURL").textContent = ''; // Limpiar la salida en pantalla
    }
}

// Función para copiar el contenido del JSON al portapapeles
function copyToClipboard() {
    const jsonOutput = document.getElementById('referalURL').textContent;
    if (jsonOutput) {
        navigator.clipboard.writeText(jsonOutput).then(() => {
            alert("JSON copiado al portapapeles!");
        }).catch(err => {
            console.error('Error al copiar el JSON: ', err);
            alert("Hubo un error al copiar el JSON.");
        });
    } else {
        alert("No hay JSON para copiar.");
    }
}

// Función para copiar todos los enlaces de referido al portapapeles
function copyReferalLinks() {
    // Recuperar los datos de localStorage
    const storedData = JSON.parse(localStorage.getItem("storeForm")) || [];
    
    // Verificar si hay datos para copiar
    if (storedData.length === 0) {
        alert("No hay enlaces de referido para copiar.");
        return;
    }

    // Crear un string que contenga todos los enlaces de referido
    const referalLinks = storedData.map(item => item.referalURL).join('\n');

    // Copiar los enlaces al portapapeles
    navigator.clipboard.writeText(referalLinks)
        .then(() => {
            alert("Enlaces de referido copiados al portapapeles!");
        })
        .catch(err => {
            console.error('Error al copiar los enlaces de referido: ', err);
            alert("Hubo un error al copiar los enlaces de referido.");
        });
}