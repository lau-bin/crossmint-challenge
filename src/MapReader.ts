import { chromium } from '@playwright/test';
import { MapElement } from "./MapGateway";
import { CANDIDATE_ID, MAP_URL } from "./Configuration";


// web scrapper that read the current map, not the goal
export interface MapReader{
  readFromWeb(props: any): Promise<MapElement[]>;
  getElements(): MapElement[] | null;
}
export class MapReaderImpl implements MapReader{
  private elements: Array<MapElement> | null = null;
  private url = MAP_URL;
  private candidateId = CANDIDATE_ID;

  getElements(){
    return this.elements;
  }

  async readFromWeb(props: any) {
    const browser = await chromium.launch(props);
    const page = await browser.newPage();
    await page.goto(this.url);
    await page.waitForLoadState("domcontentloaded");
    const input = "div > input";
    await page.waitForSelector(input);
    await page.type(input, this.candidateId);
    await page.click("button");
    await page.waitForLoadState("domcontentloaded");
    const linkSelector = 'a[href="/challenge"]';
    await page.waitForSelector(linkSelector);
    await page.click(linkSelector);
    await page.waitForLoadState("networkidle");
    const myMapSelector = 'a[href="/map"]';
    await page.waitForSelector(myMapSelector);
    await page.click(myMapSelector);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('text="Validate solution"', { state: 'visible' });
    const spanContents = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span > span'));
      return spans.map(span => span.textContent || (span as any).innerText);
    });
    let elements: Array<MapElement> = [];
    spanContents.forEach(s => {
      switch (s) {
        case '🌌':
          elements.push("SPACE");
          break;
        case '🪐':
          elements.push("POLYANET");
          break;
        case '🌕':
          elements.push("SOLOON");
          break;
        case '☄️':
          elements.push("COMETH");
          break;
      }
    });
    this.elements = elements;
    browser.close();
    return elements;
  }
}



// development only to manually test this module
// MapEntity.fromWeb({headless: false});
