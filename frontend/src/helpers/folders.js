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

export const folders = {
  0: {
    selectedIndex: 0,
    name: 'bookmarks',
    filter: (bookmarks) => {
      return bookmarks.filter((v) => v.inbox === 0)
    }
  },
  1: {
    selectedIndex: 1,
    name: 'pending',
    filter: (bookmarks) => {
      return bookmarks.filter((v) => v.inbox !== 0)
    }
  },
  2: {
    selectedIndex: 2,
    name: 'duplicated',
    filter: (bookmarks) => {
      var repeatedURLs = {}
      for (let i in bookmarks) {
        let v = bookmarks[i]
        let strippedURL = stripHost(v.url)
        if (!repeatedURLs[strippedURL]) {
          repeatedURLs[strippedURL] = []
        }
        repeatedURLs[strippedURL].push(v)
      }
      var ret = []
      for (let i in repeatedURLs) {
        const block = repeatedURLs[i]
        if (block.length < 2) {
          continue
        }
        ret = ret.concat(block)
      }
      return ret
    }
  },
  3: {
    selectedIndex: 3,
    name: 'all',
    filter: (bookmarks) => bookmarks
  },
}

export function folderByName(name) {
  switch (name) {
    case 'bookmarks': return folders[0]
    case 'pending': return folders[1]
    case 'duplicated': return folders[2]
    case 'all': return folders[3]
    default: return folders[3]
  }
}


function stripHost(host) {
  return host
    .toLowerCase()
    .trim()
    .replace('www.', '')
    .replace('http://www', '')
    .replace('https://www', '')
    .replace('http://', '')
    .replace('https://', '')
    .replace(/\/$/, '')
}