   // --- Estado de la Aplicación ---
        let evaluations = [];
        let statusChartInstance = null;
        let perfChartInstance = null;

        // Umbrales por defecto
        const THRESHOLDS = {
            maxTime: 15,
            maxErrors: 1,
            minSuccess: 100,
            minCsat: 4,
            minSeq: 5
        };

        // --- Datos Iniciales de Ejemplo ---
        const initialData = [
            {
                id: 'EVAL-01',
                taskName: 'Llenado de Formulario de Registro',
                category: 'Entrada de Datos / Formulario',
                time: 12,
                errors: 0,
                success: 100,
                csat: 5,
                seq: 6,
                comment: 'Flujo claro e intuitivo.'
            },
            {
                id: 'EVAL-02',
                taskName: 'Búsqueda con Filtros Combinados',
                category: 'Búsqueda / Filtros',
                time: 22,
                errors: 2,
                success: 50,
                csat: 2,
                seq: 3,
                comment: 'El botón de aplicar filtros no es visible.'
            },
            {
                id: 'EVAL-03',
                taskName: 'Exportar Datos desde Tabla',
                category: 'Visualización / Tablas',
                time: 8,
                errors: 0,
                success: 100,
                csat: 4,
                seq: 7,
                comment: 'Icono de descarga bien ubicado.'
            },
            {
                id: 'EVAL-04',
                taskName: 'Navegación en Menú Desplegable',
                category: 'Navegación / Botones',
                time: 18,
                errors: 2,
                success: 100,
                csat: 3,
                seq: 4,
                comment: 'Demasiadas opciones colapsadas.'
            }
        ];

        // --- Inicialización al cargar el DOM ---
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('print-date').textContent = new Date().toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // Cargar datos por defecto
            evaluations = [...initialData];
            
            // Inicializar Gráficos
            initCharts();
            
            // Renderizar interfaz
            renderAll();

            // Manejo de Formulario
            document.getElementById('evaluation-form').addEventListener('submit', handleAddEvaluation);
        });

        // --- Función para evaluar Aceptabilidad ---
        function calculateStatus(item) {
            const isTimeOk = item.time <= THRESHOLDS.maxTime;
            const isErrorOk = item.errors <= THRESHOLDS.maxErrors;
            const isSuccessOk = item.success >= THRESHOLDS.minSuccess;
            const isCsatOk = item.csat >= THRESHOLDS.minCsat;
            const isSeqOk = item.seq >= THRESHOLDS.minSeq;

            const isAcceptable = isTimeOk && isErrorOk && isSuccessOk && isCsatOk && isSeqOk;

            return {
                isAcceptable,
                details: { isTimeOk, isErrorOk, isSuccessOk, isCsatOk, isSeqOk }
            };
        }

        // --- Manejador de Registro ---
        function handleAddEvaluation(e) {
            e.preventDefault();

            const newTask = {
                id: 'EVAL-' + String(evaluations.length + 1).padStart(2, '0'),
                taskName: document.getElementById('task-name').value,
                category: document.getElementById('task-category').value,
                time: parseFloat(document.getElementById('time-val').value),
                errors: parseInt(document.getElementById('error-val').value),
                success: parseInt(document.getElementById('success-val').value),
                csat: parseInt(document.getElementById('csat-val').value),
                seq: parseInt(document.getElementById('seq-val').value),
                comment: document.getElementById('comment-val').value || 'Sin observaciones'
            };

            evaluations.push(newTask);
            renderAll();

            // Resetear inputs del formulario
            document.getElementById('task-name').value = '';
            document.getElementById('time-val').value = '';
            document.getElementById('error-val').value = '';
            document.getElementById('comment-val').value = '';
        }

        // --- Renderizado Completo de la Vista ---
        function renderAll() {
            renderTable();
            updateKPIs();
            updateCharts();
        }

        function renderTable() {
            const tbody = document.getElementById('results-table-body');
            tbody.innerHTML = '';

            if (evaluations.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center py-8 text-slate-400">
                            No hay evaluaciones registradas. Agrega una nueva prueba en el formulario.
                        </td>
                    </tr>
                `;
                return;
            }

            evaluations.forEach((item, index) => {
                const evalResult = calculateStatus(item);
                const isAcceptable = evalResult.isAcceptable;

                const tr = document.createElement('tr');
                tr.className = index % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50';

                tr.innerHTML = `
                    <td class="p-3.5 font-bold text-slate-700">${item.id}</td>
                    <td class="p-3.5">
                        <div class="font-semibold text-slate-800">${escapeHtml(item.taskName)}</div>
                        <div class="text-[10px] text-slate-400">${item.category}</div>
                    </td>
                    <td class="p-3.5">
                        <span class="${item.time <= THRESHOLDS.maxTime ? 'text-slate-700' : 'text-rose-600 font-bold'}">
                            ${item.time}s
                        </span>
                    </td>
                    <td class="p-3.5">
                        <span class="${item.errors <= THRESHOLDS.maxErrors ? 'text-slate-700' : 'text-rose-600 font-bold'}">
                            ${item.errors}
                        </span>
                    </td>
                    <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded text-[11px] font-medium ${item.success === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ${item.success}%
                        </span>
                    </td>
                    <td class="p-3.5">
                        <div class="text-slate-700">CSAT: <strong>${item.csat}/5</strong></div>
                        <div class="text-[10px] text-slate-400">SEQ: ${item.seq}/7</div>
                    </td>
                    <td class="p-3.5 text-slate-500 max-w-[200px] truncate" title="${escapeHtml(item.comment)}">
                        ${escapeHtml(item.comment)}
                    </td>
                    <td class="p-3.5 text-center">
                        ${isAcceptable 
                            ? `<span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                                 <i class="fa-solid fa-check-circle"></i> ACEPTABLE
                               </span>`
                            : `<span class="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-300">
                                 <i class="fa-solid fa-xmark-circle"></i> NO ACEPTABLE
                               </span>`
                        }
                    </td>
                    <td class="p-3.5 text-center no-print">
                        <button onclick="deleteEvaluation(${index})" class="text-slate-400 hover:text-rose-600 transition-colors p-1" title="Eliminar registro">
                            <i class="fa-solid fa-trash-can text-sm"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function updateKPIs() {
            const total = evaluations.length;
            if (total === 0) {
                document.getElementById('stat-total').textContent = '0';
                document.getElementById('stat-acceptable-pct').textContent = '0%';
                document.getElementById('stat-avg-time').textContent = '0s';
                document.getElementById('stat-avg-csat').textContent = '0 / 5';
                return;
            }

            const acceptableCount = evaluations.filter(e => calculateStatus(e).isAcceptable).length;
            const pct = Math.round((acceptableCount / total) * 100);
            
            const avgTime = (evaluations.reduce((acc, curr) => acc + curr.time, 0) / total).toFixed(1);
            const avgCsat = (evaluations.reduce((acc, curr) => acc + curr.csat, 0) / total).toFixed(1);

            document.getElementById('stat-total').textContent = total;
            document.getElementById('stat-acceptable-pct').textContent = `${pct}%`;
            document.getElementById('stat-avg-time').textContent = `${avgTime}s`;
            document.getElementById('stat-avg-csat').textContent = `${avgCsat} / 5`;
        }

        function initCharts() {
            // Chart 1: Donut Status
            const ctxStatus = document.getElementById('chart-status').getContext('2d');
            statusChartInstance = new Chart(ctxStatus, {
                type: 'doughnut',
                data: {
                    labels: ['Aceptable', 'No Aceptable'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#10b981', '#f43f5e'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 11 } } }
                    }
                }
            });

            // Chart 2: Bar Category Performance
            const ctxPerf = document.getElementById('chart-performance').getContext('2d');
            perfChartInstance = new Chart(ctxPerf, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Tiempo Promedio (s)',
                        data: [],
                        backgroundColor: '#6366f1',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        function updateCharts() {
            if (!statusChartInstance || !perfChartInstance) return;

            // Update Doughnut Chart
            const acceptableCount = evaluations.filter(e => calculateStatus(e).isAcceptable).length;
            const unacceptableCount = evaluations.length - acceptableCount;

            statusChartInstance.data.datasets[0].data = [acceptableCount, unacceptableCount];
            statusChartInstance.update();

            // Update Bar Chart (Grouping by Category)
            const catMap = {};
            evaluations.forEach(e => {
                if (!catMap[e.category]) catMap[e.category] = { totalTime: 0, count: 0 };
                catMap[e.category].totalTime += e.time;
                catMap[e.category].count += 1;
            });

            const labels = Object.keys(catMap).map(cat => cat.split(' / ')[0]);
            const averages = Object.keys(catMap).map(cat => (catMap[cat].totalTime / catMap[cat].count).toFixed(1));

            perfChartInstance.data.labels = labels;
            perfChartInstance.data.datasets[0].data = averages;
            perfChartInstance.update();
        }

        // --- Funciones Auxiliares ---
        function deleteEvaluation(index) {
            evaluations.splice(index, 1);
            renderAll();
        }

        function clearEvaluations() {
            evaluations = [];
            renderAll();
        }

        function seedDefaultData() {
            evaluations = [...initialData];
            renderAll();
        }

        function escapeHtml(str) {
            return str.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#039;");
        }

        async function exportToPDF() {
            const { jsPDF } = window.jspdf;
            const container = document.getElementById('report-container');

            // Notificación visual de carga
            const btn = event.currentTarget;
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...`;
            btn.disabled = true;

            try {
                // Configurar canvas para captura
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    ignoreElements: (element) => element.classList.contains('no-print')
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210; // Ancho A4 en mm
                const pageHeight = 295; // Alto A4 en mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save(`Informe_Usabilidad_UX_${new Date().toISOString().slice(0,10)}.pdf`);
            } catch (err) {
                console.error("Error generando PDF: ", err);
                // Fallback para imprimir pantalla completa si falla canvas
                window.print();
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }