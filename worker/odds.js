'use strict'

const axios = require('axios')

const BASE_URL = 'https://api.the-odds-api.com/v4'

// Sports to poll — add more here
const SPORTS = [
  'basketball_nba',
  // 'americanfootball_nfl',
]

let requestsUsed = 0
let requestsRemaining = null

/**
 * Fetch odds for a sport from The-Odds-API
 * @param {string} sport
 * @returns {Promise<{events: any[], requestsRemaining: number}>}
 */
async function fetchOdds(sport) {
  const apiKey = process.env.ODDS_API_KEY
  if (!apiKey) throw new Error('ODDS_API_KEY is not set')

  const response = await axios.get(`${BASE_URL}/sports/${sport}/odds`, {
    params: {
      apiKey,
      regions: 'us',
      markets: 'h2h,spreads,totals',
      oddsFormat: 'american',
      dateFormat: 'iso',
    },
  })

  // Track API usage from response headers
  const remaining = parseInt(response.headers['x-requests-remaining'] ?? '0')
  const used = parseInt(response.headers['x-requests-used'] ?? '0')
  requestsRemaining = remaining
  requestsUsed = used

  return {
    events: response.data,
    requestsRemaining: remaining,
    requestsUsed: used,
  }
}

function getApiUsage() {
  return { requestsUsed, requestsRemaining }
}

module.exports = { fetchOdds, getApiUsage, SPORTS }
