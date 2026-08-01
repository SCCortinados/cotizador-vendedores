const ENLACE_COTIZADOR =
  "https://docs.google.com/spreadsheets/d/1JJ0kSoKUcvLyBJldCfnGcVzhJozHOsb5pg8JpGkPO_Q/edit?usp=sharing";

const NOMBRE_PESTAÑA = "COTIZADOR";

function doGet(e) {
  if (e && e.parameter.page === "informacion") {
    const informacion = HtmlService.createTemplateFromFile("informacion");

    informacion.codigoCliente = String(
      e.parameter.cliente || ""
    ).trim().toUpperCase();

    return informacion.evaluate()
      .setTitle("Información importante");
  }

  const plantilla = HtmlService.createTemplateFromFile("Index");

  plantilla.codigoCliente = String(
    e && e.parameter.cliente ? e.parameter.cliente : ""
  ).trim().toUpperCase();

  return plantilla.evaluate()
    .setTitle("Cotizador SC CORTINADOS");
}
function calcularPrecio(mecanismo, ancho, alto, dobleSistema, codigoCliente) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    const archivo = SpreadsheetApp.openByUrl(ENLACE_COTIZADOR);
    const hoja = archivo.getSheetByName(NOMBRE_PESTAÑA);

    if (!hoja) {
      throw new Error("No se encontró la pestaña COTIZADOR.");
    }
const codigo = String(codigoCliente || "").trim().toUpperCase();

if (!codigo) {
  throw new Error("El enlace del revendedor no es válido.");
}

const hojaRevendedores = archivo.getSheetByName("REVENDEDORES");

if (!hojaRevendedores) {
  throw new Error('No se encontró la pestaña "REVENDEDORES".');
}

const ultimaFila = hojaRevendedores.getLastRow();

const codigos = ultimaFila >= 2
  ? hojaRevendedores
      .getRange(2, 1, ultimaFila - 1, 1)
      .getDisplayValues()
      .flat()
      .map(function(valor) {
        return String(valor).trim().toUpperCase();
      })
  : [];

if (codigos.indexOf(codigo) === -1) {
  throw new Error("El código del revendedor no existe.");
}

hoja.getRange("A3").setValue(codigo);
    const anchoNumero = Number(String(ancho).replace(",", "."));
    const altoNumero = Number(String(alto).replace(",", "."));

    if (!mecanismo || isNaN(anchoNumero) || isNaN(altoNumero)) {
      throw new Error("Completá mecanismo, ancho y alto.");
    }

    // Carga las medidas en la planilla.
    hoja.getRange("D3").setValue(anchoNumero);
    hoja.getRange("E3").setValue(altoNumero);

    // Calcula el primer mecanismo elegido.
    hoja.getRange("B3").setValue(mecanismo);
    hoja.getRange("C3").setValue("NO");

    SpreadsheetApp.flush();

    const precioPrimero = Number(hoja.getRange("U3").getValue());

    if (isNaN(precioPrimero)) {
      throw new Error("No se pudo obtener el precio final.");
    }

    let precioFinal = precioPrimero;

    if (dobleSistema === true) {
      let segundoMecanismo;

      if (mecanismo === "32 PLUS") {
        segundoMecanismo = "32 PREMIUM";
      } else if (mecanismo === "38 PLUS") {
        segundoMecanismo = "38 PREMIUM";
      } else if (mecanismo === "32 PREMIUM") {
        segundoMecanismo = "32 PREMIUM";
      } else if (mecanismo === "38 PREMIUM") {
        segundoMecanismo = "38 PREMIUM";
      } else {
        throw new Error("No se pudo determinar el segundo mecanismo.");
      }

      // Calcula el segundo mecanismo con las mismas medidas.
      hoja.getRange("B3").setValue(segundoMecanismo);
      hoja.getRange("C3").setValue("NO");

      SpreadsheetApp.flush();

      const precioSegundo = Number(hoja.getRange("U3").getValue());

      if (isNaN(precioSegundo)) {
        throw new Error("No se pudo obtener el precio del segundo mecanismo.");
      }

      precioFinal = precioPrimero + precioSegundo + 12500;

      // Vuelve a dejar visible el mecanismo elegido originalmente.
      hoja.getRange("B3").setValue(mecanismo);
      hoja.getRange("C3").setValue("SI");

      SpreadsheetApp.flush();
    } else {
      hoja.getRange("C3").setValue("NO");
    }

    return precioFinal.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    });

  } finally {
    bloqueo.releaseLock();
  }
}
function guardarPedido(vendedor, productos) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    if (!vendedor || !String(vendedor).trim()) {
      throw new Error("Falta el nombre del vendedor.");
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      throw new Error("El pedido no tiene productos.");
    }

    const archivo = SpreadsheetApp.openByUrl(ENLACE_COTIZADOR);
    const hojaPedidos = archivo.getSheetByName("PEDIDOS");

    if (!hojaPedidos) {
      throw new Error('No se encontró la pestaña "PEDIDOS".');
    }

    const ahora = new Date();

    const numeroPedido = Utilities.formatDate(
      ahora,
      Session.getScriptTimeZone(),
      "yyyyMMdd-HHmmss"
    );

    const filas = productos.map(function(producto) {
      const mecanismoCompleto = String(producto.mecanismo || "");
      const mecanismo = mecanismoCompleto.indexOf("38") === 0 ? "38" : "32";

      return [
        numeroPedido,
        ahora,
        String(vendedor).trim(),
        mecanismo,
        producto.ancho || "",
        producto.alto || "",
        producto.tela || "",
        producto.color || "",
        producto.doble || "Simple",
        Number(producto.cantidad) || 1,
        producto.observaciones || "",
        producto.precio || "",
        "PENDIENTE"
      ];
    });

    hojaPedidos
      .getRange(hojaPedidos.getLastRow() + 1, 1, filas.length, 13)
      .setValues(filas);

    return numeroPedido;

  } finally {
    bloqueo.releaseLock();
  }
}
function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);

    let resultado;

    switch (datos.accion) {

      case "calcularPrecio":
        resultado = calcularPrecio(
          datos.mecanismo,
          datos.ancho,
          datos.alto,
          datos.dobleSistema,
          datos.codigoCliente
        );
        break;

      case "guardarPedido":
        resultado = guardarPedido(
          datos.vendedor,
          datos.productos
        );
        break;

      default:
        throw new Error("Acción no válida.");
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        resultado: resultado
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: err.message
      }))
      .setMimeType(ContentService.MimeType.JSON);

  }
}
