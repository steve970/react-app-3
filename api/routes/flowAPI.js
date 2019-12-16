const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

let bar = [];

let testtest = (async () => {

  let tenDayPeriod = () => {
    let d = new Date();
    d.setDate(d.getDate() - 10);
    let month = d.getMonth()+1;
    let day = d.getDay()+1;
    let year = d.getFullYear();
    return month + "/" + day + "/" + year;
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://dwr.state.co.us/surfacewater/data/detail_tabular.aspx?ID=PLACHECO&MTYPE=DISCHRG')
  const result = await page.evaluate(() => {
    let oldDate = document.querySelector('#ContentPlaceHolder2_startbox').value = '12/08/2019';
    document.querySelector('#ContentPlaceHolder2_viewbutton').click();
    return {
      oldDate
    }
  })
  await page.waitForNavigation();
  const foo = await page.evaluate(() => {
    // const bar = (row) => row
    //   .querySelector('td').innerHTML
    //
    // const ROW_SELECTOR = 'table#ContentPlaceHolder1_gridview1 tbody tr'
    //
    // const lulu = []
    //
    // const dataRows = document.querySelectorAll(ROW_SELECTOR)
    //
    // for(const tr of dataRows) {
    //   // lulu.push({
    //   //   test: bar(tr)
    //   // })
    // }
    // return data
// GIVES ME ALL THE DATA IN ONE ARRAY
    const tds = Array.from(document.querySelectorAll('table#ContentPlaceHolder1_gridview1 tbody tr td'))
    return tds.map(td  => td.innerHTML)
  })

  for(var i = 0, j=0, k = 1, l = 2; i <= foo.length; i ++, j += 3, k += 3, l +=3 ) {
    let emily ={
      date_time:foo[j],
      cfs:foo[k],
      guage:foo[l]
    }
    bar.push(emily);
  }
  return bar;
  await browser.close();
})()

router.get('/', function(req, res, next) {
    await ;
    res.json(bar);
});

module.exports = router;
