import { MapError, MapElement, ComethDirection, SoloonColor, MapData, MapGateway } from "./MapGateway";
import { getLogger } from "./Logger";
import { MapReader } from "./MapReader";


// Business Logic to build a Megaverse or to clear it
export class MapModel {
  private logger = getLogger("main");
  constructor(private mapGateway: MapGateway, private mapEntity: MapReader) {
  }

  // clears current map, it calls a web scraper to get it's current state
  async clearMap(width: number) {
    let pendingCalls: Array<Promise<any>> = [];
    
    const elements = await this.mapEntity.readFromWeb(undefined);
    for (let row = 0; row < elements.length / width; row++) {
      for (let col = 0; col < width; col++) {
        pendingCalls.push(this.executeCall(elements[(row * width) + col], row, col, true));
      }
    }
    return pendingCalls;
  }

  // creates a Megaverse
  async fillMap(goalMap: MapData) {
    let pendingCalls: Array<Promise<any>> = [];
    for (let row = 0; row < goalMap.goal.length; row++) {
      for (let col = 0; col < goalMap.goal[row].length; col++) {
        const el = goalMap.goal[row][col];
        pendingCalls.push(this.executeCall(el, row, col, false));
      }
    }
    return pendingCalls;
  }
  private async executeCall(el: MapElement, row: number, col: number, clear: boolean) {
    if (el.includes("COMETH")) {
      if (clear) {
        this.logger.info(`Deleting cometh at (${col}, ${row})`);
        return this.mapGateway.deleteCometh(row, col);
      }
      this.logger.info(`Adding cometh at (${col}, ${row})`);
      const direction = el.split("_")[0].toLowerCase();
      return this.mapGateway.createCometh(row, col, direction as ComethDirection);
    }
    if (el.includes("POLYANET")) {
      if (clear) {
        this.logger.info(`Deleting polyanet at (${col}, ${row})`);
        return this.mapGateway.deletePolyanet(row, col);
      }
      this.logger.info(`Adding polyanet at (${col}, ${row})`);
      return this.mapGateway.createPolyanet(row, col);
    }
    if (el.includes("SOLOON")) {
      if (clear) {
        this.logger.info(`Deleting soloon at (${col}, ${row})`);
        return this.mapGateway.deleteSoloon(row, col);
      }
      this.logger.info(`Adding soloon at (${col}, ${row})`);
      const color = el.split("_")[0].toLowerCase();
      return this.mapGateway.createSoloon(row, col, color as SoloonColor);
    }
  }
}

