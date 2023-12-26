import { API_URL, API_KEY, RESULTS_PER_PAGE } from './config';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = (data) => {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    imageUrl: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async (id) => {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);

    state.recipe.bookmarked = state.bookmarks.some(
      (bookmark) => bookmark.id === id
    );
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async (query) => {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}/?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map((recipe) => ({
      id: recipe.id,
      imageUrl: recipe.image_url,
      publisher: recipe.publisher,
      title: recipe.title,
      ...(recipe.key && { key: recipe.key }),
    }));
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = (page = 1) => {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = (newServings) => {
  state.recipe.ingredients.forEach((ingredient) => {
    ingredient.quantity =
      (ingredient.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = () => {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = (recipe) => {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = (id) => {
  const index = state.bookmarks.findIndex((element) => element.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = () => {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

export const uploadRecipe = async (newRecipe) => {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map((ingredient) => {
        const ingredientArr = ingredient[1].trim().split(',');

        if (ingredientArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );

        const [quantity, unit, description] = ingredientArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
