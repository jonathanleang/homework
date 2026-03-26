const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174');
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // click the rocket game card
  const rocketCard = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.card'));
    const r = cards.find(c => c.textContent.includes('Rocket Jump'));
    if (r) {
      r.click();
      return true;
    }
    return false;
  });
  
  if (rocketCard) {
    console.log('Clicked Rocket Jump card.');
  } else {
    console.log('Could not find Rocket Jump card.');
  }

  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
})();
