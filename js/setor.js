document.addEventListener('DOMContentLoaded', () => {
  initSearchAndFilters();
  initCalculator();
  initChecklist();
});

/**
  * Busca e Filtros Dinâmicos por Categoria
  */
function initSearchAndFilters() {
  const searchInput = document.querySelector('#setor-search-input');
  const clearButton = document.querySelector('#setor-search-clear');
  const status = document.querySelector('#setor-search-status');
  const filterTags = document.querySelectorAll('.setor-filter-tag');
  const searchableItems = Array.from(document.querySelectorAll('.setor-searchable'));

  if (!searchInput || searchableItems.length === 0) {
    return;
  }

  let currentCategory = 'all';

  const normalize = (value) => value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const applyFilters = () => {
    const query = normalize(searchInput.value.trim());
    let visibleCount = 0;

    searchableItems.forEach((item) => {
      const content = normalize(`${item.textContent} ${item.dataset.search || ''}`);
      const category = item.dataset.category || 'all';

      const matchesText = !query || content.includes(query);
      const matchesCategory = currentCategory === 'all' || category === currentCategory;

      const isVisible = matchesText && matchesCategory;
      item.classList.toggle('is-hidden', !isVisible);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (status) {
      if (query || currentCategory !== 'all') {
        status.textContent = `${visibleCount} ${visibleCount === 1 ? 'item encontrado' : 'itens encontrados'}.`;
      } else {
        status.textContent = '';
      }
    }
  };

  searchInput.addEventListener('input', applyFilters);

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      currentCategory = 'all';
      filterTags.forEach((tag) => tag.classList.toggle('is-active', tag.dataset.filter === 'all'));
      applyFilters();
      searchInput.focus();
    });
  }

  filterTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      filterTags.forEach((t) => t.classList.remove('is-active'));
      tag.classList.add('is-active');
      currentCategory = tag.dataset.filter;
      applyFilters();
    });
  });
}

/**
  * Calculadora / Simulador de Tempo Hábil de Estágio (Melhoria Sugerida)
  */
function initCalculator() {
  const hoursSelect = document.querySelector('#calc-hours-day');
  const totalSelect = document.querySelector('#calc-total-hours');
  const resultDays = document.querySelector('#calc-res-days');
  const resultWeeks = document.querySelector('#calc-res-weeks');

  if (!hoursSelect || !totalSelect || !resultDays || !resultWeeks) {
    return;
  }

  const calculate = () => {
    const dailyHours = parseFloat(hoursSelect.value) || 6;
    const totalHours = parseFloat(totalSelect.value) || 180;

    const totalDays = Math.ceil(totalHours / dailyHours);
    const totalWeeks = (totalDays / 5).toFixed(1);

    resultDays.textContent = `${totalDays} dias úteis`;
    resultWeeks.textContent = `~ ${totalWeeks} semanas de estágio`;
  };

  hoursSelect.addEventListener('change', calculate);
  totalSelect.addEventListener('change', calculate);
  calculate();
}

/**
  * Checklist Interativo do Estagiário (Melhoria Sugerida com localStorage)
  */
function initChecklist() {
  const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  const fillBar = document.querySelector('#checklist-progress-fill');
  const countText = document.querySelector('#checklist-count-text');

  if (checkboxes.length === 0) {
    return;
  }

  const STORAGE_KEY = 'infohub_estagio_checklist_v1';

  // Carrega estado salvo no localStorage
  const loadSavedState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      checkboxes.forEach((cb) => {
        if (saved[cb.id]) {
          cb.checked = true;
          cb.closest('.checklist-item').classList.add('is-completed');
        }
      });
    } catch (e) {
      // localStorage pode estar desativado em contextos restritos
    }
  };

  const updateProgress = () => {
    const total = checkboxes.length;
    let checkedCount = 0;
    const stateToSave = {};

    checkboxes.forEach((cb) => {
      const item = cb.closest('.checklist-item');
      if (cb.checked) {
        checkedCount += 1;
        item.classList.add('is-completed');
        stateToSave[cb.id] = true;
      } else {
        item.classList.remove('is-completed');
        stateToSave[cb.id] = false;
      }
    });

    const percentage = Math.round((checkedCount / total) * 100);
    if (fillBar) {
      fillBar.style.width = `${percentage}%`;
    }
    if (countText) {
      countText.textContent = `${checkedCount} de ${total} etapas concluídas (${percentage}%)`;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      // Ignore
    }
  };

  loadSavedState();
  updateProgress();

  checkboxes.forEach((cb) => {
    cb.addEventListener('change', updateProgress);
  });
}

