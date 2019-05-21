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
import Drawer, { DrawerContent } from '@material/react-drawer'
import List, { ListItem, ListItemText, ListItemGraphic, ListItemMeta } from '@material/react-list'
import { Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import HomePage from '../HomePage'
import PostPage from '../PostPage'
import './style.scss'
import LinearProgress from '@material/react-linear-progress';
import { folderByName } from '../../helpers/folders'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
    this.handleSelect = this.handleSelect.bind(this)
  }

  handleSelect(selectedIndex) {
    this.setState({ open: false }, () => {
      this.props.dispatch({ type: 'SELECT_BOOKMARK_FOLDER', selectedIndex: selectedIndex })
    })
  }

  render() {
    const drawer = <Drawer
      modal
      open={this.state.open}
      onClose={() => this.setState({ open: false })}
    >
      <DrawerContent>
        <List
          singleSelection
          selectedIndex={this.props.selectedIndex}
          handleSelect={this.handleSelect}
        >
          <ListItem>
            <ListItemGraphic graphic={<MaterialIcon icon='bookmark' />} />
            <ListItemText primaryText='Bookmarks' />
            <ListItemMeta meta={<span>{this.props.bookmarkCount}</span>} />
          </ListItem>
          <ListItem>
            <ListItemGraphic graphic={<MaterialIcon icon='all_inbox' />} />
            <ListItemText primaryText='Pending' />
            <ListItemMeta meta={<span>{this.props.pendingCount}</span>} />
          </ListItem>
          <ListItem>
            <ListItemGraphic graphic={<MaterialIcon icon='compare_arrows' />} />
            <ListItemText primaryText='Duplicated' />
            <ListItemMeta meta={<span>{this.props.duplicatedCount}</span>} />
          </ListItem>
          <ListItem>
            <ListItemGraphic graphic={<MaterialIcon icon='bookmarks' />} />
            <ListItemText primaryText='All' />
            <ListItemMeta meta={<span>{this.props.totalCount}</span>} />
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>

    return <div>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection align='start'>
            <TopAppBarIcon navIcon tabIndex={0}>
              <MaterialIcon hasRipple icon='menu' onClick={
                () => this.setState({ open: !this.state.open })
              } />
            </TopAppBarIcon>
            <TopAppBarTitle>Bookmarks Manager</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust>
        {drawer}
        {!this.props.loaded ? <LinearProgress indeterminate /> : null}
        <Route exact path='/'> <HomePage /> </Route>
        <Route path='/post' component={PostPage} />
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
