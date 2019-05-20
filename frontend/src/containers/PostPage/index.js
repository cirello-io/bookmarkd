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