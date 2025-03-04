/* OSF STORE LOCATOR - project constants file */
import {app as appConfig} from '../config/default'

export const CLIENT_ID = appConfig.commerceAPI.parameters.clientId
    ? appConfig.commerceAPI.parameters.clientId
    : '109589f8-e5b7-4a64-ad8e-c6a3b2fe03df'
export const DOMAIN = 'zzrb-428.sandbox.us01.dx.commercecloud.salesforce.com'
export const SITE_ID = appConfig.commerceAPI.parameters.siteId
    ? appConfig.commerceAPI.parameters.siteId
    : 'RefArchGlobal'
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBXJtprOhX1gDreqTnS3NxUOTiKSoeFw7w'
