document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <style>
      .cotizador-container {
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        background: #ffffff;
      }
      .cotizador-container h2 {
        text-align: center;
        color: #2c3e50;
        margin-top: 0;
      }
      .form-group {
        margin-bottom: 15px;
      }
      .form-group label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
      }
      .form-group input, .form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-sizing: border-box;
        font-size: 16px;
      }
      .btn-calcular {
        width: 100%;
        padding: 12px;
        background-color: #27ae60;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
      }
      .resultado {
        margin-top: 20px;
        padding: 15px;
        background: #f4f6f7;
        border-radius: 6px;
        text-align: center;
      }
      .resultado h3 {
        margin: 0;
        color: #2c3e50;
      }
    </style>

    <div class="cotizador-container">
      <h2>Cotizador de Cortinas</h2>
      
      <div class="form-group">
        <label for="ancho">Ancho (metros):</label>
        <input type="number" id="ancho" step="0.01" placeholder="Ej: 1.50">
      </div>

      <div class="form-group">
        <label for="alto">Alto (metros):</label>
        <input type="number" id="alto" step="0.01" placeholder="Ej: 2.00">
      </div>

      <div class="form-group">
        <label for="tela">Tipo de Tela:</label>
        <select id="tela">
          <option value="blackout">Blackout</option>
          <option value="sunscreen">Sunscreen 5%</option>
          <option value="doble">Sistema Doble (Blackout + Screen)</option>
        </select>
      </div>

      <button class="btn-calcular" onclick="calcularCotizacion()">Calcular Cotización</button>

      <div class="resultado" id="resultadoBox" style="display:none;">
        <p>Total estimado:</p>
        <h3 id="precioFinal">$0</h3>
      </div>
    </div>
  `;
});

function calcularCotizacion() {
  const ancho = parseFloat(document.getElementById("ancho").value);
  const alto = parseFloat(document.getElementById("alto").value);
  const tela = document.getElementById("tela").value;
  const resultadoBox = document.getElementById("resultadoBox");
  const precioFinal = document.getElementById("precioFinal");

  if (!ancho || !alto || ancho <= 0 || alto <= 0) {
    alert("Por favor ingresá un ancho y alto válidos.");
    return;
  }

  let precioM2 = 0;
  if (tela === "blackout") precioM2 = 25000;
  else if (tela === "sunscreen") precioM2 = 28000;
  else if (tela === "doble") precioM2 = 50000;

  const m2 = ancho * alto;
  const total = Math.round(m2 * precioM2);

  precioFinal.innerText = "$" + total.toLocaleString("es-AR");
  resultadoBox.style.display = "block";
}
