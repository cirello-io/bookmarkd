import AddNewBookmark from '../components/AddNewBookmark';
import React from 'react'
import { connect } from 'react-redux'
import { folderByName } from '../../helpers/folders';

export function PostPage({ history, dispatch }) {
  const url = new URLSearchParams(window.location.search).get('url')
  return <AddNewBookmark
    url={url}
    onSave={() => {
      dispatch({ type: 'SELECT_BOOKMARK_FOLDER', selectedIndex: folderByName('pending').selectedIndex })
      history.push('/')
    }} />
}

function s2p(state) { return {} }

export default connect(s2p, null)(PostPage)