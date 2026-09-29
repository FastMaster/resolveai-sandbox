/**
 * Patients Frontend Application
 * Handles patient search, listing, and detail display
 */

(function () {
  'use strict';

  // ========================================
  // State
  // ========================================
  let allPatients = [];
  let selectedPatientId = null;

  // ========================================
  // DOM Elements
  // ========================================
  const searchInput = document.getElementById('search-input');
  const patientList = document.getElementById('patient-list');
  const noResults = document.getElementById('no-results');
  const patientDetail = document.getElementById('patient-detail');

  // ========================================
  // Utility Functions
  // ========================================

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show/hide element with hidden class
   */
  function toggleHidden(element, hidden) {
    if (hidden) {
      element.classList.add('hidden');
    } else {
      element.classList.remove('hidden');
    }
  }

  /**
   * Format ward/planta for display
   */
  function formatWard(ward) {
    if (!ward) return 'No asignada';
    return `Planta ${ward}`;
  }

  // ========================================
  // API Functions
  // ========================================

  /**
   * Fetch all patients from API
   */
  async function fetchPatients() {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      showError('No se pudieron cargar los pacientes. Intenta recargar la página.');
      return [];
    }
  }

  /**
   * Fetch single patient detail from API
   */
  async function fetchPatientDetail(id) {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Paciente no encontrado');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient detail:', error);
      showError(`No se pudo cargar el detalle del paciente: ${error.message}`);
      return null;
    }
  }

  // ========================================
  // Render Functions
  // ========================================

  /**
   * Render patient list items
   */
  function renderPatientList(patients) {
    patientList.innerHTML = '';

    if (patients.length === 0) {
      toggleHidden(noResults, false);
      return;
    }

    toggleHidden(noResults, true);

    const fragment = document.createDocumentFragment();

    patients.forEach((patient) => {
      const li = document.createElement('li');
      li.className = 'patient-item';
      li.dataset.id = patient.id;
      li.role = 'option';
      li.tabIndex = 0;
      li.setAttribute('aria-selected', patient.id === selectedPatientId);

      // Add click and keyboard handlers
      li.addEventListener('click', () => selectPatient(patient.id));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPatient(patient.id);
        }
      });

      li.innerHTML = `
        <span class="patient-id" aria-hidden="true">#${escapeHtml(String(patient.id))}</span>
        <span class="patient-name">${escapeHtml(patient.name)}</span>
      `;

      fragment.appendChild(li);
    });

    patientList.appendChild(fragment);
  }

  /**
   * Render patient detail panel
   */
  function renderPatientDetail(patient) {
    if (!patient) {
      patientDetail.innerHTML = `
        <p class="detail-placeholder">Selecciona un paciente para ver su información</p>
      `;
      return;
    }

    patientDetail.innerHTML = `
      <dl class="detail-grid">
        <div class="detail-row">
          <dt class="detail-label">ID</dt>
          <dd class="detail-value">${escapeHtml(String(patient.id))}</dd>
        </div>
        <div class="detail-row">
          <dt class="detail-label">Nombre</dt>
          <dd class="detail-value">${escapeHtml(patient.name)}</dd>
        </div>
        <div class="detail-row">
          <dt class="detail-label">Planta</dt>
          <dd class="detail-value">${escapeHtml(formatWard(patient.ward))}</dd>
        </div>
      </dl>
    `;
  }

  /**
   * Show error message in detail panel
   */
  function showError(message) {
    patientDetail.innerHTML = `
      <div class="detail-error" role="alert">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  // ========================================
  // Interaction Handlers
  // ========================================

  /**
   * Select a patient and load their detail
   */
  async function selectPatient(id) {
    // Update selected state in list
    const previousSelected = patientList.querySelector('.patient-item[aria-selected="true"]');
    if (previousSelected) {
      previousSelected.setAttribute('aria-selected', 'false');
      previousSelected.classList.remove('selected');
    }

    const newSelected = patientList.querySelector(`.patient-item[data-id="${id}"]`);
    if (newSelected) {
      newSelected.setAttribute('aria-selected', 'true');
      newSelected.classList.add('selected');
      newSelected.focus();
    }

    selectedPatientId = id;

    // Show loading state
    patientDetail.innerHTML = `
      <div class="detail-loading" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Cargando detalle...</p>
      </div>
    `;

    // Fetch and render detail
    const patient = await fetchPatientDetail(id);
    renderPatientDetail(patient);
  }

  /**
   * Filter patients based on search query
   */
  function filterPatients(query) {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      renderPatientList(allPatients);
      return;
    }

    const filtered = allPatients.filter((patient) =>
      patient.name.toLowerCase().includes(normalizedQuery)
    );

    renderPatientList(filtered);

    // Clear selection if selected patient is no longer visible
    if (selectedPatientId && !filtered.some((p) => p.id === selectedPatientId)) {
      selectedPatientId = null;
      renderPatientDetail(null);
    }
  }

  /**
   * Handle search input
   */
  function handleSearch(event) {
    filterPatients(event.target.value);
  }

  // ========================================
  // Initialization
  // ========================================

  /**
   * Initialize the application
   */
  async function init() {
    // Load patients
    allPatients = await fetchPatients();
    renderPatientList(allPatients);

    // Set up search listener with debounce
    let debounceTimer;
    searchInput.addEventListener('input', (event) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => handleSearch(event), 150);
    });

    // Handle Escape key to clear search
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        filterPatients('');
        searchInput.blur();
      }
    });

    // Announce initial load to screen readers
    if (allPatients.length > 0) {
      const announcement = document.createElement('div');
      announcement.className = 'visually-hidden';
      announcement.setAttribute('aria-live', 'polite');
      announcement.textContent = `Se cargaron ${allPatients.length} pacientes`;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    }
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
