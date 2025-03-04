const xml2js = require('xml2js')
const axios = require('axios')

/**
 * Retrieves the store sitemap
 * @returns {Object} - the sitemap object
 */
async function getStoreSiteMap(req, res) {
    let host

    const storeLocatorHosts = {
        IKKS_PROD_HOST: 'stores.ikks.com',
        IKKS_STG_HOST: 'stg-stores.ikks.com',
        IKKS_DEV_HOST: 'ikks-storelocator-osf-qa-ikks.mobify-storefront.com',
        ICODE_PROD_HOST: 'stores.icode.fr',
        ICODE_STG_HOST: 'stg-stores.icode.fr',
        ICODE_DEV_HOST: 'ikks-storelocator-osf-qa-icode.mobify-storefront.com',
    }

    const hosts = {
        PROD_HOST: 'www.ikks.com',
        STG_HOST: 'www.ikks.com',
        DEV_HOST: 'dev2.ikks.com',
    }

    let storeLocatorHost = req.headers.host

    if (
        storeLocatorHost === storeLocatorHosts.IKKS_PROD_HOST ||
        storeLocatorHost === storeLocatorHosts.ICODE_PROD_HOST
    ) {
        host = hosts.PROD_HOST
    } else if (
        storeLocatorHost === storeLocatorHosts.IKKS_STG_HOST ||
        storeLocatorHost === storeLocatorHosts.ICODE_STG_HOST
    ) {
        host = hosts.STG_HOST
    } else {
        host = hosts.DEV_HOST
    }

    const endpoint = `https://${host}/storeSiteMap`

    try {
        const response = await axios.get(endpoint, {
            params: {
                sitemapName: storeLocatorHost.indexOf('icode') > -1 ? 'icode' : 'ikks',
            },
        })

        const storeSiteMapsObj = response.data.storeSiteMapsObj

        const builder = new xml2js.Builder()

        const xmlObj = {
            urlset: {
                $: {
                    xmlns: 'https://www.sitemaps.org/schemas/sitemap/0.9',
                    'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
                }
            }
        }

        Object.assign(xmlObj.urlset, storeSiteMapsObj)

        const xml = builder.buildObject(xmlObj)

        res.set('Content-Type', 'application/xml')
        res.send(xml)
    } catch (error) {
        const details = JSON.stringify(error)
        console.error(details)
        return res
            .status(500)
            .send(`Error retrieving sitemap data: ${error}. Error Details: ${details}`)
    }
}

module.exports = {
    getStoreSiteMap,
}
