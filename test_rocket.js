import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    console.log('Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174');
    
    console.log('Waiting 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking Rocket Jump...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.card'));
      const r = cards.find(c => c.textContent.includes('Rocket Jump'));
      if (r) r.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking Start Game...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start Game'));
      if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Checking state...');
    const rocketHtml = await page.evaluate(() => {
      const wrapper = document.querySelector('.game-wrapper');
      return wrapper ? wrapper.innerHTML : 'No game wrapper found';
    });
    console.log('Rocket inner HTML snippet:', rocketHtml.substring(0, 500));
  } catch (err) {
    console.log('Error:', err);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
})();