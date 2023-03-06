'use strict';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
@Injectable()
export class AppService {
  defaultPause = 300
  async waitingTimer(delay: number) {
    return new Promise<void>(resolve => setTimeout(() => resolve(), delay))
  }

  async startCrowler(dta) {
    const currentbrowser = await puppeteer.launch();
    async function waitForSelectors(selectors, frame, options?) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          throw new Error('Timed out');
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }
    async function scrollIntoViewIfNeeded(selectors, frame, timeout) {
      const element = await waitForSelectors(selectors, frame, { visible: false, timeout });
      if (!element) {
        throw new Error(
          'The element could not be found.'
        );
      }
      await waitForConnected(element, timeout);
      const isInViewport = await element.isIntersectingViewport({ threshold: 0 });
      if (isInViewport) {
        return;
      }
      await element.evaluate(element => {
        element.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'auto',
        });
      });
      await waitForInViewport(element, timeout);
    }
    async function waitForConnected(element, timeout) {
      await waitForFunction(async () => {
        return await element.getProperty('isConnected');
      }, timeout);
    }
    async function waitForInViewport(element, timeout) {
      await waitForFunction(async () => {
        return await element.isIntersectingViewport({ threshold: 0 });
      }, timeout);
    }
    async function waitForSelector(selector, frame, options?) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }
    async function waitForElement(step, frame, timeout) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      }, timeout);
    }
    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }
    async function querySelectorAll(selector, frame) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (i === 0) {
          elements = await frame.$$(part);
        } else {
          const tmpElements = elements;
          elements = [];
          for (const el of tmpElements) {
            elements.push(...(await el.$$(part)));
          }
        }
        if (elements.length === 0) {
          return [];
        }
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }
    async function waitForFunction(fn, timeout) {
      let isActive = true;
      const timeoutId = setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          clearTimeout(timeoutId);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }
    async function changeSelectElement(element, value) {
      await element.select(value);
      await element.evaluateHandle((e) => {
        e.blur();
        e.focus();
      });
    }
    async function changeElementValue(element, value) {
      await element.focus();
      await element.evaluate((input, value) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    }
    async function typeIntoElement(element, value) {
      const textToType = await element.evaluate((input, newValue) => {
        if (
          newValue.length <= input.value.length ||
          !newValue.startsWith(input.value)
        ) {
          input.value = '';
          return newValue;
        }
        const originalValue = input.value;
        input.value = '';
        input.value = originalValue;
        return newValue.substring(originalValue.length);
      }, value);
      await element.type(textToType, { delay: 10 });
    }
 
    let arr = []
    const page = await currentbrowser.newPage()
  {  try {
      if (!!dta?.interval) {
        this.defaultPause = dta?.interval ?? 300
      }
      const timeout = 30000;
      page.setDefaultTimeout(timeout);
      await page.setCacheEnabled(false)
      await page.setViewport({ width: 1920, height: 1080 });
      const promises = [];
      promises.push(page.waitForNavigation());
      await page.goto('http://extratoclube.com.br/');
      await Promise.all(promises);
      const frameLogin = page.frames().find(frame => {
        return frame.url().startsWith("http://ionic-application.s3-website-sa-east-1.amazonaws.com/login")
      });
      let targetPage = frameLogin
    
      let stopHere = true
      page.on('requestfinished', async (requestfinished) => {
        try {
          let response = requestfinished.response()
          if (response.ok() && !!requestfinished?.url()?.startsWith("http://extratoblubeapp-env.eba-mvegshhd.sa-east-1.elasticbeanstalk.com/noticia") && (requestfinished.method() == "GET")) {
            stopHere = false
          }
          if (response.ok() && !!requestfinished?.url()?.startsWith("http://extratoblubeapp-env.eba-mvegshhd.sa-east-1.elasticbeanstalk.com/offline/listagem")) {
            if ((requestfinished.resourceType() == "xhr") && (requestfinished.method() == "GET")) {
              let resp: any = await response.json()
              arr.push({ cpf: resp["cpf"], beneficios: resp?.["beneficios"].map(({ nb }) => (nb)) })
            }
          }
        } catch { }
      })
      await scrollIntoViewIfNeeded([
        [
          '#user'
        ]
      ], targetPage, timeout);
      const element = await waitForSelectors([
        [
          '#user'
        ]
      ], targetPage, { timeout, visible: true });
      await element.click({ delay: 1 });
      await this.waitingTimer(this.defaultPause)
      await scrollIntoViewIfNeeded([
        [
          '#user'
        ]
      ], targetPage, timeout);
      const element1 = await waitForSelectors([
        [
          '#user'
        ]
      ], targetPage, { timeout, visible: true });
      const inputType = await element1.evaluate(el => el.type);
      if (inputType === 'select-one') {
        await changeSelectElement(element1, dta.user)
      } else if ([
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email'
      ].includes(inputType)) {
        await typeIntoElement(element1, dta.user);
      } else {
        await changeElementValue(element1, dta.user);
      }
      await scrollIntoViewIfNeeded([
        [
          '#pass'
        ]
      ], targetPage, timeout);
      const element2 = await waitForSelectors([
        [
          '#pass'
        ]
      ], targetPage, { timeout, visible: true });
      await element2.click({ delay: 1 });
      await this.waitingTimer(this.defaultPause)
      await scrollIntoViewIfNeeded([
        [
          '#pass'
        ]
      ], targetPage, timeout);
      const element3 = await waitForSelectors([
        [
          '#pass'
        ]
      ], targetPage, { timeout, visible: true });
      const inputType2 = await element3.evaluate(el => el.type);
      if (inputType === 'select-one') {
        await changeSelectElement(element3, dta.password)
      } else if ([
        'textarea',
        'text',
        'url',
        'tel',
        'search',
        'password',
        'number',
        'email'
      ].includes(inputType2)) {
        await typeIntoElement(element3, dta.password);
      } else {
        await changeElementValue(element3, dta.password);
      }
      await this.waitingTimer(this.defaultPause)
      await scrollIntoViewIfNeeded([
        [
          '#botao'
        ],
        [
          'text/Logar'
        ]
      ], targetPage, timeout);
      const element4 = await waitForSelectors([
        [
          '#botao'
        ],
        [
          'text/Logar'
        ]
      ], targetPage, { timeout, visible: true });
      await element4.click({ delay: 1 });
      await this.waitingTimer(this.defaultPause)
      await scrollIntoViewIfNeeded([
        [
          '#ion-overlay-1 > div.modal-wrapper.ion-overlay-wrapper.sc-ion-modal-md > app-modal-fila > ion-button'
        ]
      ], targetPage, timeout);
      const element5 = await waitForSelectors([
        [
          "ion-button[title=Fechar]"
        ]
      ], targetPage, { timeout, visible: true });
      await element5.click({ delay: 1 });
      await this.waitingTimer(this.defaultPause)
      await scrollIntoViewIfNeeded([
        [
          'body > app-root > app-home > ion-app > ion-menu > ion-content > ion-list'
        ]
      ], targetPage, timeout);
      const element6 = await waitForSelectors([
        [
          'ion-item:nth-child(2)'
        ]
      ], targetPage, {  visible: true });
      await element6.click({ delay: 1 });
      await this.waitingTimer(this.defaultPause)
      while (stopHere) {
        await new Promise((res) => setTimeout(res, this.defaultPause));
      }
      await scrollIntoViewIfNeeded([
        [
          '#extratoonline > ion-row:nth-child(2) > ion-col > ion-card'
        ]
      ], targetPage, timeout);
      const element7 = await waitForSelectors([
        [
          'ion-button:nth-child(12)'
        ]
      ], targetPage, {  visible: true });
      await element7.click({ delay: 1 });
      await this.waitingTimer(this.defaultPause)
      for await (let [n, v] of dta.cpfs.split(",").entries()) {
        await scrollIntoViewIfNeeded([
          [
            '#extratoonline > ion-row:nth-child(2) > ion-col > ion-card > ion-grid > ion-row:nth-child(2) > ion-col > ion-card > ion-item > ion-input > input'
          ]
        ], targetPage, timeout);
        const element11 = await waitForSelectors([
          [
            '#extratoonline > ion-row:nth-child(2) > ion-col > ion-card > ion-grid > ion-row:nth-child(2) > ion-col > ion-card > ion-item > ion-input > input'
          ]
        ], targetPage);
        await element11.click({ delay: 1 });
        await this.waitingTimer(this.defaultPause)
        await typeIntoElement(element11, v);
        await this.waitingTimer(this.defaultPause)
        await scrollIntoViewIfNeeded([
          [
            '#extratoonline > ion-row:nth-child(2) > ion-col > ion-card > ion-grid > ion-row:nth-child(2) > ion-col > ion-card > ion-button'
          ]
        ], targetPage, timeout);
        const element9 = await waitForSelectors([
          [
            '#extratoonline > ion-row:nth-child(2) > ion-col > ion-card > ion-grid > ion-row:nth-child(2) > ion-col > ion-card > ion-button'
          ]
        ], targetPage);
        await element9.click({ delay: 1 });
        await this.waitingTimer(this.defaultPause)
        let resetCout = 0
        while (arr.length === n) {
          await new Promise((res) => setTimeout(res, this.defaultPause));
          resetCout++
          if(resetCout === 10){
            throw new Error("Network Problem");
            
          }
        }
        await scrollIntoViewIfNeeded([
          [
            '#extratoonline > ion-row:nth-child(2) > ion-col > ion-card > ion-grid > ion-row:nth-child(1) > ion-col:nth-child(1) > ion-button'
          ]
        ], targetPage, timeout);
        const element8 = await waitForSelectors([
          [
            '#extratoonline > ion-row:nth-child(2) > ion-col > ion-card > ion-grid > ion-row:nth-child(1) > ion-col:nth-child(1) > ion-button'
          ]
        ], targetPage);
        await element8.click({ delay: 1 });
        await this.waitingTimer(this.defaultPause)
        if (dta?.screenshot === true) {
          break
        }
      }
      if (dta?.screenshot === true) {
        // await page.setViewport({ width: 1920, height: 1080 });
        // Return the screenshot buffer which will trigger this editor to download it.
    
        return await page.screenshot({ fullPage: true });
      } else {
  
   
        return arr
      }
    } catch (e){
      console.log('e: ', e);
      await currentbrowser.close()
      throw new HttpException(
        { message: e.message, status: HttpStatus.NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    } finally {
  
      arr = []
      await currentbrowser.close()
    }}
  }
}
