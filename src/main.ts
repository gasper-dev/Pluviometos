import './style.css'

import { setupExcelForm } from './export';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h2>Normalizar archivo Excel</h2>

    <input type="file" id="fileInput" accept=".xlsx,.xls" />

    <select id="sheetSelect" disabled>
      <option value="">Seleccione una pestaña</option>
    </select>

    <div class="card">
      <button id="btnProcess" type="button" disabled>
        Procesar pestaña
      </button>
    </div>

    <div class="card">
      <button id="btnDownload" type="button" disabled>
        Descargar Excel Normalizado
      </button>
    </div>
  </div>
`;





// Pasamos el elemento a la función encargada de configurar el evento
const btn = document.querySelector<HTMLButtonElement>('#btnDownload');
if (btn) {
  setupExcelForm();
}