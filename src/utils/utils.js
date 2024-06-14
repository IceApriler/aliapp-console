/**
 * 判断变量类型
 */
export const types = {
  _typeof(o) {
    return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
  },
  isString(o) {
    return this._typeof(o) === 'string'
  },
  isNumber(o) {
    return this._typeof(o) === 'number'
  },
  isArray(o) {
    return this._typeof(o) === 'array'
  },
  isObject(o) {
    return this._typeof(o) === 'object'
  },
}

export function convertObject(data) {
  return Object.keys(data).map((key) => {
    const item = data[key]
    const { label, value, type } = convertValue(item)
    return {
      key, // 数组或对象的key
      label,
      value, // 值
      type, // 值类型
    }
  })
}
export function convertValue(value) {
  let label = makeLabel(value)
  return { label, value: value, type: types._typeof(value) }
}
export function makeLabel(value) {
  const _tp = types._typeof(value)
  let label
  switch (_tp) {
    case 'array':
      let innerType = ''
      if (value[0]) {
        innerType = types._typeof(value[0])
      }
      label = `[${innerType}](${value.length})`
      break
    case 'object':
      if (Object.keys(value).length) {
        label = `{...}`
      } else {
        label = `{}`
      }
      break
    case 'undefined':
      label = 'undefined'
      break
    default:
      if (value === '') {
        label = JSON.stringify('')
      } else {
        label = value
      }
      break
  }
  return label
}
/**
 * 去除左右的指定字符
 */
export const strTrim = function (str, char, type) {
  if (char) {
    if (type == 'left') {
      // 去除字符串左侧指定字符
      return str.replace(new RegExp('^\\' + char + '+', 'g'), '')
    } else if (type == 'right') {
      // 去除字符串右侧指定字符
      return str.replace(new RegExp('\\' + char + '+$', 'g'), '')
    }
    // 去除字符串两侧指定字符
    return str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '')
  }
  // 去除字符串首尾的全部空白
  return str.replace(/^\s+|\s+$/g, '')
}

export function deepCopy(data, hash = new WeakMap()) {
  if (typeof data !== 'object' || data === null) {
    throw new TypeError('传入参数不是对象')
  }
  // 判断传入的待拷贝对象的引用是否存在于hash中
  if (hash.has(data)) {
    return hash.get(data)
  }
  let newData = {}
  const dataKeys = Object.keys(data)
  dataKeys.forEach((value) => {
    const currentDataValue = data[value]
    // 基本数据类型的值和函数直接赋值拷贝
    if (typeof currentDataValue !== 'object' || currentDataValue === null) {
      newData[value] = currentDataValue
    } else if (Array.isArray(currentDataValue)) {
      // 实现数组的深拷贝
      newData[value] = [...currentDataValue]
    } else if (currentDataValue instanceof Set) {
      // 实现set数据的深拷贝
      newData[value] = new Set([...currentDataValue])
    } else if (currentDataValue instanceof Map) {
      // 实现map数据的深拷贝
      newData[value] = new Map([...currentDataValue])
    } else {
      // 将这个待拷贝对象的引用存于hash中
      hash.set(data, data)
      // 普通对象则递归赋值
      newData[value] = deepCopy(currentDataValue, hash)
    }
  })
  return newData
}

// 递归遍历检查对象及其属性，以便发现循环引用
export function findCircularReference(obj, path = '') {
  // 使用 Set 来跟踪已访问的对象
  const visited = new Set()

  function traverse(obj, currentPath) {
    if (visited.has(obj)) {
      console.log('Circular reference:', currentPath)
      return
    }

    visited.add(obj)

    for (let key in obj) {
      const newPath = currentPath ? `${currentPath}.${key}` : key
      const value = obj[key]

      if (typeof value === 'object' && value !== null) {
        traverse(value, newPath)
      }
    }
  }

  traverse(obj, path)
}

// 使用WeakSet来跟踪已经访问过的对象，以检测循环引用。当发现循环引用时，我们将其值替换为字符串'[Circular]'
export function customStringify(obj, replacer = null, indent = 2) {
  const visited = new WeakSet()

  return JSON.stringify(
    obj,
    function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (visited.has(value)) {
          return '[Circular]'
        }
        visited.add(value)
      }
      if (replacer && typeof replacer === 'function') {
        return replacer(key, value)
      }
      return value
    },
    indent,
  )
}

export function getCurrentTime() {
  // 获取当前日期和时间
  const now = new Date()

  // 获取年、月、日、小时、分钟、秒
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  // 格式化为 YYYY-MM-DD HH:mm:ss
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

  return formattedTime
}

export function storeLargeData(key, data) {
  const maxChunkSize = 180 * 1024 // 180k
  const jsonData = customStringify(data)
  const totalLength = jsonData.length
  const numChunks = Math.ceil(totalLength / maxChunkSize)

  for (let i = 0; i < numChunks; i++) {
    const chunk = jsonData.slice(i * maxChunkSize, (i + 1) * maxChunkSize)
    my.setStorage({
      key: `${key}_chunk_${i}`,
      data: chunk,
    })
  }

  // 存储元数据
  my.setStorage({
    key: `${key}_meta`,
    data: {
      key: key,
      totalChunks: numChunks,
    },
  })
}

function retrieveLargeData(key) {
  const meta = my.getStorageSync({ key: `${key}_meta` }).data
  if (!meta) {
    console.error('No metadata found for key:', key)
    return null
  }

  const { totalChunks } = meta
  let jsonData = ''

  for (let i = 0; i < totalChunks; i++) {
    const chunk = my.getStorageSync({ key: `${key}_chunk_${i}` }).data
    if (chunk === null) {
      console.error('Missing chunk:', i)
      return null
    }
    jsonData += chunk
  }

  return JSON.parse(jsonData)
}

function storeDataWithLimit(key, newData, maxSize = 1 * 1024 * 1024) {
  let storedData = retrieveLargeData(key) || []
  const maxChunkSize = 200 * 1024 // 200k per chunk

  // 添加新的数据
  storedData = storedData.concat(newData)

  // 将数据序列化为字符串
  let jsonData = JSON.stringify(storedData)

  // 如果总数据量超过maxSize，移除旧数据
  while (jsonData.length > maxSize) {
    storedData.shift() // 删除最旧的数据
    jsonData = JSON.stringify(storedData) // 重新计算大小
  }

  // 清除旧的分片数据
  const meta = JSON.parse(localStorage.getItem(`${key}_meta`))
  if (meta) {
    for (let i = 0; i < meta.totalChunks; i++) {
      localStorage.removeItem(`${key}_chunk_${i}`)
    }
  }

  // 重新存储数据
  const totalLength = jsonData.length
  const numChunks = Math.ceil(totalLength / maxChunkSize)
  for (let i = 0; i < numChunks; i++) {
    const chunk = jsonData.slice(i * maxChunkSize, (i + 1) * maxChunkSize)
    localStorage.setItem(`${key}_chunk_${i}`, chunk)
  }

  // 存储元数据
  localStorage.setItem(
    `${key}_meta`,
    JSON.stringify({
      key: key,
      totalChunks: numChunks,
    }),
  )
}

function retrieveLargeData(key) {
  const meta = JSON.parse(localStorage.getItem(`${key}_meta`))
  if (!meta) {
    console.error('No metadata found for key:', key)
    return null
  }

  const { totalChunks } = meta
  let jsonData = ''

  for (let i = 0; i < totalChunks; i++) {
    const chunk = localStorage.getItem(`${key}_chunk_${i}`)
    if (chunk === null) {
      console.error('Missing chunk:', i)
      return null
    }
    jsonData += chunk
  }

  return JSON.parse(jsonData)
}
