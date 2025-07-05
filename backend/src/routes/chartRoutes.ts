import { Router, Request, Response } from 'express';
import { prokeralaService, BirthDetails } from '../services/prokeralaService';
import { chartGeneratorService } from '../services/chartGeneratorService';
import { geocodingService } from '../services/geocodingService';
import { walrusStorage } from '../services/walrusStorageService';

const router = Router();

// Generate natal chart
router.post('/natal', async (req: Request, res: Response) => {
  try {
    const { 
      date, 
      time, 
      latitude, 
      longitude, 
      timezone, 
      personName,
      chartType = 'natal' 
    } = req.body;

    // Validate required fields
    if (!date || !time || !latitude || !longitude || !timezone || !personName) {
      return res.status(400).json({
        error: 'Missing required fields: date, time, latitude, longitude, timezone, personName'
      });
    }

    const birthDetails: BirthDetails = {
      date,
      time,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: parseFloat(timezone)
    };

    // Get chart data from Prokerala API
    const chartData = await prokeralaService.getFullChartData(birthDetails);

    // Generate chart image
    let chartResult;
    if (chartType === 'wheel') {
      chartResult = await chartGeneratorService.generateWheelChart(chartData, personName);
    } else {
      chartResult = await chartGeneratorService.generateNatalChart(chartData, personName);
    }

    // Generate frontend chart data
    const frontendChartData = chartGeneratorService.generateChartDataForFrontend(chartData, personName);

    // Return the chart data and image URL
    res.json({
      success: true,
      chartData,
      frontendChartData,
      imageUrl: chartResult.imagePath,
      metadata: chartResult.metadata
    });

  } catch (error) {
    console.error('Error generating natal chart:', error);
    res.status(500).json({
      error: 'Failed to generate natal chart',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get planetary positions
router.post('/planets', async (req: Request, res: Response) => {
  try {
    const { date, time, latitude, longitude, timezone } = req.body;

    if (!date || !time || !latitude || !longitude || !timezone) {
      return res.status(400).json({
        error: 'Missing required fields: date, time, latitude, longitude, timezone'
      });
    }

    const birthDetails: BirthDetails = {
      date,
      time,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: parseFloat(timezone)
    };

    const planets = await prokeralaService.getPlanetaryPositions(birthDetails);

    res.json({
      success: true,
      planets
    });

  } catch (error) {
    console.error('Error fetching planetary positions:', error);
    res.status(500).json({
      error: 'Failed to fetch planetary positions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get house positions
router.post('/houses', async (req: Request, res: Response) => {
  try {
    const { date, time, latitude, longitude, timezone } = req.body;

    if (!date || !time || !latitude || !longitude || !timezone) {
      return res.status(400).json({
        error: 'Missing required fields: date, time, latitude, longitude, timezone'
      });
    }

    const birthDetails: BirthDetails = {
      date,
      time,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: parseFloat(timezone)
    };

    const houseData = await prokeralaService.getHousePositions(birthDetails);

    res.json({
      success: true,
      ...houseData
    });

  } catch (error) {
    console.error('Error fetching house positions:', error);
    res.status(500).json({
      error: 'Failed to fetch house positions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get birth star
router.post('/birth-star', async (req: Request, res: Response) => {
  try {
    const { date, time, latitude, longitude, timezone } = req.body;

    if (!date || !time || !latitude || !longitude || !timezone) {
      return res.status(400).json({
        error: 'Missing required fields: date, time, latitude, longitude, timezone'
      });
    }

    const birthDetails: BirthDetails = {
      date,
      time,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: parseFloat(timezone)
    };

    const nakshatra = await prokeralaService.getBirthStar(birthDetails);

    res.json({
      success: true,
      nakshatra
    });

  } catch (error) {
    console.error('Error fetching birth star:', error);
    res.status(500).json({
      error: 'Failed to fetch birth star',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get compatibility
router.post('/compatibility', async (req: Request, res: Response) => {
  try {
    const { 
      kundli1, 
      kundli2 
    } = req.body;

    if (!kundli1 || !kundli2) {
      return res.status(400).json({
        error: 'Missing required fields: kundli1, kundli2'
      });
    }

    const compatibility = await prokeralaService.getCompatibility(kundli1, kundli2);

    res.json({
      success: true,
      compatibility
    });

  } catch (error) {
    console.error('Error fetching compatibility:', error);
    res.status(500).json({
      error: 'Failed to fetch compatibility',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get daily horoscope
router.get('/horoscope/:sign', async (req: Request, res: Response) => {
  try {
    const { sign } = req.params;
    const { date } = req.query;

    const horoscope = await prokeralaService.getDailyHoroscope(sign, date ? date as string : undefined);

    res.json({
      success: true,
      horoscope
    });

  } catch (error) {
    console.error('Error fetching horoscope:', error);
    res.status(500).json({
      error: 'Failed to fetch horoscope',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate chart with simplified input (auto-geocoding)
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      birthDate, 
      birthTime, 
      birthPlace, 
      latitude, 
      longitude, 
      timezone = 'UTC' 
    } = req.body;

    console.log('Chart generation request:', { name, birthDate, birthTime, birthPlace, latitude, longitude, timezone });

    // Validate required fields
    if (!name || !birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, birthDate, birthTime, birthPlace'
      });
    }

    let finalLatitude = latitude;
    let finalLongitude = longitude;

    // If coordinates not provided, geocode the place
    if (!latitude || !longitude) {
      console.log('Geocoding place:', birthPlace);
      const geocodingResult = await geocodingService.geocodePlace(birthPlace);
      if (!geocodingResult || !geocodingResult.success || !geocodingResult.data) {
        return res.status(400).json({
          success: false,
          error: 'Failed to geocode birth place'
        });
      }
      finalLatitude = geocodingResult.data.latitude;
      finalLongitude = geocodingResult.data.longitude;
      console.log('Geocoded coordinates:', { finalLatitude, finalLongitude });
    }

    // Convert birth details to Prokerala format
    const birthDetails: BirthDetails = {
      date: birthDate,
      time: birthTime,
      latitude: finalLatitude,
      longitude: finalLongitude,
      timezone: typeof timezone === 'string' ? parseTimezoneOffset(timezone) : timezone
    };

    console.log('Getting chart data from Prokerala...');
    // Get chart data from Prokerala API
    const chartData = await prokeralaService.getFullChartData(birthDetails);
    console.log('Chart data received from Prokerala');

    console.log('Generating chart image...');
    // Generate chart image and upload to Walrus
    const chartResult = await chartGeneratorService.generateNatalChart(chartData, name);
    console.log('Chart image generated and uploaded to Walrus:', chartResult.imagePath);

    console.log('Generating frontend chart data...');
    // Generate frontend chart data (this also generates an image)
    const frontendChartData = await chartGeneratorService.generateChartDataForFrontend(chartData, name);
    console.log('Frontend chart data generated with image:', frontendChartData.chartImageUrl);

    // Use the image from chartResult (from generateNatalChart) as the primary image
    const primaryImageUrl = chartResult.imagePath;

    // Simple response structure
    const responseData = {
      success: true,
      data: {
        // Basic info
        personName: name,
        ascendant: chartData.ascendant,
        nakshatra: chartData.nakshatra,
        
        // Chart image URL (the most important part!)
        chartImageUrl: primaryImageUrl,
        
        // Chart metadata
        metadata: {
          chartId: chartResult.metadata.chartId,
          chartImageUrl: primaryImageUrl,
          walrusFileId: chartResult.metadata.walrusFileId,
          fileName: chartResult.metadata.fileName
        },
        
        // Planet and house data for frontend display
        planets: chartData.planets,
        houses: chartData.houses,
        
        // Birth details
        birthDetails: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          latitude: finalLatitude,
          longitude: finalLongitude,
          timezone
        },
        
        generatedAt: new Date().toISOString()
      },
      message: 'Chart generated successfully with image uploaded to Walrus'
    };

    console.log('Sending response with chart image URL:', primaryImageUrl);
    res.json(responseData);

  } catch (error) {
    console.error('Error generating chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate chart',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Store NFT metadata
router.post('/metadata', async (req: Request, res: Response) => {
  try {
    const metadata = req.body;

    // Validate metadata
    if (!metadata.name || !metadata.description || !metadata.image) {
      return res.status(400).json({
        success: false,
        error: 'Missing required metadata fields: name, description, image'
      });
    }

    // Upload metadata to Walrus
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const uploadResult = await walrusStorage.uploadFile(
      metadataBuffer,
      `nft-metadata-${Date.now()}.json`,
      'application/json',
      {
        type: 'nft-metadata',
        uploadedAt: new Date().toISOString()
      }
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload metadata');
    }

    res.json({
      success: true,
      data: {
        metadataUrl: uploadResult.file?.url
      }
    });

  } catch (error) {
    console.error('Error storing NFT metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store NFT metadata',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to parse timezone offset
function parseTimezoneOffset(timezone: string): number {
  if (timezone === 'UTC') return 0;
  
  const match = timezone.match(/UTC([+-])(\d{1,2}):?(\d{2})?/);
  if (match) {
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2]);
    const minutes = match[3] ? parseInt(match[3]) : 0;
    return sign * (hours + minutes / 60);
  }
  
  return 0; // Default to UTC
}

export { router as chartRoutes }; 