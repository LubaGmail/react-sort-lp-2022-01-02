import React from 'react';
import './style.css';
import { sortBy } from 'lodash';

const API = 'https://hn.algolia.com/api/v1/search?query=';

// feature Reducer
const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD-DATA':
      return {
        ...state,
        isLoading: true,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: action.payload,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE-ITEM':
      return {
        ...state,
        isLoading: false,
        data: state.data.filter((story) => {
          return (
            story.title?.toLowerCase() !== action.payload?.title?.toLowerCase()
          );
        }),
      };
    default:
      return state;
  }
};

export default function App() {
  // useState
  const [errMsg, setErrMsg] = React.useState('');

  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  // IO functions
  const getStories = () => {
    dispatchStories({
      type: 'LOAD-DATA',
    });
    fetch(API)
      .then((resolve) => resolve.json())
      .then((result) => {
        dispatchStories({
          type: 'FETCH_SUCCESS',
          payload: result.hits,
        });
      })
      .catch((error) => {
        setErrMsg(error.toString());
        dispatchStories({
          type: 'FETCH_ERROR',
        });
      });
  };

  // useEffect
  React.useEffect(() => {
    getStories();
  }, []);

  // other handlers
  const handleRemove = (el) => {
    dispatchStories({
      type: 'REMOVE-ITEM',
      payload: el,
    });
  };

  return (
    <>
      <h3>Sort List</h3>

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : stories.isError ? (
        <p>{errMsg}</p>
      ) : (
        <List list={stories.data} onRemove={handleRemove} />
      )}
    </>
  );
}

const List = ({ list, onRemove }) => {
  // map key to a sortBy lodash function
  const SORTS = {
    NONE: (list) => list,
    TITLE: (list) => sortBy(list, 'title'),
    AUTHOR: (list) => sortBy(list, 'author'),
    POINT: (list) => sortBy(list, 'points').reverse(),
  };

  const [sort, setSort] = React.useState('NONE');
  // console.log(typeof sort, sort)

  // onClick={() => handleSort('TITLE')}
  const handleSort = (sortKey) => {
    setSort(sortKey);
  };
  // extract func by the key from the SORT object
  const sortFunction = SORTS[sort];
  // console.log(sortFunction)

  // apply function to the list
  const sortedList = sortFunction(list);

  return (
    <>
      <table border="1" width="100%">
        <tbody>
          <tr>
            <th>
              <button
                type="button"
                onClick={() => handleSort('TITLE')}
                className="bigblue"
              >
                Title
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => handleSort('AUTHOR')}
                className="bigblue"
              >
                Author
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={() => handleSort('POINT')}
                className="bigblue"
              >
                Points
              </button>
            </th>
            <th align="middle" className="biggrey">
              Action
            </th>
          </tr>
          {sortedList.map((el, index) => (
            <tr key={index}>
              <td>{el.title?.substr(0, 10)}</td>
              <td>{el.author?.substr(0, 10)}</td>
              <td>{el.points}</td>
              <td
                align="middle"
                onClick={() => onRemove(el)}
                style={{ color: 'red', cursor: 'pointer' }}
              >
                X
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
