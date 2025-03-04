/*
 * Copyright (c) 2022, OSF Digital
 */

// This class allows integration with OCAPI Stores Resource
// https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Baskets.html
// This implementations coverts SCAPI requests to OCAPI requests as there are fundamental differences between the APIS
// One major difference is OCAPI uses snake_case and CAPI uses camelCase for this reaso you will see a utility function in here that convert
// from camelCase to snake_case - camelCaseKeysToUnderscore
// createOcapiFetch is another utility function that returns the response from OCAPI in the fromat returned from CAPI
// Another utility function - checkRequiredParameters is used to check if the parameters or body objects necessary for a call are
// present in the request before making itp

import {createOcapiFetch} from './utils'

class OcapiStores {
    constructor(config) {
        this.config = config
        this.fetch = createOcapiFetch(config)
    }

    /**
     * @function getAllStores
     * @description Function that fetches all available stores
     * @returns Array of objects (each object describes a store)
     */
    async getAllStores(params) {
        let stores = await this.fetch(
            `stores?latitude=${params.latitude}&longitude=${params.longitude}&max_distance=20000&delivery_method=delivery&client_id=${this.config.parameters.clientId}&start=${params.start}&count=${params.count}`,
            'GET',
            [params],
            'getAllStores'
        )

        return stores.data || []
    }

    /**
     * @function getStoresNearUser
     * @description Function that will fetches all stores near to the user
     * @param String latitude -> user's current latitude
     * @param String longitude -> user's current longitude
     * @returns Array of objects (each object describes a store)
     */
    async getStoresNear(params) {
        let stores = await this.fetch(
            `stores?latitude=${params.latitude}&longitude=${params.longitude}&client_id=${this.config.parameters.clientId}&max_distance=${params.distance}&delivery_method=delivery&start=0&count=200`,
            'GET',
            [params],
            'getStoresNear'
        )
        return stores.data || []
    }

    /**
     * @function getStoresNearUser
     * @description Function that will fetches all stores near to the user
     * @param String latitude -> user's current latitude
     * @param String longitude -> user's current longitude
     * @returns Array of objects (each object describes a store)
     */
    async getStore(params) {
        let store = await this.fetch(
            `stores/${params.storeId}?client_id=${this.config.parameters.clientId}`,
            'GET',
            [params],
            'getStore'
        )

        // eslint-disable-next-line no-prototype-builtins
        if (store && store.hasOwnProperty('c_contentAssetID')) {
            let contentAsset = await this.fetch(
                `content/${store.c_contentAssetID}?client_id=${this.config.parameters.clientId}`,
                'GET',
                [params],
                'getStore'
            )

            store['contentAssetBody'] = contentAsset.c_body
            store['contentAssetName'] = contentAsset.name
        }
        return store || {}
    }

    /**
    * Fetches a content asset from the Commerce API
    * @param {Object} params - Parameters to pass to the API
    * @param {string} params.contentAssetId - The ID of the content asset to fetch
    * @returns {string} - The content asset, or an empty string if not found
    */
    async getContentAsset(params) {
        let contentAsset = await this.fetch(
            `content/${params.contentAssetId}?client_id=${this.config.parameters.clientId}`,
            'GET',
            [params],
            'getContentAsset'
        )

        return contentAsset.c_body || ''
    }

    /**
    * Sets the store search query
    * @param {Object} params - the parameters object
    * @returns {Array} - an array of store search hits
    */
    async setStoreSearch(params) {
        const body = {
            "query": {
                "bool_query": {
                    "must": [
                        {
                            "term_query": {
                                "fields": ["c_" + params.groupID],
                                "operator": "is",
                                "values": [true]
                            }
                        }
                    ]
                }
            },
            "select": "(**)",
            "expand": [params.groupType],
            "count" : 50,
            "start" : params.start
        }

        const response = await this.fetch(
            `store_search`,
            'POST',
            [params],
            'setStoreSearch',
            body
        )

        if (response) {
            return response || []
        }
    }

    /**
    * Fetches a custom object from the OCC API
    * @param {Object} params - parameters for the custom object
    * @param {string} params.objectType - the type of custom object
    * @param {string} params.key - the key of the custom object
    * @returns {Object} - the custom object response
    */
    async getClientSecret(params) {
        const response = await this.fetch (
            `custom_objects/OCAPIClients/${this.config.parameters.clientId}?client_id=${this.config.parameters.clientId}`,
            'GET',
            [params],
            'getCustomObject'
        )
        return response.c_clientSecret || {}
    }
}

export default OcapiStores
