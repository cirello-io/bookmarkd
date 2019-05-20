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