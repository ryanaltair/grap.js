const fs = require('fs')
const puppeteer = require('puppeteer')
function buildURL () {
  const url = 'https://www.sciencedirect.com/search?qs=digital%20twins%20china&show=100'
  console.log('fetch', url)
  return url
}
const list = []
; (async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  await page.goto(buildURL())
  await page.waitForTimeout(5000)
  for (let i = 1; i < 100; i++) {
    try {
      const out = await page.$eval(
            `#srp-results-list > ol > li:nth-child(${i}) > div > div > h2 > span > a`, (node) => {
              return node.href
            }).catch(() => {})
      list.push(out)
      console.log('find', i, out)
    } catch (error) {
      console.error(error)
    }
  }
  fs.writeFileSync('result/list.txt', JSON.stringify(list, undefined, '  '))
  await page.close()

  await browser.close()
})()
