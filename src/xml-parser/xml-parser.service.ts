import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { MakeDto } from './dto/make.dto';
import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import { Sema } from 'async-sema';

@Injectable()
export class XmlParserService {
  private readonly apiUrl: string;
  private readonly xmlParser: XMLParser;

  constructor() {
    this.apiUrl =
      process.env.API_URL || 'https://vpic.nhtsa.dot.gov/api/vehicles';
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
      isArray: (name) => {
        return name === 'AllVehicleMakes' || name === 'VehicleType';
      },
    });
  }

  async fetchAndParseVehicleData(limit?: number): Promise<MakeDto[]> {
    const xmlData = await this.fetchXml(
      `${this.apiUrl}/getallmakes?format=XML`,
    );
    const parsedData = this.parseXml(xmlData);
    return this.transformDataToMakeDto(parsedData, limit);
  }

  private async fetchXml(url: string): Promise<string> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
      }

      return await response.text();
    } catch (error) {
      console.error(error.message);
      throw new Error(`Failed to fetch data from ${url}`);
    }
  }

  private parseXml(data: string): any {
    return this.xmlParser.parse(data);
  }

  private async transformDataToMakeDto(
    parsedData: any,
    limit?: number,
  ): Promise<MakeDto[]> {
    const results = parsedData?.Response?.Results?.AllVehicleMakes;

    if (!results) {
      console.error('No results found in parsed data:', parsedData);
      return [];
    }

    const makesArray = limit ? results.slice(0, limit) : results;

    const semaphore = new Sema(10); // Control concurrency
    const makesList = await Promise.all(
      makesArray.map(async (make) => {
        await semaphore.acquire();
        try {
          const vehicleType = await this.fetchVehicleTypes(
            String(make.Make_ID),
          );
          return {
            makeId: String(make.Make_ID),
            makeName: make.Make_Name,
            vehicleTypes: vehicleType ? [vehicleType] : [], // Ensure this is always an array
          } as MakeDto;
        } catch (error) {
          console.error(
            `Error fetching vehicle types for Make ID ${make.Make_ID}:`,
            error,
          );
          return null;
        } finally {
          semaphore.release();
        }
      }),
    );

    return makesList.filter((make) => make !== null);
  }

  private async fetchVehicleTypes(
    makeId: string,
  ): Promise<VehicleTypeDto | null> {
    const url = `${this.apiUrl}/GetVehicleTypesForMakeId/${makeId}?format=xml`;
    try {
      const xmlData = await this.fetchXml(url);
      const parsedData = this.parseXml(xmlData);

      const vehicleType = parsedData?.Response?.Results?.VehicleTypesForMakeIds;

      if (!vehicleType) {
        console.warn(`No vehicle types found for Make ID ${makeId}`);
        return null;
      }

      return {
        typeId: vehicleType.VehicleTypeId,
        typeName: vehicleType.VehicleTypeName,
      } as VehicleTypeDto;
    } catch (error) {
      console.error(
        `Error fetching vehicle types for Make ID ${makeId}:`,
        error,
      );
      return null;
    }
  }
}
