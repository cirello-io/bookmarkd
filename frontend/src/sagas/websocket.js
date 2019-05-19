
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

import ReconnectingWebSocket from 'reconnectingwebsocket'
import config from '../config'
import { call, take, put } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

var ws = null
var cfg = config()

function websocketInitChannel() {
  return eventChannel(emitter => {
    window._websocket = new ReconnectingWebSocket(cfg.websocket)
    ws = window._websocket

    ws.onmessage = function (evt) {
      var message = JSON.parse(evt.data)
      emitter(message)
    }

    // unsubscribe function
    return () => {
      // do whatever to interrupt the socket communication here
    }
  })
}

export default function* websocketSagas() {
  const channel = yield call(websocketInitChannel)
  while (true) {
    const action = yield take(channel)
    yield put(action)
  }
}
