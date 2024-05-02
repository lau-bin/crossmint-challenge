import { MapData, MapGatewayImpl } from "../../MapGateway";
import { MapModel } from "../../MapModel";
import { MapReaderImpl } from "../../MapReader";

// Mock implementations
jest.mock('../../MapReader', () => ({
  MapReaderImpl: jest.fn().mockImplementation(() => ({
    readFromWeb: jest.fn(() =>{
      return Promise.resolve(["COMETH", "COMETH", "POLYANET", "SPACE", "SOLOON", "SPACE", "SOLOON", "SPACE", "SPACE"])
    })
  }))
}));

jest.mock('../../MapGateway', () => ({
  MapGatewayImpl: jest.fn().mockImplementation(() => ({
    createPolyanet: jest.fn(() => Promise.resolve()),
    deletePolyanet: jest.fn(() => Promise.resolve()),
    createSoloon: jest.fn(() => Promise.resolve()),
    deleteSoloon: jest.fn(() => Promise.resolve()),
    createCometh: jest.fn(() => Promise.resolve()),
    deleteCometh: jest.fn(() => Promise.resolve())
  }))
}));


describe('MapModel Tests', () => {
  let mapReaderImpl: MapReaderImpl;
  let mapGateway: MapGatewayImpl;
  let model: MapModel;
  const delay = 200;
  const retries = 5;

  beforeEach(() => {
    mapReaderImpl = new MapReaderImpl();
    mapGateway = new MapGatewayImpl(retries, delay);
    model = new MapModel(mapGateway, mapReaderImpl);
  });

  test('clears map', async () => {
    const mapData: MapData = {
      goal: [
        ["COMETH", "COMETH", "POLYANET"],
        ["SOLOON", "SOLOON", "SPACE"],
        ["COMETH", "POLYANET", "SPACE"]
      ]
    };

    await model.clearMap(mapData.goal[0].length);

    // Check if the correct methods were called the expected number of times
    expect(mapGateway.deletePolyanet).toHaveBeenCalledTimes(1);
    expect(mapGateway.deleteSoloon).toHaveBeenCalledTimes(2);
    expect(mapGateway.deleteCometh).toHaveBeenCalledTimes(2);
  });

  test('fills map', async () => {
    const mapData: MapData = {
      goal: [
        ["COMETH", "COMETH", "POLYANET"],
        ["SOLOON", "SOLOON", "SPACE"],
        ["COMETH", "POLYANET", "SPACE"]
      ]
    };

    await model.fillMap(mapData);

    // Check if the correct methods were called the expected number of times
    expect(mapGateway.createPolyanet).toHaveBeenCalledTimes(2);
    expect(mapGateway.createSoloon).toHaveBeenCalledTimes(2);
    expect(mapGateway.createCometh).toHaveBeenCalledTimes(3);
  });
});