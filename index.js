require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const Papa = require('papaparse');
const fs = require('fs');

async function example() {
  const d = await new Builder().forBrowser('firefox').build();
  const data = [];
  const countryCode = process.env.COUNTRY_CODE;
  const phoneNum = process.env.PHONE_NUMBER;

  const countryCodeInputX =
    '/html/body/div[1]/div/div[2]/div[2]/form/div[2]/div[1]/input';
  const numberInputX =
    '/html/body/div[1]/div/div[2]/div[2]/form/div[2]/div[2]/input';
  const convoX = (index) =>
    `/html/body/div[1]/div[2]/div/div[1]/div[2]/div/div[1]/ul/li[${index}]`;
  const nameX =
    '/html/body/div[1]/div[1]/div/div/div[2]/div/div[2]/a/div/span[1]';
  const memberCountX =
    '/html/body/div[1]/div[1]/div/div/div[2]/div/div[2]/a/div/span[2]/span';

  try {
    await d.get('https://web.telegram.org/');

    // login
    const countryCodeInput = await d.wait(
      until.elementLocated(By.xpath(countryCodeInputX)),
    );
    countryCodeInput.clear();
    countryCodeInput.sendKeys(countryCode);
    await d
      .wait(until.elementLocated(By.xpath(numberInputX)))
      .sendKeys(phoneNum);

    // push info to array 'data'
    for (let i = 1; i < 307; i++) {
      await d.wait(until.elementLocated(By.xpath(convoX(i))), 100000).click();
      const diff = await d
        .wait(until.elementLocated(By.xpath(memberCountX)))
        .getText();

      if (diff.includes('subscriber')) {
        const handle = (await d.getCurrentUrl()).substr(31);
        const name = await d
          .wait(until.elementLocated(By.xpath(nameX)))
          .getText();
        const memberCounts = parseInt(diff);
        data.push({
          id: i,
          handle: handle,
          name: name,
          memberCounts: memberCounts,
        });
      }
    }

    // log and export data to csv
    const csv = Papa.unparse(data);
    console.log(csv);
    fs.writeFile('g.csv', csv, (err) => {
      if (err) throw err;
      console.log('File has been saved');
    });
  } finally {
    // d.quit();
  }
}

example();
