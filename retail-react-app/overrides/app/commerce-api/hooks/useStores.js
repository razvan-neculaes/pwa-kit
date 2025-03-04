/*
 * Copyright (c) 2022, OSF Digital
 */
import {useCommerceAPI} from '../contexts'

const useStores = () => {
    const api = useCommerceAPI()

    return {
        api: api.shopperStores,

        async getAllStores(params) {
            return await api.shopperStores.getAllStores(params)
        },
        async getStoresNear(params) {
            return await api.shopperStores.getStoresNear(params)
        },
        async getStore(params) {
            return await api.shopperStores.getStore(params)
        },
        async setStoreSearch(params) {
            return await api.shopperStores.setStoreSearch(params)
        },
        async getClientSecret(params) {
            return await api.shopperStores.getClientSecret(params)
        },
        async getContentAsset(params) {
            return await api.shopperStores.getContentAsset(params)
        }
    }
}

export default useStores
