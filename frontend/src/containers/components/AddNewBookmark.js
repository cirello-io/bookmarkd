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

import Dialog, { DialogTitle, DialogContent, DialogFooter, DialogButton } from '@material/react-dialog'
import MaterialIcon from '@material/react-material-icon'
import React from 'react'
import TextField, { Input } from '@material/react-text-field';
import { connect } from 'react-redux'

class AddNewBookmark extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newBookmark: {
        title: '',
        url: '',
        pristine: true
      }
    }
    this.save = this.save.bind(this)
  }

  componentDidMount() {
    if (this.props.url && !this.state.newBookmark.url) {
      const url = this.props.url
      this.setState({
        newBookmark: {
          ...this.state.newBookmark,
          url
        }
      }, () => {
        this.props.dispatch({ type: 'LOAD_BOOKMARK', url })
      })
    }
  }
  save() {
    this.setState({ addNewBookmark: null }, () => {
      this.props.dispatch({ type: 'ADD_BOOKMARK', newBookmark: { ...this.state.newBookmark } })
      this.props.onSave()
    })
  }

  render() {
    return <Dialog
      open
      onClose={(action) => {
        if (action === 'add') {
          this.save()
        }
        this.props.onClose()
      }}>
      <DialogTitle>Add Bookmark</DialogTitle>
      <DialogContent>
        <div className='add-new-bookmark-url'>
          <TextField
            label='URL'
            onTrailingIconSelect={() => this.setState({
              newBookmark: { ...this.state.newBookmark, url: '', pristine: true },
            })}
            trailingIcon={<MaterialIcon role="button" icon="delete" />} >
            <Input
              value={this.state.newBookmark.url}
              onChange={(e) => {
                const url = e.currentTarget.value
                this.setState({
                  newBookmark: { ...this.state.newBookmark, url, pristine: true },
                }, () => {
                  this.props.dispatch({ type: 'LOAD_BOOKMARK', url })
                })
              }} />
          </TextField>
        </div>

        <div>
          <TextField
            dense
            label='Title'
            onTrailingIconSelect={() => this.setState({
              newBookmark: { ...this.state.newBookmark, title: '', pristine: false },
            })}
            trailingIcon={<MaterialIcon role="button" icon="delete" />} >
            <Input
              value={
                !this.state.newBookmark.title && this.state.newBookmark.pristine
                  ? this.props.bookmarks.bookmark.title.trim()
                  : this.state.newBookmark.title
              }
              onChange={(e) => {
                const title = e.currentTarget.value
                  ? e.currentTarget.value
                  : this.props.bookmarks.bookmark.title.trim()
                this.setState({
                  newBookmark: { ...this.state.newBookmark, title, pristine: false }
                })
              }} />
          </TextField>
        </div>
      </DialogContent>
      <DialogFooter>
        <DialogButton action='add' isDefault>add</DialogButton>
      </DialogFooter>
    </Dialog>
  }
}

function s2p(state) {
  return {
    bookmarks: state.bookmarks
  }
}

export default connect(s2p, null)(AddNewBookmark)