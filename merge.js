
const fs = require('fs')
function buildPath (i) {
  return `result/temp/1615795054085-${i}.txt`
}
const merged = []
for (let i = 0; i < 100; i++) {
  const fileSrc = buildPath(i)
  if (fs.existsSync(fileSrc)) {
    const txt = fs.readFileSync(fileSrc)
    const obj = JSON.parse(txt)
    merged.push(...obj)
  }
}
console.log('length', merged.length)
fs.writeFileSync('result/merge.json', JSON.stringify(merged, undefined, '  '))
