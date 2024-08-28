import { XmlParserService } from './xml-parser.service';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('XmlParserService', () => {
  let service: XmlParserService;

  beforeEach(() => {
    service = new XmlParserService();
    fetchMock.resetMocks();
  });

  it('should return a list of MakeDto with vehicle types', async () => {
    // Mock successful response for fetching makes
    const mockMakesXml = `
      <Response>
        <Results>
          <AllVehicleMakes>
            <Make_ID>1</Make_ID>
            <Make_Name>Make 1</Make_Name>
          </AllVehicleMakes>
          <AllVehicleMakes>
            <Make_ID>2</Make_ID>
            <Make_Name>Make 2</Make_Name>
          </AllVehicleMakes>
        </Results>
      </Response>`;

    const mockVehicleTypesXml = `
  <Response>
    <Results>
      <VehicleTypes>
        <VehicleType>
          <Type_ID>1</Type_ID>
          <Type_Name>Car</Type_Name>
        </VehicleType>
        <VehicleType>
          <Type_ID>2</Type_ID>
          <Type_Name>Truck</Type_Name>
        </VehicleType>
      </VehicleTypes>
    </Results>
  </Response>`;

    fetchMock.mockResponses(
      [mockMakesXml, { status: 200 }],
      [mockVehicleTypesXml, { status: 200 }], // mockVehicleTypesXml needs to be defined
    );

    const result = await service.fetchAndParseVehicleData();
    expect(result).toEqual([
      {
        makeId: '1',
        makeName: 'Make 1',
        vehicleTypes: [{ typeId: '1', typeName: 'Car' }],
      },
      {
        makeId: '2',
        makeName: 'Make 2',
        vehicleTypes: [{ typeId: '2', typeName: 'Truck' }],
      },
    ]);
  });

  it('should handle cases where no vehicle types are returned', async () => {
    // Mock successful response for fetching makes
    const mockMakesXml = `
      <Response>
        <Results>
          <AllVehicleMakes>
            <Make_ID>1</Make_ID>
            <Make_Name>Make 1</Make_Name>
          </AllVehicleMakes>
        </Results>
      </Response>`;

    fetchMock.mockResponses(
      [mockMakesXml, { status: 200 }],
      ['', { status: 200 }], // Simulate no vehicle types
    );

    const result = await service.fetchAndParseVehicleData();
    expect(result).toEqual([
      {
        makeId: '1',
        makeName: 'Make 1',
        vehicleTypes: [],
      },
    ]);
  });

  it('should handle cases where fetching makes fails', async () => {
    fetchMock.mockRejectOnce(new Error('Failed to fetch makes'));

    await expect(service.fetchAndParseVehicleData()).rejects.toThrow(
      'Failed to fetch data from https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML',
    );
  });

  it('should handle cases where fetching vehicle types fails', async () => {
    const mockMakesXml = `
      <Response>
        <Results>
          <AllVehicleMakes>
            <Make_ID>1</Make_ID>
            <Make_Name>Make 1</Make_Name>
          </AllVehicleMakes>
        </Results>
      </Response>`;

    fetchMock.mockResponses(
      [mockMakesXml, { status: 200 }],
      ['', { status: 500 }], // Simulate vehicle types fetch error
    );

    await expect(service.fetchAndParseVehicleData()).resolves.toEqual([
      {
        makeId: '1',
        makeName: 'Make 1',
        vehicleTypes: [],
      },
    ]);
  });
});
