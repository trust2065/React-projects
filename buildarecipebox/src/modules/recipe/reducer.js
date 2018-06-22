import _ from 'lodash';
import axios from 'axios';
import {
  createAction,
  createActions,
  handleActions,
  combineActions
} from 'redux-actions';
import { combineReducers } from 'redux';
import database from '../core/Firebase';
import dotProp from 'dot-prop-immutable';
import FirebaseActions from '../core/FirebaseAction';
import moment from 'moment';
import reduceReducers from 'reduce-reducers';

export const imgUploaderAdd = createAction(
  'IMGUPLOADER_ADD',
  (type, historyId) => ({ type, historyId })
);
export const imageDelete = createAction(
  'IMG_DELETE',
  (type, no, historyId) => ({
    type,
    no,
    historyId
  })
);

const {
  imgUploadFulfill,
  imgUploadPending,
  imgUploadReject,
  imgUploadCancel
} = createActions(
  {
    IMG_UPLOAD_FULFILL: (url, type, no, historyId) => ({
      url,
      type,
      no,
      historyId
    }),
    IMG_UPLOAD_PENDING: (type, no, historyId) => ({
      type,
      no,
      historyId
    })
  },
  'IMG_UPLOAD_REJECT',
  'IMG_UPLOAD_CANCEL'
);

export function imgUpload(e, type = 'recipe', no = 0, historyId) {
  return dispatch => {
    dispatch(imgUploadPending(type, no, historyId));
    const files = e.target.files;
    const dataMaxSize = e.target.attributes.getNamedItem('data-max-size').value;

    if (files.length) {
      const file = files[0];
      if (file.size > dataMaxSize * 1024) {
        console.log('Please select a smaller file');
        return false;
      }
      const apiUrl = 'https://api.imgur.com/3/image';
      const formData = new FormData();
      formData.append('image', file);

      axios
        .post(apiUrl, formData, {
          headers: {
            Authorization: 'Bearer 260fc95d35018764d37bf918a786974790e9dcbb'
          }
        })
        .then(response => {
          const imgURL = response.data.data.link;
          dispatch(imgUploadFulfill(imgURL, type, no, historyId));
        })
        .catch(error => {
          dispatch(imgUploadReject());
        });
    } else {
      dispatch(imgUploadCancel());
    }
  };
}

export const {
  ingredientAdd,
  ingredientChange,
  ingredientDelete
} = createActions(
  {
    INGREDIENT_CHANGE: (order, changedText) => ({ order, changedText })
  },
  'INGREDIENT_ADD',
  'INGREDIENT_DELETE'
);

export const nameChange = createAction('NAME_CHANGE');

export const { stepAdd, stepChange, stepDelete } = createActions(
  {
    STEP_CHANGE: (order, changedText) => ({ order, changedText })
  },
  'STEP_ADD',
  'STEP_DELETE'
);

export const {
  recipeFetchPending,
  recipeFetchFulfill,
  recipeFetchFulfillNewrecipe,
  recipeFetctReject
} = createActions(
  {
    RECIPE_FETCH_FULFILL: (recipe, recipeId) => ({ recipe, recipeId })
  },
  'RECIPE_FETCH_PENDING',
  'RECIPE_FETCH_REJECT',
  'RECIPE_FETCH_FULFILL_NEWRECIPE'
);

export function recipeFetch(recipeId) {
  return dispatch => {
    dispatch(recipeFetchPending());
    const recipeRef = database.ref(`recipe/${recipeId}`);

    return recipeRef.once('value').then(
      function(snapshot) {
        let recipe = snapshot.val();
        // console.log('recipe');
        // console.log(recipe);
        if (recipe) {
          dispatch(recipeFetchFulfill(recipe, recipeId));
        } else {
          // get last id
          let lastId = 0;
          FirebaseActions.getList(snapshot => {
            snapshot.forEach(function(childSnapshot) {
              let key = childSnapshot.key;
              if (parseInt(key, 10) > parseInt(lastId, 10)) {
                lastId = key;
              }
            });
            // console.log(`lastId: ${lastId}`);
            // set recipeId
            const newRecipeId = parseInt(lastId, 10) + 1;
            dispatch(recipeFetchFulfillNewrecipe(newRecipeId));
          });
        }
      },
      function(err) {
        dispatch(recipeFetctReject(err));
      }
    );
  };
}

const {
  recipeUpdatePending,
  recipeUpdateFulfill,
  recipeUpdateReject
} = createActions(
  'RECIPE_UPDATE_PENDING',
  'RECIPE_UPDATE_FULFILL',
  'RECIPE_UPDATE_REJECT'
);

export function recipeUpdate(recipeId, name, ingredients, steps, imgURL = '') {
  return dispatch => {
    dispatch(recipeUpdatePending());
    database
      .ref('recipe/' + recipeId)
      .update({
        name: name,
        ingredients: ingredients,
        steps: steps,
        imgURL: imgURL
      })
      .then(() => {
        dispatch(recipeUpdateFulfill());
      })
      .catch(function(err) {
        dispatch(recipeUpdateReject());
      });
  };
}

export const reset = createAction('RESET');

const defaultState = {
  data: {
    recipeId: 0,
    name: '',
    ingredients: [],
    steps: [],
    imgURL: '',
    histories: [],
    historyId: 0
  },
  meta: {
    fetching: false,
    fetched: false,
    updating: false,
    updated: false,
    uploading: false,
    error: ''
  }
};

const nameChangeHandler = (state, action) =>
  dotProp.set(state, 'name', action.payload);

const stepChangeHandler = (state, action) => {
  const changedText = action.payload.changedText;
  const order = action.payload.order;
  return dotProp.set(state, `steps.${order}.desp`, changedText);
};

const stepAddHandler = (state, action) => {
  return dotProp.set(state, 'steps', [...state.steps, { desp: '' }]);
};

const stepDeleteHandler = (state, action) => {
  const targetIndex = action.payload;
  return dotProp.delete(state, `steps.${targetIndex}`);
};

const stepHandlers = {
  [stepChange]: stepChangeHandler,
  [stepAdd]: stepAddHandler,
  [stepDelete]: stepDeleteHandler
};

const ingredientChangeHandler = (state, action) => {
  const changedText = action.payload.changedText;
  const order = action.payload.order;
  return dotProp.set(state, `ingredients.${order}.name`, changedText);
};

const ingredientAddHandler = (state, action) => {
  return dotProp.set(state, 'ingredients', [
    ...state.ingredients,
    { name: '' }
  ]);
};

const ingredientDeleteHandler = (state, action) => {
  const targetIndex = action.payload;
  return dotProp.delete(state, `ingredients.${targetIndex}`);
};

const ingredientChangeHandlers = {
  [ingredientChange]: ingredientChangeHandler,
  [ingredientAdd]: ingredientAddHandler,
  [ingredientDelete]: ingredientDeleteHandler
};

const imgUploadPendingHandler = (state, action) => {
  const type = action.payload.type;

  if (type === 'History') {
    const no = action.payload.no;
    const historyId = action.payload.historyId;
    const histories = state.histories;
    const historyIndex = _.findIndex(histories, ['id', historyId]);

    state = dotProp.set(state, `histories.${historyIndex}.uploadingImageNos`, {
      [no]: true
    });
  }
  return state;
};

const imgUploadFulfillHandler = (state, action) => {
  const { type, no, url } = action.payload;

  if (type === 'History') {
    if (no) {
      const { historyId } = action.payload;
      const histories = state.histories;
      const historyIndex = _.findIndex(histories, ['id', historyId]);
      const history = histories[historyIndex];
      const images = history.images;
      const imageIndex = _.findIndex(images, ['no', no]);

      state = dotProp.set(
        state,
        `histories.${historyIndex}.images.${imageIndex}.url`,
        url
      );
      state = dotProp.delete(
        state,
        `histories.${historyIndex}.uploadingImageNos.${no}`
      );

      return state;
    }
  }
  return {
    ...state,
    uploading: false,
    imgURL: url
  };
};

const imageHandlers = {
  [imgUploadPending]: imgUploadPendingHandler,
  [imgUploadFulfill]: imgUploadFulfillHandler,
  [combineActions(imgUploadReject, imgUploadCancel)](state, action) {
    return dotProp.set(state, 'uploading', false);
  }
};

const dataReducer = handleActions(
  {
    [nameChange]: nameChangeHandler,
    ...stepHandlers,
    ...ingredientChangeHandlers,
    [recipeFetchFulfillNewrecipe]: (state, action) => {
      const recipeId = action.payload;
      return dotProp.set(defaultState, 'recipeId', recipeId);
    },
    [recipeFetchFulfill]: (state, action) => {
      const recipe = action.payload.recipe;
      const recipeId = action.payload.recipeId;
      return {
        ...state,
        imgURL: recipe.imgURL,
        ingredients: recipe.ingredients,
        name: recipe.name,
        recipeId: recipeId,
        steps: recipe.steps,
        histories: recipe.histories
      };
    },
    ...imageHandlers
  },
  defaultState.data
);

const metaReducer = handleActions(
  {
    [recipeFetchPending]: state => dotProp.set(state, 'fetching', true),
    [recipeUpdatePending]: (state, action) =>
      dotProp.set(state, 'updating', true),
    [recipeUpdateFulfill]: (state, action) => ({
      ...state,
      updating: false,
      updated: true
    }),
    [recipeUpdateReject]: (state, action) => {
      const error = action.payload;
      return {
        ...state,
        error: error,
        fetching: false
      };
    },
    [reset]: (state, action) => {
      return dotProp.set(state, 'updated', false);
    },
    [recipeFetchFulfill]: (state, action) => {
      return {
        ...state,
        fetching: false,
        fetched: true
      };
    },
    [recipeFetctReject]: (state, action) => {
      const error = action.payload;
      return {
        ...state,
        fetching: false,
        error: error
      };
    }
  },
  defaultState.meta
);

const crossSliceReducer = handleActions({}, defaultState);

const recipeRedcuer = combineReducers({
  data: dataReducer,
  meta: metaReducer
});

const reducer = reduceReducers(crossSliceReducer, recipeRedcuer);

export default reducer;
