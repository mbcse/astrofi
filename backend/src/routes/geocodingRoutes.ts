import express from 'express'
import { geocodingService } from '../services/geocodingService'

const router = express.Router()

/**
 * Geocode a place name to get coordinates
 * GET /api/geocoding/geocode?place=placeName
 */
router.get('/geocode', async (req, res) => {
  try {
    const { place } = req.query

    if (!place || typeof place !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Place parameter is required'
      })
    }

    const result = await geocodingService.geocodePlace(place)

    if (result) {
      res.json({
        success: true,
        data: result
      })
    } else {
      res.status(404).json({
        success: false,
        error: 'Place not found'
      })
    }
  } catch (error) {
    console.error('Error in geocoding route:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export default router 