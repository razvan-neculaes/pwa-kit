/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useContext, useMemo} from 'react'
import {CommonInfoContext} from '../contexts'
import {useIntl} from 'react-intl'
import useMultiSite from '../../hooks/use-multi-site'

const storeLink = {
    fr: 'boutique',
    en: 'store',
    de: 'geschaft',
    es: 'tienda',
    nl: 'winkel'
}

const storesLink = {
    fr: 'boutiques',
    en: 'stores',
    de: 'geschafte',
    es: 'tiendas',
    nl: 'winkels'
}

export default function useCommonInfo() {
    const intl = useIntl()
    const {site} = useMultiSite()
    const {l10n} = site
    const {commonInfo, setCommonInfo: _setCommonInfo} = useContext(CommonInfoContext)

    const setCommonInfo = (data) => {
        _setCommonInfo(data)
    }

    const self = useMemo(() => {
        return {
            ...commonInfo,

            setCity(val) {
                setCommonInfo({
                    ...commonInfo,
                    city: val
                })
            },
            getCity() {
                return commonInfo.city
            },
            getLanguage() {
                return l10n?.supportedLocales.find((item) => item.id == intl.locale).alias
            },
            getStoreLink() {
                return storeLink[intl.locale]
            },
            getStoresLink() {
                return storesLink[intl.locale]
            },
            setStoresData(val) {
                setCommonInfo({...commonInfo, stores: val})
            },
            getStoresData() {
                return commonInfo.stores
            },
            clearCommonInfo() {
                setCommonInfo({city: null, stores: null})
            },
            setFilters(val) {
                setCommonInfo({...commonInfo, filters: val})
            },
            getFilters() {
                return commonInfo.filters
            },
            setStoreImages(val) {
                setCommonInfo({...commonInfo, images: val})
            },
            getStoreImages() {
                return commonInfo.filters
            }
        }
    }, [commonInfo, setCommonInfo, intl, l10n])

    return self
}
