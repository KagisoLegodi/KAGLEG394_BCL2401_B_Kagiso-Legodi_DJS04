// Importing necessary data and constants from data.js file
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
import './web components/book-preview.js';
import './web components/book-list.js';
import './web components/theme-switch.js';
import './web components/overlay-setting.js';

// Initialize page number and matches array
let page = 1;
let matches = books;

// Function to get DOM elements
const getElement = (selector) => document.querySelector(selector);

// Function to create and append book previews
const createBookPreviews = (books, container) => {
  const fragment = document.createDocumentFragment();
  books.forEach(({ author, id, image, title }) => {
    const element = document.createElement('book-preview');
    element.setAttribute('id', id);
    element.setAttribute('image', image);
    element.setAttribute('title', title);
    element.setAttribute('author', authors[author]);
    fragment.appendChild(element);
  });
  container.appendChild(fragment);
};

// Function to create and append options to a select element
const createOptions = (options, defaultOption, container) => {
  const fragment = document.createDocumentFragment();
  const firstOption = document.createElement('option');
  firstOption.value = 'any';
  firstOption.innerText = defaultOption;
  fragment.appendChild(firstOption);
  Object.entries(options).forEach(([id, name]) => {
    const element = document.createElement('option');
    element.value = id;
    element.innerText = name;
    fragment.appendChild(element);
  });
  container.appendChild(fragment);
};

// Function to apply theme
const applyTheme = (theme) => {
  const isNight = theme === 'night';
  document.documentElement.style.setProperty(
    '--color-dark',
    isNight ? '255, 255, 255' : '10, 10, 20'
  );
  document.documentElement.style.setProperty(
    '--color-light',
    isNight ? '10, 10, 20' : '255, 255, 255'
  );
};

// Function to update "Show more" button text and state
const updateShowMoreButton = () => {
  const remainingBooks = matches.length - page * BOOKS_PER_PAGE;
  const button = getElement('[data-list-button]');
  button.innerText = `Show more (${remainingBooks})`;
  button.disabled = remainingBooks <= 0;
  button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining">(${
      remainingBooks > 0 ? remainingBooks : 0
    })</span>
  `;
};

// Event listener functions
const closeOverlay = (selector) => {
  getElement(selector).open = false;
};

const openOverlay = (selector, focusSelector = null) => {
  getElement(selector).open = true;
  if (focusSelector) getElement(focusSelector).focus();
};

const applySearchFilters = (filters) => {
  return books.filter((book) => {
    const titleMatch =
      filters.title.trim() === '' ||
      book.title.toLowerCase().includes(filters.title.toLowerCase());
    const authorMatch =
      filters.author === 'any' || book.author === filters.author;
    const genreMatch =
      filters.genre === 'any' || book.genres.includes(filters.genre);
    return titleMatch && authorMatch && genreMatch;
  });
};

// Event listeners
getElement('[data-search-cancel]').addEventListener('click', () =>
  closeOverlay('[data-search-overlay]')
);
getElement('[data-settings-cancel]').addEventListener('click', () =>
  closeOverlay('[data-settings-overlay]')
);
getElement('[data-header-search]').addEventListener('click', () =>
  openOverlay('[data-search-overlay]', '[data-search-title]')
);
getElement('[data-header-settings]').addEventListener('click', () =>
  openOverlay('[data-settings-overlay]')
);
getElement('[data-list-close]').addEventListener('click', () =>
  closeOverlay('[data-list-active]')
);

getElement('[data-settings-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme } = Object.fromEntries(formData);
  applyTheme(theme);
  closeOverlay('[data-settings-overlay]');
});

getElement('[data-search-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  matches = applySearchFilters(filters);
  page = 1;
  getElement('[data-list-message]').classList.toggle(
    'list__message_show',
    matches.length < 1
  );
  getElement('[data-list-items]').innerHTML = '';
  createBookPreviews(
    matches.slice(0, BOOKS_PER_PAGE),
    getElement('[data-list-items]')
  );
  updateShowMoreButton();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeOverlay('[data-search-overlay]');
});

getElement('[data-list-button]').addEventListener('click', () => {
  createBookPreviews(
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE),
    getElement('[data-list-items]')
  );
  page += 1;
  updateShowMoreButton();
});

getElement('[data-list-items]').addEventListener('book-preview-click', (event) => {
  const bookId = event.detail.id;
  const book = books.find((book) => book.id === bookId);
  if (book) {
    getElement('[data-list-active]').open = true;
    getElement('[data-list-blur]').src = book.image;
    getElement('[data-list-image]').src = book.image;
    getElement('[data-list-title]').innerText = book.title;
    getElement('[data-list-subtitle]').innerText = `${
      authors[book.author]
    } (${new Date(book.published).getFullYear()})`;
    getElement('[data-list-description]').innerText = book.description;
  }
});

// Initial setup
createOptions(genres, 'All Genres', getElement('[data-search-genres]'));
createOptions(authors, 'All Authors', getElement('[data-search-authors]'));
applyTheme(
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
);
createBookPreviews(
  matches.slice(0, BOOKS_PER_PAGE),
  getElement('[data-list-items]')
);
updateShowMoreButton();
