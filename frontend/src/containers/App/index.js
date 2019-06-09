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

import React from 'react'
import MaterialIcon from '@material/react-material-icon'
import TopAppBar, { TopAppBarFixedAdjust, TopAppBarIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from '@material/react-top-app-bar'
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import HomePage from '../HomePage'
import PostPage from '../PostPage'
import './style.scss'
import LinearProgress from '@material/react-linear-progress';
import { folderByName } from '../../helpers/folders'
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import TextField, { Input } from '@material/react-text-field';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
  }

  handleSelect(selectedIndex) {
    this.props.dispatch({ type: 'SELECT_BOOKMARK_FOLDER', selectedIndex: selectedIndex })
  }

  render() {
    return <div>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection align='start'>
            <TopAppBarTitle>Bookmarks Manager</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection align='end'>
            <TopAppBarTitle>
              <SearchBox />
            </TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust>
        {!this.props.loaded ? <LinearProgress indeterminate /> : null}
        <TabBar activeIndex={this.props.selectedIndex} handleActiveIndexUpdate={this.handleSelect}>
          <Tab> <span className='mdc-tab__text-label'>Bookmarks {/* <span>{this.props.bookmarkCount}</span> */} </span> </Tab>
          <Tab> <span className='mdc-tab__text-label'>Pending {/* <span>{this.props.pendingCount}</span> */} </span> </Tab>
          <Tab> <span className='mdc-tab__text-label'>Duplicated {/* <span>{this.props.duplicatedCount}</span> */} </span> </Tab>
          <Tab> <span className='mdc-tab__text-label'>All {/* <span>{this.props.totalCount}</span> */} </span> </Tab>
        </TabBar>
        <Router>
          <Route exact path='/'> <HomePage /> </Route>
          <Route path='/post' component={PostPage} />
        </Router>
      </TopAppBarFixedAdjust>
    </div>
  }
}

export default withRouter(connect(
  (state) => {
    return {
      loaded: state.bookmarks.loaded,
      selectedIndex: state.bookmarks.loaded ? state.bookmarks.folder.selectedIndex : 0,
      bookmarkCount: state.bookmarks.loaded
        ? folderByName('bookmarks').filter(state.bookmarks.bookmarks).length
        : 0,
      pendingCount: state.bookmarks.loaded
        ? folderByName('pending').filter(state.bookmarks.bookmarks).length > 0
          ? folderByName('pending').filter(state.bookmarks.bookmarks).length
          : ''
        : '',
      totalCount: state.bookmarks.loaded
        ? folderByName('all').filter(state.bookmarks.bookmarks).length
        : 0,
      duplicatedCount: state.bookmarks.loaded
        ? folderByName('duplicated').filter(state.bookmarks.bookmarks).length > 0
          ? folderByName('duplicated').filter(state.bookmarks.bookmarks).length
          : ''
        : ''
    }
  }, null)(App))

const SearchBox = connect(() => ({}), null)(class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      fuzzySearch: ''
    }
    this.filterBy = this.filterBy.bind(this)
  }

  filterBy(v) {
    this.setState({ fuzzySearch: v }, () => {
      this.props.dispatch({ type: 'TRIGGER_FUZZY_SEARCH', fuzzySearch: v })
    })
  }

  render() {
    return <TextField
      className='search-box'
      fullWidth
      label='search'
      onTrailingIconSelect={() => this.filterBy('')}
      leadingIcon={<MaterialIcon role='button' icon='search' />}
      trailingIcon={<MaterialIcon role='button' icon='delete' />} >
      <Input
        style={{ paddingLeft: 40, paddingRight: 40 }}
        value={this.state.fuzzySearch}
        onChange={(e) => this.filterBy(e.currentTarget.value)} />
    </TextField>
  }
})
