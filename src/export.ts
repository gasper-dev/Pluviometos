import * as XLSX from 'xlsx';

let workbookGlobal: XLSX.WorkBook | null = null;
let excelProcesado: XLSX.WorkBook | null = null;

/**
 * Convierte fechas de Excel (string o número serial)
 * a formato YYYY-MM-DD
 */
function normalizarFecha(valor: any): string {
  if (typeof valor === 'string') {
    const d = new Date(valor);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return '';
  }

  if (typeof valor === 'number') {
    const date = XLSX.SSF.parse_date_code(valor);
    if (date) {
      const yyyy = date.y;
      const mm = String(date.m).padStart(2, '0');
      const dd = String(date.d).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  return '';
}

export function setupExcelForm() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const sheetSelect = document.getElementById('sheetSelect') as HTMLSelectElement;
  const btnProcess = document.getElementById('btnProcess') as HTMLButtonElement;
  const btnDownload = document.getElementById('btnDownload') as HTMLButtonElement;

  // 📥 Leer archivo y pestañas
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      workbookGlobal = XLSX.read(data, { type: 'array' });

      sheetSelect.innerHTML = `<option value="">Seleccione una pestaña</option>`;
      workbookGlobal.SheetNames.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sheetSelect.appendChild(opt);
      });

      sheetSelect.disabled = false;
    };

    reader.readAsArrayBuffer(file);
  });

  // ⚙️ Procesar pestaña seleccionada
  btnProcess.addEventListener('click', () => {
    if (!workbookGlobal) return;

    const sheetName = sheetSelect.value;
    if (!sheetName) {
      alert('Seleccione una pestaña');
      return;
    }

    const sheet = workbookGlobal.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headers = rows[0]; // fila de encabezados

    // Índices fijos según tu Excel
    const IDX_PERIODO = 0;
    const IDX_EMPRESA = 1;
    const IDX_DISTRITO = 2;
    const IDX_ESTACION = 3;
    const IDX_FECHAS_INICIO = 4;

    const salida: {
      Periodo: string;
      Empresa: string;
      Distrito: string;
      Estacion: string;
      Fecha: string;
      MM: number;
    }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      const periodo = row[IDX_PERIODO];
      const empresa = row[IDX_EMPRESA];
      const distrito = row[IDX_DISTRITO];
      const estacion = row[IDX_ESTACION];

      if (!estacion) continue;

      // Recorremos SOLO columnas de fechas
      for (let j = IDX_FECHAS_INICIO; j < headers.length; j++) {
        const fecha = normalizarFecha(headers[j]);
        const mm = row[j];

        if (fecha && mm !== undefined && mm !== null) {
          salida.push({
            Periodo: String(periodo),
            Empresa: String(empresa),
            Distrito: String(distrito),
            Estacion: String(estacion),
            Fecha: fecha,
            MM: Number(mm)
          });
        }
      }
    }

    // 📊 Crear Excel normalizado
    const nuevaHoja = XLSX.utils.json_to_sheet(salida);

    nuevaHoja['!cols'] = [
      { wch: 10 }, // Periodo
      { wch: 15 }, // Empresa
      { wch: 20 }, // Distrito
      { wch: 25 }, // Estacion
      { wch: 12 }, // Fecha
      { wch: 10 }  // MM
    ];

    excelProcesado = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(excelProcesado, nuevaHoja, sheetName);

    btnDownload.disabled = false;
    alert(`Pestaña "${sheetName}" procesada correctamente`);
  });

  // 💾 Descargar
  btnDownload.addEventListener('click', () => {
    if (!excelProcesado) return;
    XLSX.writeFile(excelProcesado, 'excel_normalizado.xlsx');
  });

  sheetSelect.addEventListener('change', () => {
    btnProcess.disabled = !sheetSelect.value;
  });
}
