/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import useSiteCode from '../../commerce-api/hooks/useSiteCode'
import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import {DEFAULT_SITE_TITLE} from '../../constants'
import useMultiSite from '../../hooks/use-multi-site'
import {useLocation} from 'react-router-dom'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'

const Seo = ({title, description, noIndex, locale, children, ...props}) => {
    const fullTitle = title ? `${title} ${DEFAULT_SITE_TITLE}` : DEFAULT_SITE_TITLE
    const siteCode = useSiteCode()
    const {buildUrl} = useMultiSite()
    const location = useLocation()
    const appOrigin = getAppOrigin()

    let url
    if (siteCode.getSiteCodeId() === 'ICODE' || (appOrigin && appOrigin.includes('icode'))) {
        url = 'static/ico/icode/favicon-icode.ico'
    } else {
        url = 'static/ico/ikks/favicon.ico'
    }

    return (
        <Helmet {...props} htmlAttributes={{lang: locale}}>
            <title>{fullTitle}</title>
            <link
                rel="icon"
                type="image/x-icon"
                href={`${appOrigin}${getAssetUrl(url)}`}
            />
            <link
                rel="shortcut icon"
                type="image/x-icon"
                href={`${appOrigin}${getAssetUrl(url)}`}
            />
            {description && <meta name="description" content={description} />}
            {noIndex && <meta name="robots" content="noindex" />}
            {children}

            {props && props.isDetailPage != true && (
            <link
                rel="canonical"
                hrefLang="x-default"
                href={`${appOrigin}${buildUrl(location.pathname)}`}
            />
            )}
        </Helmet>
    )
}

Seo.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    noIndex: PropTypes.bool,
    children: PropTypes.node,
    locale: PropTypes.string
}

export default Seo
