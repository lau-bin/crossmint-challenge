import { MapGatewayImpl } from "./MapGateway";
import { parseArgs } from "node:util"
import { getLogger } from "./Logger";
import { MapModel } from "./MapModel";
import { MapReaderImpl } from "./MapReader";
import 'dotenv/config'


(async function main() {
  const logger = getLogger("main");
  let { retries, clear } = getArgs();
  const mapGateway = new MapGatewayImpl(retries, 200);
  const mapReader = new MapReaderImpl();
  const mapModel = new MapModel(mapGateway, mapReader);
  let pendingCalls: Array<Promise<any>>;
  let goalMap = await mapGateway.retrieveGoalMap();
  if (clear) {
    pendingCalls = await mapModel.clearMap(goalMap)
  } else {
    pendingCalls = await mapModel.fillMap(goalMap);
  }
  await Promise.allSettled(pendingCalls);
  Promise.all(pendingCalls)
    .catch(() => {
      logger.info("Some calls failed");
    });
})();


function getArgs() {
  const defaultRetries = 0;
  const cmdRetries = parseArgs({
    options: {
      "num-retries": {
        type: "string",
        short: "r"
      },
      "clear": {
        type: "string",
        short: "c"
      }
    }
  })
  const retries = cmdRetries.values["num-retries"];
  const clear = cmdRetries.values["clear"];
  return {
    retries: retries !== undefined ? Number.parseInt(retries) : defaultRetries,
    clear: "true" === clear ? true : false,
  }
}



