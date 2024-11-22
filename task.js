// task.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const navigation = require('./navigation');

async function unstickVideo(page, user) {
    console.log('Attempting to unstick video');

    try {
        // 1. Click the left back button
        const backButtonSelector = 'i.van-icon-arrow-left';
        await page.waitForSelector(backButtonSelector, { timeout: 20000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => console.log('Navigation timeout after clicking back, continuing...')),
            page.click(backButtonSelector)
        ]);
        console.log('Clicked back button and waited for navigation');

        // Log current URL
        console.log('Current URL after clicking back:', await page.url());

        // 2. Click on tasks button
        const taskButtonSelector = 'div.van-tabbar-item';
        await page.waitForSelector(taskButtonSelector, { timeout: 20000 });
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('div.van-tabbar-item');
            for (const button of buttons) {
                if (button.textContent.includes('Task')) {
                    button.click();
                    return;
                }
            }
            throw new Error('Task button not found');
        });
        console.log('Clicked on Task button');

        // Wait for navigation
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => console.log('Navigation timeout after clicking Task, continuing...'));

        // Log current URL
        console.log('Current URL after clicking Task:', await page.url());

        // 3. Click on Submit Button
        const taskItemSelector = 'div.TaskItem.van-cell';
        await page.waitForSelector(taskItemSelector, { timeout: 20000 });
        
        const submitButtonClicked = await page.evaluate(() => {
            const taskItems = document.querySelectorAll('div.TaskItem.van-cell');
            for (const item of taskItems) {
                const submitButton = item.querySelector('button.van-button--info');
                if (submitButton && submitButton.textContent.trim().toLowerCase() === 'submit') {
                    submitButton.click();
                    return true;
                }
            }
            return false;
        });

        if (submitButtonClicked) {
            console.log('Clicked on Submit button');
        } else {
            console.error('Submit button not found or not clickable');
            await page.screenshot({ path: 'submit_button_not_found.png' });
            throw new Error('Submit button not found or not clickable');
        }

        // 4. Continue with watching video and submitting task
        await watchAndSubmitVideo(page);

        // 5. Navigate back to the main page
        await navigateBack(page);

        // 6. Navigate back to the specific tier
        const success = await navigation.navigateToTier(page, user.tier);
        if (success) {
            console.log(`Successfully navigated back to ${user.tier} page after unsticking video`);
        } else {
            console.log(`Failed to navigate back to ${user.tier} page after unsticking video`);
            throw new Error(`Failed to navigate back to ${user.tier} page`);
        }

        console.log('Video unstuck successfully');
        return true;
    } catch (error) {
        console.error('Error while trying to unstick video:', error);
        await page.screenshot({ path: 'unstick_video_error.png' });
        return false;
    }
}

async function watchAndSubmitVideo(page) {
    try {
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
            throw new Error('Submit completed task button not found');
        }, submitTaskSelector);
        console.log('Clicked "Submit Completed Task" button');

        // Add 2 second delay after clicking Submit Completed Task
        await delay(2000);
        console.log('Waited 2 seconds after clicking Submit Completed Task');
    } catch (error) {
        console.error('Error in watchAndSubmitVideo:', error);
        await page.screenshot({ path: 'watch_and_submit_video_error.png' });
        throw error;
    }
}

async function navigateBack(page) {
    try {
        const backButtonSelector = 'i.van-icon-arrow-left';
        await page.waitForSelector(backButtonSelector, { timeout: 20000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => console.log('Navigation timeout after clicking back, continuing...')),
            page.click(backButtonSelector)
        ]);
        console.log('Clicked back button and waited for navigation');

        // Click back button again to return to the main page
        await page.waitForSelector(backButtonSelector, { timeout: 20000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => console.log('Navigation timeout after clicking back again, continuing...')),
            page.click(backButtonSelector)
        ]);
        console.log('Clicked back button again and waited for navigation');
    } catch (error) {
        console.error('Error in navigateBack:', error);
        await page.screenshot({ path: 'navigate_back_error.png' });
        throw error;
    }
}

module.exports = {
    unstickVideo
};