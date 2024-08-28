import { Test, TestingModule } from '@nestjs/testing';
import { XmlParserService } from './xml-parser.service';
import { MakeDto } from './dto/make.dto';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('XmlParserService', () => {
  let service: XmlParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XmlParserService],
    }).compile();

    service = module.get<XmlParserService>(XmlParserService);
  });

  it('should fetch and parse vehicle data successfully (happy path)', async () => {
    const xmlMakeResponse = `
      <Response>
        <Results>
          <AllVehicleMakes>
            <Make_ID>440</Make_ID>
            <Make_Name>ASTON MARTIN</Make_Name>
          </AllVehicleMakes>
        </Results>
      </Response>`;

    const xmlVehicleTypeResponse = `
      <Response>
        <Results>
          <VehicleTypesForMakeIds>
            <VehicleTypeId>2</VehicleTypeId>
            <VehicleTypeName>Passenger Car</VehicleTypeName>
          </VehicleTypesForMakeIds>
        </Results>
      </Response>`;

    // Mocking the fetch responses
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
      (url: string) => {
        if (url.includes('getallmakes')) {
          return Promise.resolve(new Response(xmlMakeResponse));
        } else if (url.includes('GetVehicleTypesForMakeId/440')) {
          return Promise.resolve(new Response(xmlVehicleTypeResponse));
        }
        return Promise.reject(new Error('Unexpected URL'));
      },
    );

    const expected: MakeDto[] = [
      {
        makeId: '440',
        makeName: 'ASTON MARTIN',
        vehicleTypes: [
          {
            typeId: '2',
            typeName: 'Passenger Car',
          },
        ],
      },
    ];

    const result = await service.fetchAndParseVehicleData();
    expect(result).toEqual(expected);
  });

  it('should handle empty XML response gracefully (edge case)', async () => {
    const xmlMakeResponse = `
      <Response>
        <Results>
          <AllVehicleMakes />
        </Results>
      </Response>`;

    // Mocking the fetch responses
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
      return Promise.resolve(new Response(xmlMakeResponse));
    });

    const result = await service.fetchAndParseVehicleData();
    expect(result).toEqual([]); // Expect an empty array when there are no makes
  });

  it('should handle missing vehicle type data gracefully (edge case)', async () => {
    const xmlMakeResponse = `
      <Response>
        <Results>
          <AllVehicleMakes>
            <Make_ID>440</Make_ID>
            <Make_Name>ASTON MARTIN</Make_Name>
          </AllVehicleMakes>
        </Results>
      </Response>`;

    const xmlVehicleTypeResponse = `
      <Response>
        <Results>
          <VehicleTypesForMakeIds />
        </Results>
      </Response>`;

    // Mocking the fetch responses
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
      (url: string) => {
        if (url.includes('getallmakes')) {
          return Promise.resolve(new Response(xmlMakeResponse));
        } else if (url.includes('GetVehicleTypesForMakeId/440')) {
          return Promise.resolve(new Response(xmlVehicleTypeResponse));
        }
        return Promise.reject(new Error('Unexpected URL'));
      },
    );

    const expected: MakeDto[] = [
      {
        makeId: '440',
        makeName: 'ASTON MARTIN',
        vehicleTypes: [],
      },
    ];

    const result = await service.fetchAndParseVehicleData();
    expect(result).toEqual(expected);
  });

  it('should throw an error when fetch fails', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
      return Promise.reject(new Error('Failed to fetch data'));
    });

    await expect(service.fetchAndParseVehicleData()).rejects.toThrow(
      'Failed to fetch data',
    );
  });
});
