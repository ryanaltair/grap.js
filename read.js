const fs = require('fs')
const puppeteer = require('puppeteer')
const list = require('./result/list_good.json')
console.log(list)

// const searchURL = `https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${keyword}&btnG=&oq=di`
function buildURL (url) {
  console.log('fetch', url)
  return url
}
async function findMails (page) {
  const mailAddress = await page.$$eval('div.e-address > a', (nodes) => {
    const out = []
    for (const node of nodes) {
      out.push(node.textContent)
    }
    return out
  }).catch(() => { console.log() })
  return mailAddress || []
}
async function findElsevier (page) {
  const mailMap = []
  //   console.log('found Elsevier')

  console.log('start click author')
  await page.waitForSelector('#author-group')
  console.log('start find mail')
  //   const clickEL = await page.$eval('#author-group > a:nth-child(0)')
  //   await clickEL.click()
  for (let authorIndex = 1; authorIndex < 10; authorIndex++) {
    const selectorStr = `#author-group > a:nth-child(${authorIndex})`
    const authorElement = await page.$(selectorStr)
    if (!authorElement) continue
    const needInspect = await page.$eval(selectorStr, (node) => {
    //   console.log('author', node.text)
      if (node.querySelector('.icon-envelope')) {
        return true
      } else {
        // console.log('not email')
      }
    }).catch(() => {})
    const authorName = await page.$eval(selectorStr, node => {
      return node.textContent
    })
    if (!needInspect) continue
    // console.log('needInspect', needInspect)
    // console.log('click author', authorName)
    await authorElement.click()
    // await page.waitForSelector('.WorkspaceAuthor')
    if (page.$('.WorkspaceAuthor')) {
      await page.waitForTimeout(300)
    } else {
      console.log('wait address')
      await page.waitForTimeout(2000)
    }
    //   await page.waitForSelector('div.e-address > a')
    console.log('click author wait', authorIndex)
    let mailAddress = await findMails(page)
    if (mailAddress.length === 0) {
      await page.waitForTimeout(2000)
      mailAddress = await findMails(page)
    }

    console.log('mailAddress', authorName, mailAddress)
    mailMap.push({ name: authorName, mail: mailAddress })
  }
  console.log(mailMap)
  return mailMap
}
const result = []
; (async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 500 })
  const page = await browser.newPage()
  const timeNow = Date.now()
  let count = 0
  for (const url of list) {
    if (!url) continue
    await page.goto(buildURL(url))
    await page.waitForTimeout(3000)
    try {
      const list = await findElsevier(page)
      result.push(...list)
      fs.writeFileSync(`result/temp/${timeNow}-${count}.txt`, JSON.stringify(list, undefined, '  '))
      count++
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
  // fs.writeFileSync(`result/${timeNow}-all.txt`, JSON.stringify(result, undefined, '  '))

  //   fs.writeFileSync('out', `${...result}`)
  fs.writeFileSync(`result/${Date.now()}.txt`, JSON.stringify(result, undefined, '  '))
  //   console.log(searchEl)

  await browser.close()
})()
