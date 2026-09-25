// Arreglo global mutable para las evaluaciones
let evaluations = [
    {
        id: 'EVAL-01',
        taskName: 'Llenado de Formulario de Registro',
        category: 'Entrada de Datos / Formulario',
        time: 12,
        errors: 0,
        successRate: 100,
        csat: 5,
        seq: 6,
        observations: 'Flujo claro e intuitivo.'
    },
    {
        id: 'EVAL-02',
        taskName: 'Búsqueda con Filtros Combinados',
        category: 'Búsqueda / Filtros',
        time: 22,
        errors: 2,
        successRate: 50,
        csat: 2,
        seq: 3,
        observations: 'El botón de aplicar filtros no es visible.'
    },
    {
        id: 'EVAL-03',
        taskName: 'Exportar Datos desde Tabla',
        category: 'Visualización / Tablas',
        time: 8,
        errors: 0,
        successRate: 100,
        csat: 4,
        seq: 7,
        observations: 'Icono de descarga bien ubicado.'
    },
    {
        id: 'EVAL-04',
        taskName: 'Navegación en Menú Desplegable',
        category: 'Navegación / Botones',
        time: 18,
        errors: 2,
        successRate: 100,
        csat: 3,
        seq: 4,
        observations: 'Demasiadas opciones colapsadas.'
    },
    {
        id: 'EVAL-05',
        taskName: 'Iniciar sesión',
        category: 'Entrada de Datos / Formulario',
        time: 10,
        errors: 1,
        successRate: 100,
        csat: 4,
        seq: 6,
        observations: 'El proceso de iniciar sesión es fácil e intuitivo.'
    }
];

let doughnutChartInstance = null;
let barChartInstance = null;

// Determinar si una tarea es Aceptable
function calculateAcceptability(item) {
    return item.time <= 15 && item.errors <= 1 && item.successRate === 100 && item.csat >= 4;
}

// Renderizar la tabla de resultados
function renderTable(data) {
    const tbody = document.getElementById('usability-table-body');
    tbody.innerHTML = '';

    data.forEach(item => {
        const isAcceptable = calculateAcceptability(item);
        const timeClass = item.time > 15 ? 'text-red-500 font-bold' : 'text-slate-700';
        const errorClass = item.errors > 1 ? 'text-red-500 font-bold' : 'text-slate-700';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition-colors';
        tr.innerHTML = `
            <td class="p-3 font-semibold text-slate-800">${item.id}</td>
            <td class="p-3">
                <div class="font-medium text-slate-800">${item.taskName}</div>
                <div class="text-[10px] text-slate-400">${item.category}</div>
            </td>
            <td class="p-3 ${timeClass}">${item.time}s</td>
            <td class="p-3 ${errorClass}">${item.errors}</td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${item.successRate === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                    ${item.successRate}%
                </span>
            </td>
            <td class="p-3">
                <div class="font-medium">CSAT: ${item.csat}/5</div>
                <div class="text-[10px] text-slate-400">SEQ: ${item.seq}/7</div>
            </td>
            <td class="p-3 text-slate-500">${item.observations}</td>
            <td class="p-3">
                ${isAcceptable 
                    ? `<span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        <i class="fa-solid fa-circle-check"></i> ACEPTABLE
                       </span>`
                    : `<span class="inline-flex items-center gap-1 bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        <i class="fa-solid fa-circle-xmark"></i> NO ACEPTABLE
                       </span>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Actualizar tarjetas resumen (KPIs)
function updateKPIs(data) {
    const total = data.length;
    const acceptables = data.filter(calculateAcceptability).length;
    const rate = total > 0 ? ((acceptables / total) * 100).toFixed(0) : 0;
    const avgTime = total > 0 ? (data.reduce((acc, curr) => acc + Number(curr.time), 0) / total).toFixed(1) : 0;
    const avgCsat = total > 0 ? (data.reduce((acc, curr) => acc + Number(curr.csat), 0) / total).toFixed(1) : 0;

    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-rate').textContent = `${rate}%`;
    document.getElementById('kpi-time').textContent = `${avgTime}s`;
    document.getElementById('kpi-csat').textContent = `${avgCsat}/5`;
}

// Renderizar gráficos
function renderCharts(data) {
    const acceptables = data.filter(calculateAcceptability).length;
    const notAcceptables = data.length - acceptables;

    // Gráfico de Dona
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    if (doughnutChartInstance) doughnutChartInstance.destroy();
    
    doughnutChartInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Aceptable', 'No Aceptable'],
            datasets: [{
                data: [acceptables, notAcceptables],
                backgroundColor: ['#10b981', '#f43f5e'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Agrupar tiempo por categoría
    const categoryTimes = {};
    const categoryCounts = {};

    data.forEach(item => {
        const key = item.category.split('/')[0].trim();
        categoryTimes[key] = (categoryTimes[key] || 0) + Number(item.time);
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
    });

    const labels = Object.keys(categoryTimes);
    const avgTimes = labels.map(key => (categoryTimes[key] / categoryCounts[key]).toFixed(1));

    // Gráfico de Barras
    const ctxBar = document.getElementById('barChart').getContext('2d');
    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tiempo Promedio (s)',
                data: avgTimes,
                backgroundColor: '#6366f1',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Agregar nueva evaluación desde formulario
function addNewEvaluation(event) {
    event.preventDefault();

    const taskName = document.getElementById('input-task').value.trim();
    const category = document.getElementById('input-category').value;
    const time = Number(document.getElementById('input-time').value);
    const errors = Number(document.getElementById('input-errors').value);
    const successRate = Number(document.getElementById('input-success').value);
    const csat = Number(document.getElementById('input-csat').value);
    const seq = Number(document.getElementById('input-seq').value);
    const observations = document.getElementById('input-obs').value.trim() || 'Sin observaciones.';

    const newId = `EVAL-${String(evaluations.length + 1).padStart(2, '0')}`;

    evaluations.push({
        id: newId,
        taskName,
        category,
        time,
        errors,
        successRate,
        csat,
        seq,
        observations
    });

    renderAll();
    document.getElementById('evaluation-form').reset();
}

// Renderizar todos los componentes
function renderAll() {
    renderTable(evaluations);
    updateKPIs(evaluations);
    renderCharts(evaluations);
}

// Exportar a PDF preservando el enlace cliqueable
async function exportToPDF(event) {
    const { jsPDF } = window.jspdf;
    const container = document.getElementById('report-container');

    const btn = event ? event.currentTarget : null;
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...`;
        btn.disabled = true;
    }

    try {
        const canvas = await html2canvas(container, {
            scale: 1.2,
            useCORS: true,
            logging: false,
            ignoreElements: (element) => element.classList.contains('no-print')
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8);

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // --- SUPERPOSICIÓN DE HIPERVÍNCULO SOBRE EL PDF ---
        const repoLinkElement = container.querySelector('a[href*="github.com"]');
        if (repoLinkElement) {
            const url = repoLinkElement.href; 
            const containerRect = container.getBoundingClientRect();
            const linkRect = repoLinkElement.getBoundingClientRect();

            const scaleFactor = 210 / containerRect.width;
            const x = (linkRect.left - containerRect.left) * scaleFactor;
            const y = (linkRect.top - containerRect.top) * scaleFactor;
            const w = linkRect.width * scaleFactor;
            const h = linkRect.height * scaleFactor;

            pdf.setPage(1);
            pdf.link(x, y, w, h, { url: url });
        }

        pdf.save(`Informe_Usabilidad_UX_Cantos_Yepez_y_Macias_Lucas.pdf`);
    } catch (err) {
        console.error("Error generando el PDF:", err);
        window.print();
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    renderAll();

    const textarea = document.getElementById('report-conclusions');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        });
    }
});