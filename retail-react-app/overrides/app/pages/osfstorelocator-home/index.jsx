import React, {useEffect} from 'react'
import StoreLanding from '../../components/osfstorelocator/store-landing/'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import useSiteCode from '../../commerce-api/hooks/useSiteCode.js'
import PropTypes from 'prop-types'
import Seo from '../../components/seo'

// Translations
import {useIntl} from 'react-intl'

const StoreLocatorHome = ({appOrigin, seoBrandName}) => {
    const intl = useIntl()
    const siteCode = useSiteCode()

    useEffect(() => {
        if (appOrigin) {
            siteCode.setSiteCodeId(appOrigin.includes('icode') ? 'ICODE' : 'IKKS')
        }
    }, [appOrigin])

    // Seo
    const seoTitle = `
        ${intl.formatMessage({
            defaultMessage: 'Vos Boutiques de Vêtements',
            id: 'store_locator_seo_search_page_title_1'
        })}
        ${seoBrandName}
        ${intl.formatMessage({
            defaultMessage: 'près de Chez Vous',
            id: 'store_locator_seo_search_page_title_2'
        })}
        `

    const seoDesc = `
    ${intl.formatMessage({
        defaultMessage: 'Trouvez la boutique',
        id: 'store_locator_seo_search_page_desc_1'
    })}
    ${seoBrandName}
    ${intl.formatMessage({
        defaultMessage:
            'la plus proche de chez vous ! Retrouvez sur notre Store Locator les coordonnées de votre boutique',
        id: 'store_locator_seo_search_page_desc_2'
    })}
    ${seoBrandName}
    ${intl.formatMessage({
        defaultMessage: '(adresse, numéro de téléphone, horaires…).',
        id: 'store_locator_seo_search_page_desc_3'
    })}
    `
    const locale = intl?.locale
    return (
        <>
            <Seo locale={locale} title={seoTitle} description={seoDesc} />
            <StoreLanding />
        </>
    )
}

StoreLocatorHome.getProps = async () => {
    const appOrigin = getAppOrigin()

    //SEO
    const seoBrandName = appOrigin.includes('icode') ? 'ICODE' : 'IKKS'
    //...

    return {appOrigin, seoBrandName}
}

StoreLocatorHome.propTypes = {
    appOrigin: PropTypes.string,
    stores: PropTypes.array,
    seoBrandName: PropTypes.string
}

export default StoreLocatorHome
