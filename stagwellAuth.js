// StagwellAuth.js

async function handlePopup(page) {
    const popupSelector = 'button.van-button.van-button--default.van-button--large.van-dialog__confirm';
    try {
      await page.waitForSelector(popupSelector, { timeout: 5000 });
      console.log('Pop-up appeared. Clicking Confirm button.');
      await page.click(popupSelector);
      console.log('Confirmed pop-up.');
    } catch (error) {
      console.log('No pop-up appeared or unable to find the Confirm button.');
    }
  }
  
  async function login(page, telephone, password) {
    console.log('Login function called with:', { telephone, password });
    if (!telephone || !password) {
      console.error('Invalid telephone or password:', { telephone, password });
      throw new Error(`Invalid telephone or password: ${JSON.stringify({ telephone, password })}`);
    }
  
    // Log the current URL before login attempt
    console.log('Current URL before login:', await page.url());
    const selectors = {
      telephone: 'input[type="tel"][placeholder="Please enter your phone number"]',
      password: 'input[type="password"][placeholder="Please enter login password"]',
      loginButton: 'button.van-button.van-button--danger.van-button--large.van-button--block.van-button--round span.van-button__text'
    };
  
    // Handle telephone input
    try {
      await page.waitForSelector(selectors.telephone, { timeout: 20000 });
      console.log('Found telephone input');
      await page.type(selectors.telephone, telephone);
      console.log('Entered telephone number');
    } catch (error) {
      console.error('Error finding or interacting with telephone input:', error);
      await page.screenshot({ path: 'error_telephone.png' });
      throw error;
    }
  
    // Handle password input
    try {
      await page.waitForSelector(selectors.password, { timeout: 20000 });
      console.log('Found password input');
      await page.type(selectors.password, password);
      console.log('Entered password');
    } catch (error) {
      console.error('Error finding or interacting with password input:', error);
      await page.screenshot({ path: 'error_password.png' });
      throw error;
    }
  
    console.log('Attempting to click Log in now button.');
    try {
      await page.waitForSelector(selectors.loginButton, { timeout: 20000 });
      const loginButton = await page.$(selectors.loginButton);
      if (loginButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
          loginButton.evaluate(el => el.closest('button').click())
        ]);
        console.log('Clicked login button and waited for navigation');
      } else {
        console.error('Login button found but could not be clicked');
        await page.screenshot({ path: 'error_login_button_not_clickable.png' });
        throw new Error('Login button not clickable');
      }
    } catch (error) {
      console.error('Error during login process:', error);
      await page.screenshot({ path: 'error_login_process.png' });
      throw error;
    }
  
    // Check if login was successful
    const currentUrl = await page.url();
    console.log('Current URL after login attempt:', currentUrl);
    if (currentUrl.includes('login')) {
      console.error('Login seems to have failed. Still on login page.');
      await page.screenshot({ path: 'login_failed.png' });
      throw new Error('Login failed');
    } else {
      console.log('Login seems successful. Navigated away from login page.');
    }
  }
  
  async function handleOverlay(page) {
    const overlayCloseSelector = 'a.close i.van-icon-clear';
    try {
      await page.waitForSelector(overlayCloseSelector, { timeout: 10000 });
      console.log('Overlay detected. Attempting to close.');
      await page.click(overlayCloseSelector);
      console.log('Closed the overlay.');
    } catch (error) {
      console.log('No overlay detected or unable to close it.');
    }
  }
  
  //logout
  async function logout(page) {
    console.log('Attempting to log out');
    try {
      // Click on the left back button
      const backButtonSelector = 'i.van-icon-arrow-left';
      await page.waitForSelector(backButtonSelector, { timeout: 10000 });
      await page.click(backButtonSelector);
      console.log('Clicked back button');
  
      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => console.log('Navigation timeout after clicking back, continuing...'));
      
      // Log the current URL
      console.log('Current URL after clicking back:', await page.url());
  
      // Wait for the page content to load
      await page.waitForSelector('body', { timeout: 10000 });
  
      // Scroll to the bottom of the page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      console.log('Scrolled to bottom of page');
  
      // Wait a bit for any lazy-loaded content
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // Try to find and click the 'My' button
      const myTabSelector = 'div.van-tabbar-item__text';
      await page.waitForSelector(myTabSelector, { timeout: 20000 });
      await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (element.textContent.trim() === 'My') {
            element.click();
            return;
          }
        }
      }, myTabSelector);
      console.log('Clicked My tab');
  
      // Wait for navigation after clicking 'My' tab
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => console.log('Navigation timeout after clicking My tab, continuing...'));
  
      // Wait for and click the Personal Information button
      const personalInfoSelector = 'div.van-cell__title';
      await page.waitForSelector(personalInfoSelector, { timeout: 20000 });
      let personalInfoClicked = await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (element.textContent.trim() === 'Personal information') {
            element.click();
            return true;
          }
        }
        return false;
      }, personalInfoSelector);
  
      if (personalInfoClicked) {
        console.log('Clicked Personal Information');
        // Wait for navigation after clicking 'Personal Information'
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => console.log('Navigation timeout after clicking Personal Information, continuing...'));
        
        // Log current URL to verify we're on the correct page
        console.log('Current URL after clicking Personal Information:', await page.url());
  
        // Wait for the logout button to appear and click it
        const logoutSelector = 'div.logout';
        await page.waitForSelector(logoutSelector, { timeout: 20000 });
        let logoutClicked = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim() === 'Exit login') {
            element.click();
            return true;
          }
          return false;
        }, logoutSelector);
  
        if (logoutClicked) {
          console.log('Clicked Logout');
          // Wait for navigation to complete after logout
          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
          console.log('Logout completed');
        } else {
          console.error('Logout button not found or not clickable');
          await page.screenshot({ path: 'logout_button_not_found.png' });
        }
      } else {
        console.error('Personal Information button not found or not clickable');
        await page.screenshot({ path: 'personal_info_button_not_found.png' });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      await page.screenshot({ path: 'logout_error.png' });
    }
  
    // Log the final URL after logout attempt
    console.log('Final URL after logout attempt:', await page.url());
  }
  
  module.exports = {
    handlePopup,
    login,
    handleOverlay,
    logout
  };