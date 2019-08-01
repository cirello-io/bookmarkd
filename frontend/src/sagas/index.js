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

import { put, takeLatest, takeLeading, all, delay } from 'redux-saga/effects';
import config from '../config'

var cfg = config()

function* initialDataload() {
  const json = yield fetch(cfg.http + '/state', {
    credentials: 'same-origin'
  }).then(response => response.json())
  yield put({ type: 'INITIAL_LOAD_COMPLETE', bookmarks: json });
}

function* deleteBookmark(action) {
  yield fetch(cfg.http + '/deleteBookmark', {
    method: 'POST',
    body: JSON.stringify({ id: action.card.id }),
    credentials: 'same-origin'
  }).then(response => response.json()).catch((e) => {
    console.log('cannot delete bookmark:', e)
  })
}

function* markBookmarkAsRead(action) {
  yield fetch(cfg.http + '/markBookmarkAsRead', {
    method: 'POST',
    body: JSON.stringify({ id: action.id }),
    credentials: 'same-origin'
  }).then(response => response.json()).catch((e) => {
    console.log('cannot mark bookmark as read:', e)
  })
}

function* markBookmarkAsPostpone(action) {
  yield fetch(cfg.http + '/markBookmarkAsPostpone', {
    method: 'POST',
    body: JSON.stringify({ id: action.id }),
    credentials: 'same-origin'
  }).then(response => response.json()).catch((e) => {
    console.log('cannot mark bookmark as postpone:', e)
  })
}

function* addBookmark(action) {
  yield fetch(cfg.http + '/newBookmark', {
    method: 'POST',
    body: JSON.stringify(action.newBookmark),
    credentials: 'same-origin'
  }).then(response => response.json()).catch((e) => {
    console.log('cannot add bookmark:', e)
  })
}

function* loadBookmark(action) {
  yield delay(250)
  const json = yield fetch(cfg.http + '/loadBookmark', {
    method: 'POST',
    body: JSON.stringify({ url: action.url }),
    credentials: 'same-origin'
  }).then(response => response.json())
  yield put({ type: 'BOOKMARK', bookmark: json });
}

function* linkWatcher() {
  yield takeLatest('INITIAL_LOAD_START', initialDataload)
  yield takeLeading('DELETE_BOOKMARK', deleteBookmark)
  yield takeLeading('MARK_BOOKMARK_AS_READ', markBookmarkAsRead)
  yield takeLeading('MARK_BOOKMARK_AS_POSTPONE', markBookmarkAsPostpone)
  yield takeLeading('ADD_BOOKMARK', addBookmark)
  yield takeLatest('LOAD_BOOKMARK', loadBookmark)
}

function* fuzzySearch(action) {
  yield delay(250)
  yield put({ type: 'FUZZY_SEARCH', fuzzySearch: action.fuzzySearch });
}

function* fuzzySearchWatcher() {
  yield takeLatest('TRIGGER_FUZZY_SEARCH', fuzzySearch)
}

export default function* rootSaga() {
  yield all({
    link: linkWatcher(),
    fuzzySearch: fuzzySearchWatcher()
  })
}