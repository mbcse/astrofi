import express, { Router, Request, Response } from 'express'
import { walrusStorage, WalrusFile } from '../services/walrusStorageService'

const router = Router()

/**
 * Upload a file to Walrus storage
 * POST /api/walrus/upload
 */
router.post('/upload', async (req, res) => {
  try {
    const { fileData, fileName, fileType, metadata } = req.body

    if (!fileData || !fileName || !fileType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fileData, fileName, fileType'
      })
    }

    // Convert base64 data to buffer
    const fileBuffer = Buffer.from(fileData, 'base64')

    const result = await walrusStorage.uploadFile(
      fileBuffer,
      fileName,
      fileType,
      metadata
    )

    if (result.success && result.file) {
      res.json({
        success: true,
        file: result.file
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Upload failed'
      })
    }
  } catch (error) {
    console.error('Error in upload route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Download a file from Walrus storage
 * GET /api/walrus/download/:fileId
 */
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      })
    }

    const result = await walrusStorage.downloadFile(fileId)

    if (result.success && result.data) {
      res.setHeader('Content-Type', 'application/octet-stream')
      res.setHeader('Content-Disposition', `attachment; filename="${fileId}"`)
      res.send(result.data)
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'File not found'
      })
    }
  } catch (error) {
    console.error('Error in download route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Get file metadata from Walrus storage
 * GET /api/walrus/metadata/:fileId
 */
router.get('/metadata/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    const metadataResponse = await walrusStorage.getFileMetadata(fileId);
    if (!metadataResponse.success) {
      return res.status(404).json({ error: metadataResponse.error || 'File not found' });
    }

    res.json({
      success: true,
      metadata: metadataResponse.metadata
    });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
})

/**
 * Delete a file from Walrus storage
 * DELETE /api/walrus/delete/:fileId
 */
router.delete('/delete/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      })
    }

    const result = await walrusStorage.deleteFile(fileId)

    if (result.success) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Delete failed'
      })
    }
  } catch (error) {
    console.error('Error in delete route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Upload birth chart data
 * POST /api/walrus/birth-chart
 */
router.post('/birth-chart', async (req, res) => {
  try {
    const { chartData, userId, fileName } = req.body

    if (!chartData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: chartData, userId'
      })
    }

    const result = await walrusStorage.uploadBirthChart(
      chartData,
      userId,
      fileName
    )

    if (result.success && result.file) {
      res.json({
        success: true,
        file: result.file
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Upload failed'
      })
    }
  } catch (error) {
    console.error('Error in birth chart upload route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Upload astrologer profile
 * POST /api/walrus/astrologer-profile
 */
router.post('/astrologer-profile', async (req, res) => {
  try {
    const { profileData, userId, fileName } = req.body

    if (!profileData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: profileData, userId'
      })
    }

    const result = await walrusStorage.uploadAstrologerProfile(
      profileData,
      userId,
      fileName
    )

    if (result.success && result.file) {
      res.json({
        success: true,
        file: result.file
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Upload failed'
      })
    }
  } catch (error) {
    console.error('Error in astrologer profile upload route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Upload prediction data
 * POST /api/walrus/prediction
 */
router.post('/prediction', async (req, res) => {
  try {
    const { predictionData, userId, predictionId, fileName } = req.body

    if (!predictionData || !userId || !predictionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: predictionData, userId, predictionId'
      })
    }

    const result = await walrusStorage.uploadPrediction(
      predictionData,
      userId,
      predictionId,
      fileName
    )

    if (result.success && result.file) {
      res.json({
        success: true,
        file: result.file
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Upload failed'
      })
    }
  } catch (error) {
    console.error('Error in prediction upload route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Upload NFT metadata
 * POST /api/walrus/nft-metadata
 */
router.post('/nft-metadata', async (req, res) => {
  try {
    const { metadata, tokenId, userId, fileName } = req.body

    if (!metadata || !tokenId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: metadata, tokenId, userId'
      })
    }

    const result = await walrusStorage.uploadNFTMetadata(
      metadata,
      tokenId,
      userId,
      fileName
    )

    if (result.success && result.file) {
      res.json({
        success: true,
        file: result.file
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Upload failed'
      })
    }
  } catch (error) {
    console.error('Error in NFT metadata upload route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * Handle OPTIONS preflight requests for file serving
 * OPTIONS /api/walrus/files/:fileId
 */
router.options('/files/:fileId', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.status(200).end();
});

/**
 * Serve a file from Walrus storage with proper content type
 * GET /api/walrus/files/:fileId
 */
router.get('/files/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    console.log('Serving file from Tusky storage:', fileId);

    // Get file metadata first
    const metadataResponse = await walrusStorage.getFileMetadata(fileId);
    if (!metadataResponse.success || !metadataResponse.metadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Download file using Tusky SDK
    const downloadResponse = await walrusStorage.downloadFile(fileId);
    if (!downloadResponse.success || !downloadResponse.data) {
      return res.status(500).json({ error: 'Failed to download file' });
    }

    // Set comprehensive CORS and caching headers
    const metadata = metadataResponse.metadata;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', downloadResponse.data.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Send the file
    res.send(downloadResponse.data);
  } catch (error) {
    console.error('Error serving file from Tusky storage:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router 