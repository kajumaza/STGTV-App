const { tierConfig } = require('./navigation');
const { unstickVideo } = require('./task');

async function watchVideos(page, user) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Function to check if there are videos left to watch
  const checkRemainingVideos = async () => {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.waitForSelector('.van-grid-item__content.van-grid-item__content--center', { timeout: 10000 });
        const result = await page.evaluate(() => {
          const targetNode = document.querySelector('.van-grid-item__content.van-grid-item__content--center');
          if (!targetNode) {
            console.log('Target node not found');
            return false;
          }
          const content = targetNode.textContent.trim();
          console.log('Content found:', content);
          const count = parseInt(content.split('\n').pop().trim(), 10);
          console.log('Parsed count:', count);
          return !isNaN(count) && count > 0;
        });
        if (result !== false) return result;
      } catch (error) {
        console.log(`Attempt ${i + 1} failed: ${error.message}`);
      }
      await delay(2000); // Wait 2 seconds before retrying
    }
    console.log('Max retries reached, assuming no videos left');
    return false;
  };

  await delay(5000); // Initial wait for 5 seconds

  let videoCount = 0;

  while (true) {
    const hasVideos = await checkRemainingVideos();
    if (!hasVideos) {
      console.log('No more videos left to watch. Stopping automation.');
      break;
    }

    videoCount++;
    console.log(`Attempting to watch video ${videoCount}`);
    
    try {
      // Click on the top-left thumbnail
      const thumbnailSelector = 'div[data-v-5d290310].van-image';
      await page.waitForSelector(thumbnailSelector, { timeout: 20000 });
      const thumbnails = await page.$$(thumbnailSelector);
      if (thumbnails.length > 0) {
        await thumbnails[0].click();
        console.log(`Clicked on thumbnail for video ${videoCount}`);
      } else {
        throw new Error('No thumbnails found');
      }
      
      // Wait for video to appear and click to play
      const videoSelector = 'video';
      await page.waitForSelector(videoSelector, { timeout: 20000 });
      await page.click(videoSelector);
      console.log('Clicked on video to start playback');

      // Wait for 15 seconds
      await delay(15000);
      console.log('Waited for 15 seconds');

      // Add 1 second delay after video ends
      await delay(1000);
      console.log('Waited 1 additional second after video ended');

      // Click "Submit Completed Task" button
      const submitTaskSelector = 'button.van-button.van-button--danger.van-button--normal.van-button--block';
      await page.waitForSelector(submitTaskSelector, { timeout: 20000 });
      await page.evaluate((selector) => {
        const buttons = document.querySelectorAll(selector);
        for (const button of buttons) {
          if (button.textContent.trim() === 'Submit completed task') {
            button.click();
            return;
          }
        }
        throw new Error('Submit button not found');
      }, submitTaskSelector);
      console.log('Clicked "Submit Completed Task" button');

      // Add 2 second delay after clicking Submit Completed Task
      await delay(2000);
      console.log('Waited 2 seconds after clicking Submit Completed Task');

      // Handle back navigation
      const backButtonSelector = 'i.van-icon-arrow-left';
      await page.waitForSelector(backButtonSelector, { timeout: 20000 });
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.click(backButtonSelector)
      ]);
      console.log('Clicked back button and waited for navigation');

    } catch (error) {
      console.error(`Error while trying to watch video ${videoCount}:`, error);
      console.log('Video might be stuck. Attempting to unstick...');
      const unstuckSuccessfully = await unstickVideo(page, user);
      if (unstuckSuccessfully) {
        console.log('Successfully unstuck video. Continuing with next video.');
        continue; // Skip the rest of this iteration and start the next one
      } else {
        console.log('Failed to unstick video. Stopping automation.');
        break; // Stop watching videos after a failed unstick
      }
    }
    
    // Wait a bit before the next iteration
    await delay(2000);
  }
}

module.exports = {
  watchVideos
};