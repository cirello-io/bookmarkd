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
  folder: null,
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
      if (!state.folder) {
        ret.folder = folderByName('bookmarks')
        if (folderByName('pending').filter(ret.bookmarks).length > 0) {
          ret.folder = folderByName('pending')
        }
      }
      ret.filteredBookmarks = ret.folder.filter(ret.bookmarks)
      return ret
    }
    case 'FUZZY_SEARCH': {
      return {
        ...state,
        fuzzySearch,
        filteredBookmarks: fuzzySearch(
          state.folder.filter(state.bookmarks),
          action.fuzzySearch.toLowerCase()
        )
      }
    }
    case 'BOOKMARK_ADDED': {
      let bookmarks = state.bookmarks.slice()
      bookmarks.unshift(action.bookmark)
      return {
        ...state,
        bookmark: action.bookmark,
        bookmarks,
        filteredBookmarks: fuzzySearch(
          state.folder.filter(bookmarks),
          state.fuzzySearch.toLowerCase()
        )
      }
    }
    case 'BOOKMARK_UPDATED': {
      var bookmarks = state.bookmarks.slice().map((v) => {
        return v.id === action.bookmark.id ? action.bookmark : v
      })
      var filteredBookmarks = state.filteredBookmarks.slice().map((v) => {
        return v.id === action.bookmark.id ? action.bookmark : v
      })
      return {
        ...state,
        bookmark: action.bookmark,
        bookmarks,
        filteredBookmarks: fuzzySearch(
          state.folder.filter(filteredBookmarks),
          state.fuzzySearch.toLowerCase()
        )
      }
    }
    case 'BOOKMARK_DELETED': {
      return {
        ...state,
        bookmarks: state.bookmarks.slice().filter((v) => v.id !== action.id),
        filteredBookmarks: state.folder.filter(state.filteredBookmarks.slice().filter((v) => v.id !== action.id))
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

function fuzzySearch(list, pattern) {
  if (!pattern) {
    return list
  }
  let ret = list.filter((v) => {
    return fuzzyMatch(v.url.toLowerCase(), pattern) ||
      fuzzyMatch(v.title.toLowerCase(), pattern)
  })
  ret.sort((a, b) => {
    const aRank =
      a.url.toLowerCase().includes(pattern) ||
      a.title.toLowerCase().includes(pattern)
    const bRank =
      b.url.toLowerCase().includes(pattern) ||
      b.title.toLowerCase().includes(pattern)
    if (aRank === bRank) {
      return 0
    }
    if (aRank) {
      return -1
    }
    return 1
  })
  return ret
}

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