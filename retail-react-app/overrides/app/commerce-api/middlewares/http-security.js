const axios = require('axios')
const helmet = require('helmet')
const {isRemote} = require('pwa-kit-runtime/utils/ssr-server')
const {getConfig} = require('pwa-kit-runtime/utils/ssr-config')
const {createOcapiFetch} = require('../utils')

/**
 * Retrieves the client credentials from the OCAPIClients custom object.
 *
 * @returns {Promise<{clientId: string, clientSecret: string}>} The client credentials.
 */
async function getCredentials() {
    const config = getConfig()
    const clientId = config.app.commerceAPI.parameters.clientId

    const fetch = createOcapiFetch(config.app.commerceAPI)
    const response = await fetch(
        `custom_objects/OCAPIClients/${clientId}?client_id=${clientId}`,
        'GET',
        [{headers: ''}],
        'getCustomObject'
    )

    return {
        clientId: clientId,
        clientSecret: response?.c_clientSecret,
    }
}

/**
 * Retrieves the default directives for Content Security Policy (CSP) based on the provided isRemote flag.
 *
 * @param {boolean} isRemote - Flag indicating whether the directives should include 'upgrade-insecure-requests' or not.
 * @returns {Object} The default directives for CSP.
 */
function getDefaultDirectives(isRemote) {
    return {
        'img-src': ["'self'", 'https:', 'data:'],
        'script-src': [
            "'self'",
            'http://maps.googleapis.com',
            'storage.googleapis.com',
            'https://cdn.cookielaw.org',
            'https://account.demandware.com',
            "'unsafe-eval'",
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com/',
            'https://cdn.cookielaw.org',
            'https://account.demandware.com',
            "'unsafe-inline'",
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com/',
            'https://cdn.cookielaw.org',
            'https://account.demandware.com',
            'https://region1.google-analytics.com',
        ],
        'connect-src': [
            "'self'",
            'http://maps.googleapis.com',
            'storage.googleapis.com',
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com/',
            'https://cdn.cookielaw.org',
            'https://cdn.cookielaw.org/',
            'https://geolocation.onetrust.com',
            'https://privacyportal-fr.onetrust.com',
            'https://account.demandware.com',
            'https://region1.google-analytics.com',
        ],
        'upgrade-insecure-requests': isRemote ? [] : null,
    }
}

/**
 * Sets the Content Security Policy (CSP) and HTTP Strict Transport Security (HSTS) headers based on the provided request and response objects.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
async function setContentSecurityPolicy(req, res, next) {
    let host
    let instanceType

    const credentials = await getCredentials()

    const instanceTypes = {
        PROD: 'production',
        STG: 'staging',
        DEV: 'development',
    }

    const storeLocatorHosts = {
        IKKS_PROD_HOST: 'stores.ikks.com',
        IKKS_STG_HOST: 'stg-stores.ikks.com',
        IKKS_DEV_HOST: 'ikks-storelocator-osf-qa-ikks.mobify-storefront.com',
        ICODE_PROD_HOST: 'stores.icode.fr',
        ICODE_STG_HOST: 'stg-stores.icode.fr',
        ICODE_DEV_HOST: 'ikks-storelocator-osf-qa-icode.mobify-storefront.com',
    }

    const hosts = {
        PROD_HOST: 'production-eu02-ikks.demandware.net',
        STG_HOST: 'staging-eu02-ikks.demandware.net',
        DEV_HOST: 'development-eu02-ikks.demandware.net',
    }

    let storeLocatorHost = req.headers.host

    if (
        storeLocatorHost === storeLocatorHosts.IKKS_PROD_HOST ||
        storeLocatorHost === storeLocatorHosts.ICODE_PROD_HOST
    ) {
        host = hosts.PROD_HOST
        instanceType = instanceTypes.PROD
    } else if (
        storeLocatorHost === storeLocatorHosts.IKKS_STG_HOST ||
        storeLocatorHost === storeLocatorHosts.ICODE_STG_HOST
    ) {
        host = hosts.STG_HOST
        instanceType = instanceTypes.STG
    } else {
        host = hosts.DEV_HOST
        instanceType = instanceTypes.DEV
    }

    const oauth2Endpoint = 'https://account.demandware.com/dwsso/oauth2/access_token'
    const oauth2Data = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: credentials.clientId,
            password: credentials.clientSecret,
        },
    }

    let accessToken

    try {
        const response = await axios.post(
            oauth2Endpoint,
            {grant_type: 'client_credentials'},
            oauth2Data
        )
        const data = response.data
        accessToken = data.access_token
    } catch (error) {
        throw new Error('Error while fetching access token' + error)
    }

    const group_id = 'StoreLocator'
    const preference_id = 'StoreLocator_ContentSecurityPolicyDirectives'
    const endpoint = `https://${host}/s/-/dw/data/v21_3/site_preferences/preference_groups/${group_id}/${instanceType}/preferences/${preference_id}`

    try {
        const response = await axios.get(endpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
        const data = response?.data

        const directivesJSON = data?.site_values?.IKKS_COM

        if (directivesJSON) {
            const directives = JSON.parse(directivesJSON)

            helmet({
                contentSecurityPolicy: {
                    useDefaults: true,
                    directives: {
                        'img-src': directives['img-src'],
                        'script-src': directives['script-src'],
                        'connect-src': directives['connect-src'],
                        'upgrade-insecure-requests': isRemote() ? [] : null,
                    },
                },
                hsts: isRemote(),
            })
        } else {
            const defaultDirectives = getDefaultDirectives(isRemote())
            console.log(
                'The directives could not be found on B2C Commerce Cloud. The default directives are loaded.',
                defaultDirectives
            )

            helmet({
                contentSecurityPolicy: {
                    useDefaults: true,
                    directives: defaultDirectives,
                },
                hsts: isRemote(),
            })
        }
    } catch (error) {
        console.error(
            'Error when trying to retrieve the directives from B2C Commerce Cloud: ' +
                JSON.stringify(error)
        )

        const defaultDirectives = getDefaultDirectives(isRemote())

        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: defaultDirectives,
            },
            hsts: isRemote(),
        })
    }

    next()
}

module.exports = {
    setContentSecurityPolicy,
}
