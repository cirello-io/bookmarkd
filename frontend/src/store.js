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

import { createBrowserHistory } from 'history'
import createSagaMiddleware from 'redux-saga'
import createRootReducer from './reducers/index'
import { createStore, applyMiddleware, compose } from 'redux'
import { logger } from 'redux-logger'
import { routerMiddleware } from 'connected-react-router'
import rootSaga from './sagas/index'
import wsSaga from './sagas/websocket'

const sagaMiddleware = createSagaMiddleware()
const websocketMiddleware = createSagaMiddleware()

export const history = createBrowserHistory()
export default createStore(
  createRootReducer(history),
  {},
  compose(
    applyMiddleware(
      routerMiddleware(history),
      sagaMiddleware,
      websocketMiddleware,
      logger
    )
  )
)

sagaMiddleware.run(rootSaga)
sagaMiddleware.run(wsSaga)
