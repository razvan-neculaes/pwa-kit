/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {ChakraProvider} from '@chakra-ui/react'

// Removes focus for non-keyboard interactions for the whole application
import 'focus-visible/dist/focus-visible'
import GlobalCss from '../../theme/global-css'
import theme from '../../theme'
import { themeIKKS, themeICODE } from '../../theme'
import CommerceAPI from '../../commerce-api'
import {
    SitePreferencesProvider,
    CommonInfoProvider,
    SiteCodeProvider,
    CommerceAPIProvider,
    CustomerProductListsProvider,
    CustomerProvider
} from '../../commerce-api/contexts'
import {MultiSiteProvider} from '../../contexts'
import {resolveSiteFromUrl} from '../../utils/site-utils'
import {resolveLocaleFromUrl} from '../../utils/utils'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {createUrlTemplate} from '../../utils/url'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'

/**
 * Use the AppConfig component to inject extra arguments into the getProps
 * methods for all Route Components in the app – typically you'd want to do this
 * to inject a connector instance that can be used in all Pages.
 *
 * You can also use the AppConfig to configure a state-management library such
 * as Redux, or Mobx, if you like.
 */
const AppConfig = ({children, locals = {}}) => {
    const [customer, setCustomer] = useState(null)
    const [siteCode, setSiteCode] = useState(null)
    const [commonInfo, setCommonInfo] = useState({city: null, langauge: null})
    const [sitePref, setSitePref] = useState(null)

    console.log(`Initialization ... SiteID: ${locals.site.id} SiteCode: ${siteCode}`)

    const _theme = siteCode === 'IKKS' ? themeIKKS : themeICODE

    return (
        <MultiSiteProvider site={locals.site} locale={locals.locale} buildUrl={locals.buildUrl}>
            <CommerceAPIProvider value={locals.api}>
                <CustomerProvider value={{customer, setCustomer}}>
                    <SitePreferencesProvider value={{sitePref, setSitePref}}>
                        {/* <BasketProvider value={{basket, setBasket}}> */}
                            <CommonInfoProvider value={{commonInfo, setCommonInfo}}>
                                <SiteCodeProvider value={{siteCode, setSiteCode}}>
                                    <CustomerProductListsProvider>
                                        <ChakraProvider theme={_theme}>
                                            <GlobalCss />
                                            {children}
                                        </ChakraProvider>
                                    </CustomerProductListsProvider>
                                </SiteCodeProvider>
                            </CommonInfoProvider>
                        {/* </BasketProvider> */}
                    </SitePreferencesProvider>
                </CustomerProvider>
            </CommerceAPIProvider>
        </MultiSiteProvider>
    )
}

AppConfig.restore = (locals = {}) => {
    const path =
        typeof window === 'undefined'
            ? locals.originalUrl
            : `${window.location.pathname}${window.location.search}`
    const site = resolveSiteFromUrl(path)
    const locale = resolveLocaleFromUrl(path)
    const currency = locale.preferredCurrency

    const {app: appConfig} = getConfig()
    const apiConfig = {
        ...appConfig.commerceAPI,
        einsteinConfig: appConfig.einsteinAPI
    }

    apiConfig.parameters.siteId = site.id

    locals.api = new CommerceAPI({...apiConfig, locale: locale.id, currency})
    locals.buildUrl = createUrlTemplate(appConfig, site.alias || site.id, locale.id)
    locals.site = site
    locals.locale = locale
    locals.test = getAppOrigin()
}

AppConfig.freeze = () => undefined

AppConfig.extraGetPropsArgs = (locals = {}) => {
    return {
        api: locals.api,
        buildUrl: locals.buildUrl,
        site: locals.site,
        locale: locals.locale
    }
}

AppConfig.propTypes = {
    children: PropTypes.node,
    locals: PropTypes.object
}

export default AppConfig
