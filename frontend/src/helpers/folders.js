export const folders = {
  0: {
    selectedIndex: 0,
    name: 'bookmarks',
    filter: (bookmarks) => {
      return bookmarks.filter((v) => !v.inbox)
    }
  },
  1: {
    selectedIndex: 1,
    name: 'pending',
    filter: (bookmarks) => {
      return bookmarks.filter((v) => v.inbox)
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