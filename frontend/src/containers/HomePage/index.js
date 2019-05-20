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

import './style.scss'
import Button from '@material/react-button'
import Card, { CardPrimaryContent, CardActions, CardActionButtons, CardActionIcons } from "@material/react-card";
import Dialog, { DialogTitle, DialogContent, DialogFooter, DialogButton } from '@material/react-dialog'
import Fab from '@material/react-fab'
import MaterialIcon from '@material/react-material-icon'
import React from 'react'
import TextField, { Input } from '@material/react-text-field';
import moment from 'moment'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import { Headline6, Caption } from '@material/react-typography'
import { connect } from 'react-redux'
import AddNewBookmark from '../components/AddNewBookmark'
import { folderByName } from '../../helpers/folders'
import xorWith from 'lodash/xorWith'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'

class HomePage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fuzzySearch: '',
      delete: null,
      addNewBookmark: false
    }
    this.filterBy = this.filterBy.bind(this)
    this.deleteDialog = this.deleteDialog.bind(this)
    this.deleteAction = this.deleteAction.bind(this)
    this.addNewBookmark = this.addNewBookmark.bind(this)
    this.markAsRead = this.markAsRead.bind(this)
  }

  componentDidMount() {
    if (!this.dependenciesLoaded()) {
      this.props.dispatch({ type: 'INITIAL_LOAD_START' })
    }
  }

  dependenciesLoaded() {
    return this.props.bookmarks && this.props.bookmarks.loaded
  }

  filterBy(v) {
    this.setState({ fuzzySearch: v }, () => {
      this.props.dispatch({ type: 'TRIGGER_FUZZY_SEARCH', fuzzySearch: v })
    })
  }

  deleteDialog(e, card) {
    e.preventDefault()
    this.setState({ delete: card })
  }

  deleteAction() {
    this.props.dispatch({ type: 'DELETE_BOOKMARK', card: { ...this.state.delete } })
    this.setState({ delete: null })
  }

  markAsRead(e, id) {
    e.preventDefault()
    this.props.dispatch({ type: 'MARK_BOOKMARK_AS_READ', id })
  }

  addNewBookmark() {
    this.setState(
      { addNewBookmark: true },
      () => {
        this.props.dispatch({ type: 'RESET_BOOKMARK' })
      }
    )
  }

  render() {
    if (!this.dependenciesLoaded()) {
      return (<Grid></Grid>)
    }

    return <div>
      {this.state.delete !== null
        ? <Dialog
          open
          onClose={(action) => {
            switch (action) {
              case 'delete':
                return this.deleteAction()
              default:
                this.setState({ delete: null })
            }
          }}>
          <DialogTitle>Delete Bookmark</DialogTitle>
          <DialogContent>
            Delete "{this.state.delete.title.trim() !== '' ? this.state.delete.title.trim() : this.state.delete.url}" ?
          </DialogContent>
          <DialogFooter>
            <DialogButton action='keep' isDefault>Keep</DialogButton>
            <DialogButton action='delete'>Delete</DialogButton>
          </DialogFooter>
        </Dialog>
        : null}

      {this.state.addNewBookmark
        ? <AddNewBookmark onSave={
          () => this.setState(
            { addNewBookmark: false },
            () => {
              this.props.dispatch({ type: 'SELECT_BOOKMARK_FOLDER', selectedIndex: folderByName('pending').selectedIndex })
            }
          )
        } />
        : null}

      <Grid key={'homePageRoot'} className='home-page-root'>
        <SearchBox fuzzySearch={this.state.fuzzySearch} filterBy={this.filterBy} />
        <BookmarkCards
          listing={this.props.bookmarks.filteredBookmarks}
          markAsRead={this.markAsRead}
          deleteDialog={this.deleteDialog} />
      </Grid>
      <Fab key={'addLink'} className='addNewBookmark' icon={
        <MaterialIcon hasRipple icon='add' />
      } onClick={() => this.addNewBookmark()} />
    </div>
  }
}

function s2p(state) {
  return {
    bookmarks: state.bookmarks
  }
}

export default connect(s2p, null)(HomePage)

function SearchBox(props) {
  return <Row key={'searchBarRow'} className='searchbar-row'>
    <Cell columns={3} key={'searchBarLeftPadding'} />
    <Cell columns={6} align="middle">
      <TextField
        fullWidth
        label='search'
        onTrailingIconSelect={() => props.filterBy('')}
        trailingIcon={<MaterialIcon role="button" icon="delete" />} >
        <Input
          value={props.fuzzySearch}
          onChange={(e) => props.filterBy(e.currentTarget.value)} />
      </TextField>
    </Cell>
    <Cell columns={3} key={'searchBarRightPadding'} />
  </Row>
}

function isArrayEqual(x, y) {
  return isEmpty(xorWith(x, y, isEqual));
};


class BookmarkCards extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isArrayEqual(this.props.listing, nextProps.listing)
  }
  render () {
    const listing = this.props.listing
    return <Row key={'homePageRow0'}>
      {listing.map((v) => {
        return <Cell columns={4} key={'bookmarkCard-cell-' + v.id}>
          <BookmarkCard
            key={'bookmarkCard' + v.id}
            card={v}
            markAsRead={(e) => { this.props.markAsRead(e, v.id) }}
            deleteDialog={(e) => { this.props.deleteDialog(e, v) }} />
        </Cell>
      })}
      </Row>
  }
}

function BookmarkCard(props) {
  const card = props.card
  const openLink = () => window.open(card.url, 'bookmark-window-' + card.id)
  return <Card className='link-card' key={card.id}>
    <CardPrimaryContent className='primary-content' onClick={openLink}>
      <Headline6 className='headline-6'>
        {card.inbox ? <div className='inbox'> <MaterialIcon icon='inbox' /> &nbsp;</div> : <span />}
        {card.title.trim() !== '' ? card.title.trim() : card.url}
      </Headline6>
      <Caption>
        {card.host} - {moment(card.created_at).fromNow()}
        {card.last_status_code !== 200
          ? [
            ' - ',
            card.last_status_code === 0
              ? 'unknown HTTP status'
              : 'HTTP ' + card.last_status_code
          ]
          : ''}
      </Caption>
    </CardPrimaryContent>
    <CardActions>
      <CardActionButtons>
        <Button onClick={openLink}>Open</Button>
      </CardActionButtons>
      <CardActionIcons>
        {card.inbox
          ? <MaterialIcon
            icon='visibility'
            onClick={props.markAsRead} />
          : <div />}
        <MaterialIcon
          icon='remove'
          onClick={props.deleteDialog} />
      </CardActionIcons>
    </CardActions>
  </Card>
}
