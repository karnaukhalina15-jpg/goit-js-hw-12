import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const searchForm = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more-btn');

let totalPages;
let searchQuery = '';
let currentPage = 1;
const perPage = 15; 

searchForm.addEventListener('submit', handleSearch);
loadMoreBtn.addEventListener('click', handleLoadMore);


async function handleSearch(event) {
  event.preventDefault();


  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  
  currentPage = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, currentPage);

  
    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      hideLoader();
      return;
    }

  
    createGallery(data.hits);
    hideLoader();

  
    const totalPages = Math.ceil(data.totalHits / perPage);
    
    if (currentPage < totalPages) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        title: 'End',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (error) {
    hideLoader();
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
    console.error(error);
  }
}


async function handleLoadMore() {
  currentPage += 1;
  hideLoadMoreButton();
  showLoader(); 

  try {
    const data = await getImagesByQuery(searchQuery, currentPage);


    createGallery(data.hits);
    hideLoader();

    smoothScroll();

    const totalPages = Math.ceil(data.totalHits / perPage);
    if (currentPage >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    hideLoader();
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch more images.',
      position: 'topRight',
    });
    console.error(error);
  }
}


function smoothScroll() {
  const galleryItem = document.querySelector('.gallery-item');
  if (galleryItem) {
    const { height: cardHeight } = galleryItem.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}
