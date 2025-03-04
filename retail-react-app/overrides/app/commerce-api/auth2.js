import fetch from 'cross-fetch'
import { Buffer } from "buffer"
import { getTenantId } from './utils'

const savedToken = {
    accessToken: '',
    expiresAt: ''
}

/**
* Fetches the access token from Demandware OAuth2 API
* @param {Object} config - Configuration object containing organizationId, clientId and clientSecret
* @returns {Object} - An object containing accessToken and expiresIn fields
*/
const getAccessToken = async (config, clientSecret) => {
    const credentials = {
        tenantId: getTenantId(config.organizationId),
        clientId: config.clientId,
        clientSecret: clientSecret
    }

    const fetchURL = new URL('https://account.demandware.com/dwsso/oauth2/access_token')

    fetchURL.search = new URLSearchParams({
        grant_type: 'client_credentials',
        scope: `SALESFORCE_COMMERCE_API:${credentials.tenantId}`
    }).toString()

    const response = await fetch(fetchURL.toString(), {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${credentials.clientId}:${credentials.clientSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })

    let resJson = null
    if (response.json) {
        resJson = await response.json()
    }

    if (!response.ok) {
        if (resJson) {
            console.trace(resJson)
        }

        return {accessToken: null, error: 'Failed to get the access token.'}
    }

    return {accessToken: resJson.access_token, expiresIn: resJson.expires_in}
}

/**
* Sets the access token and expiration date for the tokenData object
* @param {Object} accessToken - the access token
* @param {Number} expiresIn - the number of seconds until the token expires
* @param {Object} tokenData - the object containing the access token and expiration date
*/
const saveAccessToken = ({accessToken, expiresIn, tokenData}) => {
    const currentDate = new Date()
    const delay = 60

    tokenData.accessToken = accessToken
    tokenData.expiresAt = new Date(currentDate.getTime() + 1000 * (expiresIn - delay))
}

/**
* Checks if the given token has expired
* @param {Object} tokenData - the token data object
* @returns {boolean} - true if the token has expired, false otherwise
*/
const isTokenExpired = (tokenData) => {
    if (!tokenData.expiresAt) {
        return false
    }

    const currentDate = new Date()
    const tokenExpirationDate = new Date(tokenData.expiresAt)
    const isExpired = currentDate.getTime() >= tokenExpirationDate.getTime()

    return isExpired
}

/**
* Clears the token data
* @param {Object} tokenData - the token data object
*/
const deleteToken = (tokenData) => {
    tokenData.accessToken = ''
    tokenData.expiresAt = ''
}

/**
* Checks if token is expired and deletes it if necessary
* @param {Object} tokenData - the token data object
* @returns {Object} - the token data object
*/
const getSavedToken = (tokenData) => {
    const isExpired = isTokenExpired(tokenData)

    if (isExpired) {
        deleteToken(tokenData)
    }

    return tokenData
}

/**
* Asynchronous function to get access token
* @param {Object} config - configuration object
* @returns {Object} tokenData - object containing access token and expiry time
*/
export const getToken = async (config, clientSecret) => {
    const tokenData = getSavedToken(savedToken)

    if (!tokenData.accessToken) {
        const {accessToken, expiresIn} = await getAccessToken(config, clientSecret)

        saveAccessToken({accessToken, expiresIn, tokenData})
    }

    return tokenData
}
