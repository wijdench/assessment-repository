import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { XmlParserService } from '../xml-parser/xml-parser.service';
import { MakeDto } from '../xml-parser/dto/make.dto';

@Resolver(() => MakeDto)
export class QraphQLResolver {
  constructor(private readonly xmlParserService: XmlParserService) {}

  @Query(() => [MakeDto])
  async fetchVehicles(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<MakeDto[]> {
    return this.xmlParserService.fetchAndParseVehicleData(limit);
  }
}
