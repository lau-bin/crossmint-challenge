import axios from "axios";
import { getLogger } from "./Logger";
import { RateLimit } from "./RateLimit";
import { API_BASE_URL, CANDIDATE_ID } from "./Configuration";


// Gateway to interact with the Crossmint API
export interface MapGateway{
  createPolyanet(yAxis: number, xAxis: number): Promise<void>;
  deletePolyanet(yAxis: number, xAxis: number): Promise<void>;
  createSoloon(yAxis: number, xAxis: number, color: SoloonColor): Promise<void>;
  deleteSoloon(yAxis: number, xAxis: number): Promise<void>;
  createCometh(yAxis: number, xAxis: number, direction: ComethDirection): Promise<void>;
  deleteCometh(yAxis: number, xAxis: number): Promise<void>;
}
export class MapGatewayImpl implements MapGateway{
  private baseUrl = API_BASE_URL;
  private candidateId = CANDIDATE_ID;
  private axiosInstance = axios.create();
  private log = getLogger("MapGateway");
  private rateLimiter: RateLimit;
  constructor(retries: number = 0, delay: number = 0) {
    this.rateLimiter = new RateLimit(delay);
    this.axiosInstance.interceptors.response.use(
      undefined,
      (error) => {
        if (axios.isAxiosError(error)) {
          if (
            retries > 0
            && error.response
            && shouldRetry(error.response.status)
            && error.config
            && ((error.config as any).__retries === undefined
              || (error.config as any).__retries < retries)
          ) {
            if ((error.config as any).__retries === undefined) {
              (error.config as any).__retries = 0;
            }
            (error.config as any).__retries++;
            let config = error.config;
            // exponential delay
            const r = (error.config as any).__retries;
            let k = ((2 ** r) / 2);
            if (k > 10) {
              k = 10;
            }
            this.rateLimiter.updateDelay(delay * k)
            return this.rateLimiter.run(() => this.axiosInstance.request(config));
          } else {
            this.log.error(`Error in request, code: ${error.code}, message: ${error.message}`)
            throw new MapError();
          }
        }
        throw error;
      }
    );
  }
  async createPolyanet(yAxis: number, xAxis: number) {
    await this.rateLimiter.run(() => this.axiosInstance.post(this.baseUrl + "polyanets",
      {
        row: yAxis,
        column: xAxis,
        candidateId: this.candidateId
      }
    ));
  }
  async deletePolyanet(yAxis: number, xAxis: number) {
    await this.rateLimiter.run(() => this.axiosInstance.delete(this.baseUrl + "polyanets",
      {
        data: {
          row: yAxis,
          column: xAxis,
          candidateId: this.candidateId
        }
      }
    ));
  }

  async createSoloon(yAxis: number, xAxis: number, color: SoloonColor) {
    await this.rateLimiter.run(() => this.axiosInstance.post(this.baseUrl + "soloons",
      {
        row: yAxis,
        column: xAxis,
        color,
        candidateId: this.candidateId
      }
    ));
  }
  async deleteSoloon(yAxis: number, xAxis: number) {
    await this.rateLimiter.run(() => this.axiosInstance.delete(this.baseUrl + "soloons",
      {
        data: {
          row: yAxis,
          column: xAxis,
          candidateId: this.candidateId
        }
      }
    ));
  }
  async createCometh(yAxis: number, xAxis: number, direction: ComethDirection) {
    await this.rateLimiter.run(() => this.axiosInstance.post(this.baseUrl + "comeths",
      {
        row: yAxis,
        column: xAxis,
        direction,
        candidateId: this.candidateId
      }
    ));
  }
  async deleteCometh(yAxis: number, xAxis: number) {
    await this.rateLimiter.run(() => this.axiosInstance.delete(this.baseUrl + "comeths",
      {
        data: {
          row: yAxis,
          column: xAxis,
          candidateId: this.candidateId
        }
      }
    ));
  }

  async retrieveGoalMap() {
    return await this.rateLimiter.run(() => this.axiosInstance.get<MapData>(this.baseUrl + `map/${this.candidateId}/goal`)
      .then((val) => val.data));
  }
}

function shouldRetry(code: number) {
  switch (code) {
    case 500:
    case 502:
    case 503:
    case 504:
    case 429:
      return true;
    default:
      return false;
  }
}

export type SoloonColor = "blue" | "red" | "purple" | "white";
export type ComethDirection = "up" | "down" | "right" | "left";

export class MapError extends Error {

}


export type MapElement = "POLYANET" | "SOLOON" | "COMETH" | "SPACE";
export type MapData = {
  goal: [MapElement][]
}
