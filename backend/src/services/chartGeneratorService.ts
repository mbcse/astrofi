import { AstroChartData } from './prokeralaService';
import { v4 as uuidv4 } from 'uuid';
import { walrusStorage } from './walrusStorageService';
import * as d3 from 'd3';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

// Extend global type to include document property
declare global {
  var document: Document;
}

export interface ChartMetadata {
  fileName: string;
  personName: string;
  birthDetails: any;
  ascendant: string;
  nakshatra: any;
  planets: any[];
  houses: any[];
  generatedAt: string;
  chartType: string;
  chartId: string;
  chartImageUrl: string;
  walrusFileId?: string;
}

export class ChartGeneratorService {
  private generateChartSVG(chartData: AstroChartData, chartType: 'natal' | 'wheel'): string {
    // Create a virtual DOM for SVG generation
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const document = dom.window.document;
    global.document = document;

    // SVG dimensions
    const width = 800;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;

    // Create SVG
    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width.toString())
      .attr('height', height.toString())
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Add background
    svg.append('rect')
      .attr('width', width.toString())
      .attr('height', height.toString())
      .attr('fill', '#1a1b26');

    // Draw outer circle
    svg.append('circle')
      .attr('cx', centerX.toString())
      .attr('cy', centerY.toString())
      .attr('r', radius.toString())
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', '2');

    // Draw zodiac divisions (12 houses)
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * (Math.PI / 180);
      const x2 = centerX + radius * Math.cos(angle);
      const y2 = centerY + radius * Math.sin(angle);

      svg.append('line')
        .attr('x1', centerX.toString())
        .attr('y1', centerY.toString())
        .attr('x2', x2.toString())
        .attr('y2', y2.toString())
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '1');
    }

    // Add houses
    chartData.houses.forEach((house, index) => {
      const angle = ((index * 30) + 15) * (Math.PI / 180);
      const x = centerX + (radius * 0.85) * Math.cos(angle);
      const y = centerY + (radius * 0.85) * Math.sin(angle);

      svg.append('text')
        .attr('x', x.toString())
        .attr('y', y.toString())
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '16px')
        .text(house.sign);
    });

    // Add planets
    chartData.planets.forEach((planet) => {
      const houseIndex = parseInt(planet.house.toString()) - 1;
      const angle = ((houseIndex * 30) + 15) * (Math.PI / 180);
      const x = centerX + (radius * 0.6) * Math.cos(angle);
      const y = centerY + (radius * 0.6) * Math.sin(angle);

      // Add planet symbol
      svg.append('circle')
        .attr('cx', x.toString())
        .attr('cy', y.toString())
        .attr('r', '5')
        .attr('fill', this.getPlanetColor(planet.name));

      svg.append('text')
        .attr('x', x.toString())
        .attr('y', (y + 20).toString())
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '14px')
        .text(planet.name);
    });

    // Add ascendant marker
    const ascendantAngle = this.getAscendantAngle(chartData.ascendant);
    const ascX = centerX + radius * Math.cos(ascendantAngle);
    const ascY = centerY + radius * Math.sin(ascendantAngle);

    svg.append('path')
      .attr('d', `M ${centerX.toString()} ${centerY.toString()} L ${ascX.toString()} ${ascY.toString()}`)
      .attr('stroke', '#ff0000')
      .attr('stroke-width', '3');

    // Add title
    svg.append('text')
      .attr('x', centerX.toString())
      .attr('y', '40')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '24px')
      .text(chartType === 'natal' ? 'Natal Chart' : 'Wheel Chart');

    return dom.window.document.body.innerHTML;
  }

  private getPlanetColor(planetName: string): string {
    const colors: Record<string, string> = {
      'Sun': '#ff6b35',
      'Moon': '#f7c242',
      'Mercury': '#4ecdc4',
      'Venus': '#45b7d1',
      'Mars': '#ff6b6b',
      'Jupiter': '#4ecdc4',
      'Saturn': '#96ceb4',
      'Uranus': '#ffeaa7',
      'Neptune': '#dda0dd',
      'Pluto': '#ff7675'
    };
    return colors[planetName] || '#ffffff';
  }

  private getAscendantAngle(ascendant: string): number {
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const index = zodiacSigns.indexOf(ascendant);
    return (index * 30) * (Math.PI / 180);
  }

  private async svgToPngBuffer(svgString: string): Promise<Buffer> {
    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svgString))
      .resize(1000, 1000)
      .png()
      .toBuffer();
    return pngBuffer;
  }

  async generateNatalChart(chartData: AstroChartData, personName: string): Promise<{ imagePath: string; metadata: ChartMetadata }> {
    try {
      const chartId = uuidv4();
      const fileName = `natal-chart-${chartId}.png`;
      
      console.log('Generating SVG for natal chart...');
      // Generate chart SVG and convert to PNG
      const svgString = this.generateChartSVG(chartData, 'natal');
      console.log('SVG generated, converting to PNG...');
      const chartImageBuffer = await this.svgToPngBuffer(svgString);
      console.log('PNG buffer created, size:', chartImageBuffer.length, 'bytes');
      
      console.log('Uploading to Walrus storage...');
      // Upload to Walrus storage
      const uploadResponse = await walrusStorage.uploadFile(
        chartImageBuffer,
        fileName,
        'image/png',
        {
          type: 'natal-chart',
          chartId,
          personName,
          uploadedAt: new Date().toISOString()
        }
      );

      console.log('Walrus upload response:', uploadResponse);

      if (!uploadResponse.success || !uploadResponse.file) {
        console.error('Walrus upload failed:', uploadResponse.error);
        throw new Error(`Failed to upload chart image to Walrus storage: ${uploadResponse.error}`);
      }

      console.log('Chart image uploaded successfully to:', uploadResponse.file.url);
      
      const metadata: ChartMetadata = {
        fileName,
        chartId,
        chartImageUrl: uploadResponse.file.url,
        walrusFileId: uploadResponse.file.id,
        personName,
        birthDetails: chartData.birthDetails,
        ascendant: chartData.ascendant,
        nakshatra: chartData.nakshatra,
        planets: chartData.planets.map(planet => ({
          name: planet.name,
          sign: planet.sign,
          house: planet.house,
          longitude: planet.longitude,
          isRetro: planet.is_retro
        })),
        houses: chartData.houses.map(house => ({
          number: house.id.toString(),
          sign: house.sign,
          longitude: house.longitude
        })),
        generatedAt: chartData.generatedAt,
        chartType: 'natal-chart'
      };
      
      return { 
        imagePath: uploadResponse.file.url,
        metadata 
      };
    } catch (error) {
      console.error('Error generating natal chart:', error);
      throw new Error(`Failed to generate natal chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateWheelChart(chartData: AstroChartData, personName: string): Promise<{ imagePath: string; metadata: ChartMetadata }> {
    try {
      const chartId = uuidv4();
      const fileName = `wheel-chart-${chartId}.png`;
      
      // Generate chart SVG and convert to PNG
      const svgString = this.generateChartSVG(chartData, 'wheel');
      const chartImageBuffer = await this.svgToPngBuffer(svgString);
      
      // Upload to Walrus storage
      const uploadResponse = await walrusStorage.uploadFile(
        chartImageBuffer,
        fileName,
        'image/png',
        {
          type: 'wheel-chart',
          chartId,
          personName,
          uploadedAt: new Date().toISOString()
        }
      );

      if (!uploadResponse.success || !uploadResponse.file) {
        throw new Error('Failed to upload chart image to Walrus storage');
      }
      
      const metadata: ChartMetadata = {
        fileName,
        chartId,
        chartImageUrl: uploadResponse.file.url,
        walrusFileId: uploadResponse.file.id,
        personName,
        birthDetails: chartData.birthDetails,
        ascendant: chartData.ascendant,
        nakshatra: chartData.nakshatra,
        planets: chartData.planets.map(planet => ({
          name: planet.name,
          sign: planet.sign,
          house: planet.house,
          longitude: planet.longitude,
          isRetro: planet.is_retro
        })),
        houses: chartData.houses.map(house => ({
          number: house.id.toString(),
          sign: house.sign,
          longitude: house.longitude
        })),
        generatedAt: chartData.generatedAt,
        chartType: 'wheel-chart'
      };
      
      return { 
        imagePath: uploadResponse.file.url,
        metadata 
      };
    } catch (error) {
      console.error('Error generating wheel chart:', error);
      throw new Error(`Failed to generate wheel chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateChartDataForFrontend(chartData: AstroChartData, personName: string) {
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const zodiacSymbols: Record<string, string> = {
      'Aries': '♈',
      'Taurus': '♉',
      'Gemini': '♊',
      'Cancer': '♋',
      'Leo': '♌',
      'Virgo': '♍',
      'Libra': '♎',
      'Scorpio': '♏',
      'Sagittarius': '♐',
      'Capricorn': '♑',
      'Aquarius': '♒',
      'Pisces': '♓'
    };

    const planetColors: Record<string, string> = {
      'Sun': '#ff6b35',
      'Moon': '#f7c242',
      'Mercury': '#4ecdc4',
      'Venus': '#45b7d1',
      'Mars': '#ff6b6b',
      'Jupiter': '#4ecdc4',
      'Saturn': '#96ceb4',
      'Uranus': '#ffeaa7',
      'Neptune': '#dda0dd',
      'Pluto': '#ff7675'
    };

    // Generate chart visualization data
    const chartVisualization = {
      personName,
      ascendant: chartData.ascendant,
      nakshatra: chartData.nakshatra,
      planets: chartData.planets.map(planet => ({
        name: planet.name,
        sign: planet.sign,
        symbol: zodiacSymbols[planet.sign] || '?',
        house: planet.house,
        longitude: planet.longitude,
        isRetro: planet.is_retro,
        color: planetColors[planet.name] || '#ffffff'
      })),
      houses: chartData.houses.map(house => ({
        number: house.id.toString(),
        sign: house.sign,
        symbol: zodiacSymbols[house.sign] || '?',
        longitude: house.longitude
      })),
      zodiacSigns,
      zodiacSymbols,
      birthDetails: chartData.birthDetails,
      generatedAt: chartData.generatedAt
    };

    // Generate chart image
    const chartId = uuidv4();
    const fileName = `chart-${chartId}.png`;
    const svgString = this.generateChartSVG(chartData, 'natal');
    const chartImageBuffer = await this.svgToPngBuffer(svgString);
    
    // Upload to Walrus storage
    const uploadResponse = await walrusStorage.uploadFile(
      chartImageBuffer,
      fileName,
      'image/png',
      {
        type: 'chart-visualization',
        chartId,
        personName,
        uploadedAt: new Date().toISOString()
      }
    );

    if (!uploadResponse.success || !uploadResponse.file) {
      throw new Error('Failed to upload chart image to Walrus storage');
    }

    return {
      ...chartVisualization,
      chartId,
      chartImageUrl: uploadResponse.file.url,
      walrusFileId: uploadResponse.file.id
    };
  }
}

// Export singleton instance
export const chartGeneratorService = new ChartGeneratorService(); 