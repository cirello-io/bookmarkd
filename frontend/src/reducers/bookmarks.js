// Copyright 2019 github.com/ucirello
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { folders, folderByName } from '../helpers/folders'

const initialState = {
  loaded: false,
  bookmarks: [],
  filteredBookmarks: [],
  bookmark: { id: 0, title: '', url: '' },
  folder: folderByName('bookmarks'),
  fuzzySearch: ''
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SELECT_BOOKMARK_FOLDER':
      return {
        ...state,
        folder: folders[action.selectedIndex],
        filteredBookmarks: folders[action.selectedIndex].filter(state.bookmarks)
      }
    case 'INITIAL_LOAD_COMPLETE': {
      let ret = {
        ...state,
        loaded: true,
        bookmarks: (
          state.loaded
            ? []
            : state.bookmarks.slice()
        ).filter((v) => v.id !== state.bookmark.id).concat(action.bookmarks)
      }
      ret.filteredBookmarks = state.folder.filter(ret.bookmarks)
      return ret
    }
    case 'FUZZY_SEARCH': {
      if (action.fuzzySearch === '') {
        return {
          ...state,
          filteredBookmarks: state.folder.filter(state.bookmarks)
        }
      }
      let fuzzySearch = action.fuzzySearch.toLowerCase()
      return {
        ...state,
        fuzzySearch,
        filteredBookmarks: state.folder.filter(state.bookmarks).filter((v) => {
          return fuzzyMatch(v.url.toLowerCase(), fuzzySearch) ||
            fuzzyMatch(v.title.toLowerCase(), fuzzySearch)
        })
      }
    }
    case 'BOOKMARK_ADDED': {
      let bookmarks = state.bookmarks.slice()
      bookmarks.unshift(action.bookmark)
      let fuzzySearch = state.fuzzySearch.toLowerCase()
      return {
        ...state,
        bookmark: action.bookmark,
        bookmarks,
        filteredBookmarks: state.folder.filter(bookmarks).filter((v) => {
          return fuzzyMatch(v.url.toLowerCase(), fuzzySearch) ||
            fuzzyMatch(v.title.toLowerCase(), fuzzySearch)
        })
      }
    }
    case 'BOOKMARK_UPDATED': {
      var bookmarks = state.bookmarks.slice().map((v) => {
        if (v.id === action.bookmark.id) {
          return action.bookmark
        }
        return v
      })
      var filteredBookmarks = state.filteredBookmarks.slice().map((v) => {
        if (v.id === action.bookmark.id) {
          return action.bookmark
        }
        return v
      })
      let fuzzySearch = state.fuzzySearch.toLowerCase()
      return {
        ...state,
        bookmark: action.bookmark,
        bookmarks,
        filteredBookmarks: state.folder.filter(filteredBookmarks).filter((v) => {
          return fuzzyMatch(v.url.toLowerCase(), fuzzySearch) ||
            fuzzyMatch(v.title.toLowerCase(), fuzzySearch)
        })
      }
    }
    case 'BOOKMARK_DELETED': {
      return {
        ...state,
        bookmarks: state.bookmarks.slice().filter((v) => v.id !== action.id),
        filteredBookmarks: state.folder.filter(state.filteredBookmarks.slice().filter((v) => v.id !== action.id)),
      }
    }
    case 'BOOKMARK':
      return {
        ...state,
        bookmark: action.bookmark
      }
    case 'RESET_BOOKMARK':
      return {
        ...state,
        bookmark: { id: 0, title: '', url: '' }
      }
    default:
      return state
  }
}

export default reducer

// distilled from https://gist.github.com/mdwheele/7171422
function fuzzyMatch(haystack, needle) {
  var caret = 0
  for (var i = 0; i < needle.length; i++) {
    var c = needle[i]
    if (c === ' ') {
      continue
    }
    caret = haystack.indexOf(c, caret)
    if (caret === -1) {
      return false
    }
    caret++
  }
  return true
}