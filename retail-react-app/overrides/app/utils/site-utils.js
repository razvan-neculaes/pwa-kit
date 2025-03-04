/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {getParamsFromPath} from './utils'
import {absoluteUrl} from './url'

/**
 * This functions takes an url and returns a site object,
 * an error will be thrown if no url is passed in or no site is found
 * @param {string} url
 * @returns {object} site - a site object
 */
export const resolveSiteFromUrl = (url) => {
    if (!url) {
        throw new Error('URL is required to find a site object.')
    }
    const {pathname, search} = new URL(absoluteUrl(url))
    const path = `${pathname}${search}`
    let site

    // get the site identifier from the url
    const {siteRef} = getParamsFromPath(path)
    const sites = getSites()

    // step 1: use the siteRef to look for the site from the sites in the app config
    // since alias is optional, make sure it is defined before the equality check
    site = sites.find((site) => site.id === siteRef || (site.alias && site.alias === siteRef))
    if (site) {
        return site
    }

    //Step 2: if step 1 does not work, use the defaultSite value to get the default site
    site = getDefaultSite()
    // Step 3: throw an error if site can't be found by any of the above steps
    if (!site) {
        throw new Error(
            "Can't find a matching default site. Please check your sites configuration."
        )
    }
    return site
}

/**
 * Returns the default site based on the defaultSite value from the app config
 * @returns {object} site - a site object from app config
 */
export const getDefaultSite = () => {
    const {app} = getConfig()
    const sites = getSites()

    if (sites.length === 1) {
        return sites[0]
    }

    return sites.find((site) => site.id === app.defaultSite)
}

/**
 * Return the list of sites that has included their respective aliases
 * @return {array} sites - list of sites including their aliases
 */
export const getSites = () => {
    const {sites = [], siteAliases = {}} = getConfig().app || {}

    if (!sites.length) {
        throw new Error("Can't find any sites from the config. Please check your configuration")
    }

    return sites.map((site) => {
        const alias = siteAliases[site.id]
        return {
            ...site,
            ...(alias ? {alias} : {})
        }
    })
}

/**
 * Given a site reference, return the site object
 * @param siteRef - site reference to look for the site object
 * @returns {object | undefined} found site object or default site object
 */
export const getSiteByReference = (siteRef) => {
    const defaultSite = getDefaultSite()
    const sites = getSites()

    return (
        sites.find((site) => {
            return site.alias === siteRef || site.id === siteRef
        }) || defaultSite
    )
}

/**
* Represents a collection of host URLs for store locator
* @type {Object}
*/
export const storeLocatorHosts = {
    IKKS_PROD_HOST: 'stores.ikks.com',
    IKKS_STG_HOST: 'stg-stores.ikks.com',
    IKKS_DEV_HOST: 'ikks-storelocator-osf-qa-ikks.mobify-storefront.com',
    ICODE_PROD_HOST: 'stores.icode.fr',
    ICODE_STG_HOST: 'stg-stores.icode.fr',
    ICODE_DEV_HOST: 'ikks-storelocator-osf-qa-icode.mobify-storefront.com',
    IKKS_LOCAL_HOST : 'localhost',
    ICODE_LOCAL_HOST : 'localhost_icode' // localhost_icode is used for local development testing
}

/**
* Retrieves the host ID from the given URL by matching it with the storeLocatorHosts object
* @param {string} url - the URL from which to extract the host ID
* @returns {string} the host ID associated with the given URL, or undefined if no match is found
*/
export function getHostIDFromURL(currentHostname) {
    let hostID;

    // Iterate over the storeLocatorHosts object to find a matching host
    for (const key in storeLocatorHosts) {
        if (Object.prototype.hasOwnProperty.call(storeLocatorHosts, key)) {
            const host = storeLocatorHosts[key];
            if (currentHostname === host) {
                hostID = key;
                break;
            }
        }
    }

    return hostID;
}

/**
* Retrieves the cross-site host for a given brand's host
* @param {string} host - the host name of the current site
* @returns {string} the cross-site host for the given brand's host
*/
export function getCrossSiteHost(host) {
    const brands = ['IKKS', 'ICODE']
    const parts = host.split('_')
    const brand = parts[0]
    const environment = parts.slice(1).join("_")
    const crossSiteBrand = brands.find((b) => b !== brand)

    return storeLocatorHosts[`${crossSiteBrand}_${environment}`]
}
