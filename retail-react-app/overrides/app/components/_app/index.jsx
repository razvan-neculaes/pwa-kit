/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState, useEffect, useMemo} from 'react'
import PropTypes from 'prop-types'
import {useHistory, useLocation} from 'react-router-dom'
import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'

// Chakra
import {Box, useDisclosure, useStyleConfig} from '@chakra-ui/react'
import {SkipNavLink, SkipNavContent} from '@chakra-ui/skip-nav'

// Local Project Components
import Header from '../../components/header'
import OfflineBanner from '../../components/offline-banner'
import OfflineBoundary from '../../components/offline-boundary'
import ScrollToTop from '../../components/scroll-to-top'
import Footer from '../../components/footer'

// Hooks
import useShopper from '../../commerce-api/hooks/useShopper'
import useMultiSite from '../../hooks/use-multi-site'
import useSitePreferences from '../../commerce-api/hooks/useSitePreferences'

// Localization
import {IntlProvider} from 'react-intl'

// Others
import {watchOnlineStatus, flatten} from '../../utils/utils'
import {getTargetLocale, fetchTranslations} from '../../utils/locale'
import {DEFAULT_SITE_TITLE, HOME_HREF, THEME_COLOR} from '../../constants'
import Seo from '../seo'
import {resolveSiteFromUrl} from '../../utils/site-utils'
import TagManager from 'react-gtm-module'

const DEFAULT_LOCALE = 'en-US'

// import '@formatjs/intl-locale/polyfill';

import oneTrust from '../../utils/oneTrust/oneTrust'

const App = (props) => {
    const {
        children,
        targetLocale = DEFAULT_LOCALE,
        messages = {},
        phoneNumbers,
        siteName,
        gtmenabled,
        gtmCodeAnalitycs,
        gtmCodeExternal,
        oneTrustEnabled,
        ikksOneTrustID,
        icodeOneTrustID,
        preferences
    } = props

    const appOrigin = getAppOrigin()
    const history = useHistory()
    const location = useLocation()
    const sitePrefs = useSitePreferences()
    const {site, locale, buildUrl} = useMultiSite()
    const [isOnline, setIsOnline] = useState(true)
    const styles = useStyleConfig('App')
    const {onClose} = useDisclosure()

    // Used to conditionally render header/footer for checkout page
    const isCheckout = /\/checkout$/.test(location?.pathname)

    const {l10n} = site
    // Get the current currency to be used through out the app
    const currency = locale.preferredCurrency || l10n.defaultCurrency

    const oneTrustData = useMemo(() => {
        if (oneTrustEnabled) {
            return {
                isIKKS: siteName === 'ikks',
                ikksOneTrustID,
                icodeOneTrustID,
                oneTrustEnabled
            }
        }
        return {oneTrustEnabled}
    }, [oneTrustEnabled, ikksOneTrustID, icodeOneTrustID])

    // Set up customer and basket
    useShopper({currency})

    useEffect(_ => {
        if (preferences) {
            sitePrefs.setSitePreferences(preferences)
        }

        // Listen for online status changes.
        watchOnlineStatus((isOnline) => {
            setIsOnline(isOnline)
        })

        // Initialize Google Tag Manager and set page view data layers
        if (gtmenabled) {
            TagManager.initialize({
                gtmId: gtmCodeAnalitycs
            })
            TagManager.initialize({
                gtmId: gtmCodeExternal
            })
        }
    }, [])

    useEffect(() => {
        // Lets automatically close the mobile navigation when the
        // location path is changed.
        onClose()
    }, [location])

    useEffect(() => {
        oneTrust(oneTrustData);
    }, [oneTrustData])

    const onLogoClick = () => {
        // Goto the home page.
        const path = buildUrl(HOME_HREF)

        history.push(path)

        // Close the drawer.
        onClose()
    }

    return (
        <Box className="sf-app" {...styles.container}>
            <IntlProvider
                onError={(err) => {
                    if (err.code === 'MISSING_TRANSLATION') {
                        // NOTE: Remove the console error for missing translations during development,
                        // as we knew translations would be added later.
                        console.warn('Missing translation', err.message)
                        return
                    }
                    throw err
                }}
                locale={targetLocale}
                messages={messages}
                // For react-intl, the _default locale_ refers to the locale that the inline `defaultMessage`s are written for.
                // NOTE: if you update this value, please also update the following npm scripts in `template-retail-react-app/package.json`:
                // - "extract-default-translations"
                // - "compile-translations:pseudo"
                defaultLocale={DEFAULT_LOCALE}
            >
                        <Seo>
                            <meta name="theme-color" content={THEME_COLOR} />
                            <meta name="apple-mobile-web-app-title" content={DEFAULT_SITE_TITLE} />

                            <link
                                rel="apple-touch-icon"
                                href={getAssetUrl('static/img/global/apple-touch-icon.png')}
                            />
                            <link rel="manifest" href={getAssetUrl('static/manifest.json')} />
                            {/* Urls for all localized versions of this page (including current page)
                            For more details on hrefLang, see https://developers.google.com/search/docs/advanced/crawling/localized-versions */}
                            {site.l10n?.supportedLocales.map((locale) => (
                                <link
                                    rel="alternate"
                                    hrefLang={locale.id.toLowerCase()}
                                    href={`${appOrigin}${buildUrl(location.pathname)}`}
                                    key={locale.id}
                                />
                            ))}
                            {/* A general locale as fallback. For example: "en" if default locale is "en-GB" */}
                            <link
                                rel="alternate"
                                hrefLang={site.l10n.defaultLocale.slice(0, 2)}
                                href={`${appOrigin}${buildUrl(location.pathname)}`}
                            />
                            {/* A wider fallback for user locales that the app does not support */}
                            <link rel="alternate" hrefLang="x-default" href={`${appOrigin}/`} />
                            {siteName === 'ikks' ? (
                                <meta
                                    name="google-site-verification"
                                    content="V6XgQK3cjluRnqYPhzZSDwJBmeE6T_rwBxARQ1REGUA"
                                />
                            ) : (
                                <meta
                                    name="google-site-verification"
                                    content="KeXXw6jQPGt00fSbuvd6TAsJNMxMwo0k8dgu6li3l8I"
                                />
                            )}
                        </Seo>
                        <ScrollToTop />

                        <Box id="app" display="flex" flexDirection="column" flex={1}>
                            <SkipNavLink zIndex="skipLink">Skip to Content</SkipNavLink>

                            <Box {...styles.headerWrapper}>
                                {!isCheckout ? (
                                    <Header onLogoClick={onLogoClick}/>
                                ) : (
                                    <CheckoutHeader />
                                )}
                            </Box>

                            {!isOnline && <OfflineBanner />}
                                <SkipNavContent
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1,
                                        outline: 0
                                    }}
                                >
                                    <Box
                                        as="main"
                                        id="app-main"
                                        role="main"
                                        display="flex"
                                        flexDirection="column"
                                        flex="1"
                                    >
                                        <OfflineBoundary isOnline={false}>
                                            {children}
                                        </OfflineBoundary>
                                    </Box>
                                </SkipNavContent>

                                {!isCheckout ? (
                                    <Footer phoneNumbers={phoneNumbers} />
                                ) : (
                                    <CheckoutFooter />
                                )}
                        </Box>
            </IntlProvider>
        </Box>
    )
}

App.shouldGetProps = () => {
    // In this case, we only want to fetch data for the app once, on the server.
    return typeof window === 'undefined'
}

App.getProps = async ({api, res}) => {
    const site = resolveSiteFromUrl(res.locals.originalUrl)
    const l10nConfig = site.l10n
    const targetLocale = getTargetLocale({
        getUserPreferredLocales: () => {
            // CONFIG: This function should return an array of preferred locales. They can be
            // derived from various sources. Below are some examples of those:
            //
            // - client side: window.navigator.languages
            // - the page URL they're on (example.com/en-GB/home)
            // - cookie (if their previous preference is saved there)
            //
            // If this function returns an empty array (e.g. there isn't locale in the page url),
            // then the app would use the default locale as the fallback.

            // NOTE: Your implementation may differ, this is just what we did.
            //
            // Since the CommerceAPI client already has the current `locale` set,
            // we can use it's value to load the correct messages for the application.
            // Take a look at the `app/components/_app-config` component on how the
            // preferred locale was derived.
            const {locale} = api.getConfig()

            return [locale]
        },
        l10nConfig,
    })
    const messages = await fetchTranslations(targetLocale)

    // Login as `guest` to get session.
    await api.auth.login()

    // Get prefList from BM
    const siteName = getAppOrigin().includes('icode') ? 'icode' : 'ikks'
    const preferences = await api.shopperPreferences.getPreferences({})
    const customerServicePhoneNumbers = preferences?.c_ikks_customerServicePhoneNumbers
    const phoneNumbers = JSON.parse(customerServicePhoneNumbers)[siteName][targetLocale]
    const gtmenabled = preferences?.c_ikks_gtmenabled
    const gtmCodeAnalitycs = preferences?.c_ikks_gtmtagmgr_analytic
    const gtmCodeExternal = preferences?.c_ikks_gtmtagmgr_external

    const oneTrustEnabled = preferences?.c_enable_oneTrust
    const ikksOneTrustID = preferences?.c_ikks_oneTrustScriptID_SL
    const icodeOneTrustID = preferences?.c_icode_oneTrustScriptID_SL

    return {
        targetLocale,
        messages,
        config: res?.locals?.config,
        phoneNumbers,
        siteName,
        gtmenabled,
        gtmCodeAnalitycs,
        gtmCodeExternal,
        oneTrustEnabled,
        ikksOneTrustID,
        icodeOneTrustID,
        preferences
    }
}

App.propTypes = {
    children: PropTypes.node,
    targetLocale: PropTypes.string,
    messages: PropTypes.object,
    config: PropTypes.object,
    phoneNumbers: PropTypes.object,
    siteName: PropTypes.string,
    gtmenabled: PropTypes.bool,
    gtmCodeAnalitycs: PropTypes.string,
    gtmCodeExternal: PropTypes.string,
    oneTrustEnabled: PropTypes.bool,
    ikksOneTrustID: PropTypes.string,
    icodeOneTrustID: PropTypes.string,
    tagManagerArgs: PropTypes.object,
    preferences: PropTypes.object
}

export default App
