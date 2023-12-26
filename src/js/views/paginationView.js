import View from './view';
import icons from '../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');
  _currentPage;

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  _generateNextPageMarkup() {
    return `
      <button data-goto="${
        this._currentPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${this._currentPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
    `;
  }

  _generatePreviousPageMarkup() {
    return `
      <button data-goto="${
        this._currentPage - 1
      }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${this._currentPage - 1}</span>
      </button>
    `;
  }

  _generateMarkupButtons() {
    if (this._currentPage === 1 && this._numPage > 1)
      return this._generateNextPageMarkup();

    if (this._currentPage === this._numPage && this._numPage > 1)
      return this._generatePreviousPageMarkup();

    if (this._currentPage < this._numPage)
      return `${this._generatePreviousPageMarkup()}${this._generateNextPageMarkup()}`;

    return '';
  }

  _generateMarkup() {
    this._currentPage = this._data.page;
    this._numPage = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    return this._generateMarkupButtons();
  }
}

export default new PaginationView();
