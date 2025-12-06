        // Variables globales
        let allSlots = {};
        let selectedDate = null;
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        // Mostrar secciones
        function showSection(id) {
            document.getElementById('welcome-msg').style.display = 'none';
            ['productos', 'agenda', 'servicios', 'caja'].forEach(sec => {
                document.getElementById('section-' + sec).classList.add('hidden');
            });
            document.getElementById('section-' + id).classList.remove('hidden');

            if (id === 'agenda') {
                loadCalendar();
            }
        }

        // Productos
        function editProduct(id, name, description, price, stock, image_url) {
            document.getElementById('product-id').value = id;
            document.getElementById('product-name').value = name;
            document.getElementById('product-description').value = description || '';
            document.getElementById('product-price').value = price;
            document.getElementById('product-stock').value = stock;
            document.getElementById('product-image').value = image_url || '';
            document.getElementById('product-method').value = 'PUT';
            document.getElementById('product-form').action = '/admin/products/' + id;
            document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
        }

        function resetProductForm() {
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            document.getElementById('product-method').value = 'POST';
            document.getElementById('product-form').action = '/admin/products';
        }

        // Calendario - Variables
        let currentViewMonth = new Date().getMonth();
        let currentViewYear = new Date().getFullYear();

        async function loadCalendar() {
            try {
                // Cargar datos de todo el año
                const today = new Date();
                const startDate = new Date(today.getFullYear() - 1, 0, 1);
                const endDate = new Date(today.getFullYear() + 1, 11, 31);

                const startStr = startDate.toISOString().split('T')[0];
                const endStr = endDate.toISOString().split('T')[0];

                const response = await fetch(`/admin/availability/slots?start_date=${startStr}&end_date=${endStr}`);
                const slots = await response.json();

                // Agrupar slots por fecha
                allSlots = {};
                slots.forEach(slot => {
                    // Fix: Asegurar formato YYYY-MM-DD ignorando la hora si viene en formato ISO
                    const dateKey = slot.date.split('T')[0];
                    if (!allSlots[dateKey]) {
                        allSlots[dateKey] = [];
                    }
                    allSlots[dateKey].push(slot);
                });

                // Iniciar en el mes actual
                currentViewMonth = new Date().getMonth();
                currentViewYear = new Date().getFullYear();
                renderCalendar();
            } catch (error) {
                console.error('Error loading calendar:', error);
            }
        }

        function renderCalendar() {
            const container = document.getElementById('calendar-days');
            container.innerHTML = '';

            // Actualizar título del mes
            document.getElementById('current-month-title').textContent =
                `${monthNames[currentViewMonth]} ${currentViewYear}`;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const firstDay = new Date(currentViewYear, currentViewMonth, 1).getDay();
            const daysInMonth = new Date(currentViewYear, currentViewMonth + 1, 0).getDate();

            // Espacios en blanco antes del primer día
            for (let i = 0; i < firstDay; i++) {
                const emptyDiv = document.createElement('div');
                container.appendChild(emptyDiv);
            }

            // Días del mes
            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(currentViewYear, currentViewMonth, day);
                dateObj.setHours(0, 0, 0, 0);
                const dateStr = `${currentViewYear}-${String(currentViewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.textContent = day;

                const slots = allSlots[dateStr] || [];
                const hasSlots = slots.length > 0;
                const isPast = dateObj < today;
                const isToday = dateObj.getTime() === today.getTime();
                const isFuture = dateObj > today;

                // Determinar disponibilidad
                let hasAvailableSlots = false;
                let allSlotsFull = false;

                if (hasSlots && isFuture) {
                    hasAvailableSlots = slots.some(slot => slot.is_available);
                    allSlotsFull = slots.every(slot => !slot.is_available);
                }

                // Aplicar colores
                if (isToday) {
                    dayDiv.classList.add('today');
                } else if (isPast) {
                    // Verificar si hubo reservas en algún slot del día
                    const hadBookings = slots.some(slot => slot.bookedCount > 0);
                    
                    if (hadBookings) {
                        dayDiv.classList.add('past-with-slots');
                    } else {
                        dayDiv.classList.add('past-no-slots');
                    }
                } else if (isFuture) {
                    if (!hasSlots) {
                        dayDiv.classList.add('future-no-slots');
                    } else if (allSlotsFull) {
                        dayDiv.classList.add('future-full');
                    } else if (hasAvailableSlots) {
                        dayDiv.classList.add('future-available');
                    }
                }

                // Click handler
                dayDiv.onclick = () => openDayPanel(dateStr);

                container.appendChild(dayDiv);
            }
        }

        function previousMonth() {
            currentViewMonth--;
            if (currentViewMonth < 0) {
                currentViewMonth = 11;
                currentViewYear--;
            }
            renderCalendar();
        }

        function nextMonth() {
            currentViewMonth++;
            if (currentViewMonth > 11) {
                currentViewMonth = 0;
                currentViewYear++;
            }
            renderCalendar();
        }

        // Panel del día
        function openDayPanel(dateStr) {
            selectedDate = dateStr;
            document.getElementById('selected-date-title').textContent = `Horarios del ${dateStr}`;
            document.getElementById('day-slots-panel').classList.remove('hidden');
            loadDaySlots(dateStr);
        }

        function closeDayPanel() {
            document.getElementById('day-slots-panel').classList.add('hidden');
            selectedDate = null;
        }

        function loadDaySlots(dateStr) {
            const container = document.getElementById('day-slots-list');
            const slots = allSlots[dateStr] || [];

            if (slots.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-sm">No hay horarios configurados para este día</p>';
                return;
            }

            container.innerHTML = slots.map(slot => {
                const appointmentsHtml = slot.appointments_list && slot.appointments_list.length > 0 
                    ? `<div class="mt-2 border-t pt-2">
                        <p class="text-xs font-bold text-gray-500 mb-1">Reservas:</p>
                        ${slot.appointments_list.map(app => `
                            <div class="flex justify-between items-center text-sm bg-gray-50 p-1 rounded mb-1">
                                <div>
                                    <span class="font-medium">${app.client_name}</span>
                                    <span class="text-xs text-gray-400 ml-1">(${app.status})</span>
                                </div>
                                <div class="text-xs text-gray-500">
                                    ${app.location_type === 'domicilio' ? '<i class="fas fa-home text-blue-500" title="Domicilio"></i>' : '<i class="fas fa-store text-pink-500" title="Local"></i>'}
                                </div>
                            </div>
                        `).join('')}
                       </div>`
                    : '';

                return `
                <div class="flex flex-col bg-white p-3 rounded border gap-2">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div class="flex-1">
                            <div class="font-bold text-lg">${slot.time.substring(0, 5)}</div>
                            <div class="text-sm text-gray-500">Max: ${slot.max_appointments} turnos</div>
                            <span class="text-xs ${slot.is_available ? 'text-green-600' : 'text-red-600'}">
                                ${slot.is_available ? 'Disponible' : 'Bloqueado'}
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="toggleSlotAvailability(${slot.id})" class="text-sm px-3 py-2 rounded ${slot.is_available ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'} flex-1 md:flex-none">
                                ${slot.is_available ? 'Bloquear' : 'Habilitar'}
                            </button>
                            <button onclick="deleteSlot(${slot.id})" class="text-red-500 hover:text-red-700 px-3">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${appointmentsHtml}
                </div>
            `}).join('');
        }

        async function addTimeSlot() {
            const time = document.getElementById('new-time-input').value;
            const maxAppointments = document.getElementById('new-max-appointments').value;

            if (!time || !selectedDate) return;

            try {
                const response = await fetch('/admin/availability/slots', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({
                        date: selectedDate,
                        time: time,
                        max_appointments: maxAppointments,
                        is_available: true
                    })
                });

                if (response.ok) {
                    await loadCalendar();
                    loadDaySlots(selectedDate);
                    document.getElementById('new-time-input').value = '';
                }
            } catch (error) {
                console.error('Error adding slot:', error);
            }
        }

        async function toggleSlotAvailability(slotId) {
            const slot = Object.values(allSlots).flat().find(s => s.id === slotId);
            if (!slot) return;

            try {
                const response = await fetch(`/admin/availability/slots/${slotId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({
                        is_available: !slot.is_available
                    })
                });

                if (response.ok) {
                    await loadCalendar();
                    loadDaySlots(selectedDate);
                }
            } catch (error) {
                console.error('Error toggling slot:', error);
            }
        }

        async function deleteSlot(slotId) {
            if (!confirm('¿Eliminar este horario?')) return;

            try {
                const response = await fetch(`/admin/availability/slots/${slotId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                if (response.ok) {
                    await loadCalendar();
                    loadDaySlots(selectedDate);
                }
            } catch (error) {
                console.error('Error deleting slot:', error);
            }
        }

        // Modal generación masiva
        function openBulkModal() {
            document.getElementById('bulk-modal').classList.remove('hidden');
        }

        function closeBulkModal() {
            document.getElementById('bulk-modal').classList.add('hidden');
        }

        function addTimeInputToBulk() {
            const container = document.getElementById('times-container');
            const div = document.createElement('div');
            div.className = 'flex gap-2';
            div.innerHTML = `
                <input type="time" name="times[]" class="p-2 border rounded flex-1">
                <button type="button" onclick="removeTimeInput(this)" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        }

        function removeTimeInput(btn) {
            btn.parentElement.remove();
        }

        document.getElementById('bulk-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const daysCheckboxes = document.querySelectorAll('input[name="days_of_week"]:checked');
            const daysOfWeek = Array.from(daysCheckboxes).map(cb => parseInt(cb.value));

            const timesInputs = document.querySelectorAll('input[name="times[]"]');
            const times = Array.from(timesInputs).map(input => input.value).filter(t => t);

            const data = {
                start_date: document.getElementById('bulk-start-date').value,
                end_date: document.getElementById('bulk-end-date').value,
                days_of_week: daysOfWeek,
                times: times,
                max_appointments: document.getElementById('bulk-max-appointments').value
            };

            try {
                const response = await fetch('/admin/availability/slots/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    closeBulkModal();
                    await loadCalendar();
                    showToast('Horarios generados correctamente', 'success');
                }
            } catch (error) {
                console.error('Error generating bulk slots:', error);
                showToast('Error al generar horarios', 'error');
            }
        });

        // Toast Function
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
            const iconClass = type === 'success' ? 'toast-icon-success' : 'toast-icon-error';
            const borderClass = type === 'success' ? 'toast-success' : 'toast-error';
            
            toast.className = `toast ${borderClass}`;
            toast.innerHTML = `
                <i class="fas ${icon} ${iconClass} text-xl"></i>
                <div class="flex-1">
                    <p class="font-bold text-gray-800">${type === 'success' ? '¡Éxito!' : 'Error'}</p>
                    <p class="text-sm text-gray-600">${message}</p>
                </div>
                <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(toast);
            
            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
            
            // Auto remove
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
