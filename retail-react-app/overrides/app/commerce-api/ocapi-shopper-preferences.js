import {createOcapiFetch} from './utils'

class OcapiShopperPreferences {
    constructor(config) {
        this.config = config
        this.fetch = createOcapiFetch(config)
    }
    async getPreferences(...args) {
        return await this.fetch(`content/site-pref`, 'GET', args, 'getPreferences')
    }
}

export default OcapiShopperPreferences
