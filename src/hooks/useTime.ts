type FMT = 'YYYY-MM-DD hh:mm:ss' | 'YYYY年MM月DD日 hh:mm:ss' |
           'MM-DD hh:mm' | 'MM月DD日 hh:mm' |
           'YYYY-MM-DD hh:mm' | 'YYYY年MM月DD日 hh:mm' |
           'YYYY-MM-DD' | 'YYYY年MM月DD日'

/**
 * @param {'YYYY-MM-DD hh:mm:ss', date}
 * @return {'YYYY-MM-DD hh:mm:ss'}
 */
export function dateFormat(fmt: FMT, date?: Date) {
  let ret
  let newFmt: string = fmt
  if (date) {
    date = new Date(date)
  } else {
    date = new Date()
  }
  
  interface Iopt {
    [key: string]: string
  }
  const opt: Iopt = {
    'Y+': date.getFullYear().toString(), // 年
    'M+': (date.getMonth() + 1).toString(), // 月
    'D+': date.getDate().toString(), // 日
    'h+': date.getHours().toString(), // 时
    'm+': date.getMinutes().toString(), // 分
    's+': date.getSeconds().toString() // 秒
  }
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(newFmt)
    if (ret) {
      newFmt = newFmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
      )
    }
  }
  return newFmt
}
/**
 * @param { Date }
 * @return { string }
 */

export function getDay (Time?: Date) {
  if (!Time) Time = new Date()
  let Day = Time.getDay()
  let StringDay = ''
  if (Day || Day === 0) {
    switch (Day) {
      case 0:
        StringDay = '周日'
        break
      case 1:
        StringDay = '周一'
        break
      case 2:
        StringDay = '周二'
        break
      case 3:
        StringDay = '周三'
        break
      case 4:
        StringDay = '周四'
        break
      case 5:
        StringDay = '周五'
        break
      case 6:
        StringDay = '周六'
        break
      default:
        StringDay = ''
    }
  } else {
    StringDay = ''
  }
  return StringDay
}
