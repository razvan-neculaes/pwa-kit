import React, {useState, useEffect} from 'react'
import {loadGoogleMapApi} from '../../utils/osfstorelocator/LoadGoogleMapApi'
import PropTypes from 'prop-types'
import moment from 'moment'
import {useHistory} from 'react-router-dom'
import {useCommerceAPI} from '../../commerce-api/contexts'

// Site and locale hook
import useMultiSite from '../../hooks/use-multi-site'

// Utils
import {getPathWithLocale} from '../../utils/url'
import {getHostIDFromURL, getCrossSiteHost} from '../../utils/site-utils'

// Components
import {Box, Flex, Stack, Container, Heading, Center, useStyleConfig} from '@chakra-ui/react'

// Project Components
import Seo from '../../components/seo'
import StoreMap from '../../components/osfstorelocator/store-map-wrapper'
import StoreBreadCrumb from '../../components/osfstorelocator/store-breadcrumb'
import StoreSearchLink from '../../components/osfstorelocator/store-search-link'
import StoreAddress from '../../components/osfstorelocator/store-address'
import StoreCollection from '../../components/osfstorelocator/store-collection'
import StoreGroup from '../../components/osfstorelocator/store-group'
import StoreTimetable from '../../components/osfstorelocator/store-timetable'
import StoresNear from '../../components/osfstorelocator/store-stores-near'
import {getAppOrigin} from 'pwa-kit-react-sdk/utils/url'
import TagManager from 'react-gtm-module'
import {useLocation} from 'react-router-dom'

// React Context
import {ClickStoreContext} from '../osfstorelocator'

// Translations
import {useIntl} from 'react-intl'

// Hooks
import useStores from '../../commerce-api/hooks/useStores'
import useSiteCode from '../../commerce-api/hooks/useSiteCode'
import useSitePreferences from '../../commerce-api/hooks/useSitePreferences'
import {useTimezone} from '../../hooks/use-timezone'

const daysMap = {
    Monday: 'Lundi',
    Tuesday: 'Mardi',
    Wednesday: 'Mercredi',
    Thursday: 'Jeudi',
    Friday: 'Vendredi',
    Saturday: 'Samedi',
    Sunday: 'Dimanche'
}

/**
 * This is the store locator details page for Retail React App.
 */
const StoreLocatorDetails = ({store, appOrigin, seoStoreName, seoStoreAddress, postalCode, city, params, sitePrefs}): JSX.Element => {
    const siteCode = useSiteCode()
    const sitePref = useSitePreferences()
    const history = useHistory()
    const api = useCommerceAPI()
    const {getUTCOffset} = useTimezone()
    const [googleApiKey, setGoogleApiKey] = useState(null)
    const [ltdLng, setLtdLng] = useState({})
    const [proximisGroups, setProximisGroups] = useState([])
    const [mapScriptLoaded, SetMapScriptLoaded] = useState(false)
    const [GTMInit, setGTMInit] = useState(false)
    const [canonical, setCanonical] = useState();
    const siteID = siteCode.getSiteCodeId()
    const location = useLocation()
    const {buildUrl} = useMultiSite()

    useEffect(() => {
        if (appOrigin) {
            siteCode.setSiteCodeId(appOrigin.includes('icode') ? 'ICODE' : 'IKKS')
        }
    }, [appOrigin])

    useEffect(() => {
        if (sitePref.getSitePreferences()?.c_ikks_googleMapKey) {
            setGoogleApiKey(sitePref.getSitePreferences()?.c_ikks_googleMapKey)
        } else {
            getGoogleApiKey()
        }
    }, [mapScriptLoaded])

    useEffect (() => {
        const gtmenabled = sitePref.getSitePreferences()?.c_ikks_gtmenabled
        if (gtmenabled && seoStoreName && !GTMInit) {
            TagManager.dataLayer({
                dataLayer: {
                    event: 'page_view',
                    page_path: window.location.href,
                    page_title: seoTitle.replace(/\n/g, '').replace(/\s+/g, ' '),
                },
                dataLayerName: 'dataLayer'
            })
            setGTMInit(true)
        }
    }, [sitePref, seoStoreName])

    async function getGoogleApiKey() {
        let prefList = sitePrefs || sitePref.getSitePreferences();
        if (!prefList) {
            prefList = await api.shopperPreferences.getPreferences({})
            sitePref.setSitePreferences(prefList);
        }
        if (prefList) {
            setGoogleApiKey(prefList.c_ikks_googleMapKey)
            if (window.google) {
                setGoogleApiKey(prefList.c_ikks_googleMapKey)
            }
            if (!mapScriptLoaded) {
                const googleMapScript = loadGoogleMapApi(prefList.c_ikks_googleMapKey, intl?.locale)
                // for google maps api
                // @ts-ignore

                googleMapScript.addEventListener('load', function() {
                    setGoogleApiKey(prefList.c_ikks_googleMapKey)
                })

                SetMapScriptLoaded(true)
            }
        }
    }

    /**
    * Retrieves the store collections from the provided store object.
    * @param {Object} store - The store object from which to retrieve the collections.
    * @returns {Array} - An array containing the store collections.
    */
    const getStoreCollection = (store) => {
        let collections = []
        if (store) {
            const groups = JSON.parse(store.c_typology).groups
            groups &&
                groups.map((item) => {
                    item.attributes.map((y) => {
                        if (y.technicalName === 'storelocator-shelve') {
                            collections.push(y.value)
                        }
                    })
                })
        
            const tempCollections = collections.join(',').split(',')
            collections = [...new Set(tempCollections)]
        }

        return collections
    }

    /**
    * useEffect hook to get the custom groups from the API and set the proximisGroups state.
    * If the gift card is enabled but not allowed, it will add a disabled group to the proximisGroups state.
    */
    useEffect(() => {
        const getGroups = async () => {
            setProximisGroups([])

            let groupArray = []
            let prefList = sitePrefs || sitePref.getSitePreferences();

            if (!prefList) {
                prefList = await api.shopperPreferences.getPreferences({})
                sitePref.setSitePreferences(prefList);
            }
            let customGroupsConfig = prefList.c_ikks_proximis_storelocator_group
            let customGroups = JSON.parse(customGroupsConfig)

            for (let i = 0; i < customGroups.length; i++) {
                if (store && Object.prototype.hasOwnProperty.call(store, `c_${customGroups[i].proximisGroupValue}`) && !groupArray.includes(customGroups[i]) && customGroups[i].enable == 'true') {
                    let groupName = customGroups[i].proximisGroupValue
                    let group = {
                        ID : groupName,
                        title: 'storelocator_proximis_group_title_' + groupName,
                        text : 'storelocator_proximis_group_text_' + groupName
                    }
                    groupArray.push(group)
                }
            }

            let isGiftCardEnabled = customGroups.some(group => group.proximisGroupValue.includes('gift_card') && group.enable === 'true');
            let isGiftCardAllowed = groupArray.some((proximisGroup) => proximisGroup.ID.includes('gift_card'));
            let hasGiftCardDisabled = groupArray.some(obj => obj.ID === 'gc_disabled');

            if (!isGiftCardAllowed && isGiftCardEnabled && !hasGiftCardDisabled) {
                let disabled = {
                    ID : "gc_disabled",
                    title: "storelocator_proximis_group_title_gift_card_disabled",
                    text : "storelocator_proximis_group_text_gift_card_disabled"
                }
                groupArray.push(disabled)
            }

            return groupArray
        }

        getGroups().then(groups => {
            setProximisGroups(groups)
        })

        // Check for search parameters in the url
        const url = new URL(window.location.href)
        const searchParams = new URLSearchParams(url.search)

        // If there are multiple parameters return to the previous page
        if (searchParams.toString().split('&').length > 1) {
            history.push('/')
        } else {
            const SearchParam = params && params.groupId ? params.groupId : searchParams.get('filter')

            // if there is a different parameter for the icode website return to the previous page
            if (SearchParam) {
                if (siteID === 'ICODE' && (SearchParam.includes('xo') || SearchParam.includes('ikks'))) {
                    history.push('/')
                }
            }
        }
    }, [store])

    //Instantiate resource object
    const intl = useIntl()
    const styles = useStyleConfig(`StoreLocatorDetails${siteCode.getSiteCodeId()}`)
    const useStoresHook = useStores()

    if (store) {
        /* SEND AND RECEIVE MESSAGES */
        if (typeof window !== 'undefined') {
            try {
                // Called from the iframe
                const message = JSON.stringify({
                    message: 'Hello from iframe',
                    date: Date.now(),
                    store: store.id
                })

                window.parent.postMessage(message, '*')
            } catch (e) {
                console.log(e)
            }
        }
    }

    // update store when user goes back in history
    const {site, locale} = useMultiSite()
    const configValues = {
        locale: locale.alias || locale.id,
        site: site.alias || site.id
    }
    let backListener = history.listen((location) => {
        if (location.action === 'POP') {
            const path = getPathWithLocale('/stores', configValues)
            history.push(path)
        }
    })

    const [storeClickID, setStoreClickID] = useState<string>('')
    const [timeTableData, setTimeTableData] = useState<string>([])
    const [storeStatus, setStoreStatus] = useState<boolean>(false)
    const [noData, setNoData] = useState<boolean>(false)
    const [nearStores, setNearStores] = useState<boolean>(false)
    const [mapPin, setMapPin] = useState([])

    useEffect(() => {
        let typology
        let commercialSign
        let timeCheck = false
        let noData = false
        let dayValue
        let hourValue
        let storeIcon = ''
        if (store) {
            getNearStores(store)
            const d = new Date()
            const utc = d.getTime() + d.getTimezoneOffset() * 60000
            const nd = new Date(utc + 3600000 * getUTCOffset(store.countryCode))
            const currentTime = nd.toLocaleString('en-US', {hour12: true})
            dayValue = daysMap[moment(currentTime).format('dddd')]
            hourValue = moment(currentTime).format('HH:mm')
        }

        if (store && store.c_commercialSign) {
            commercialSign = JSON.parse(store.c_commercialSign)
            storeIcon = commercialSign?.code.includes('I.CODE') ? 'icon-icode' : 'icon-ikks'
        }
        if (store && store.c_typology && store.c_typology != 'undefined') {
            typology = JSON.parse(store.c_typology)
            typology.groups.forEach((group) => {
                group.attributes.forEach((attribute) => {
                    if (attribute.technicalName == 'storelocator-group') {
                        let attributeValues

                        if (
                            attribute.value &&
                            attribute.value.includes(',') &&
                            attribute.value.split(',')
                        ) {
                            attributeValues = attribute.value.split(',')
                        }
                        if (attributeValues && attributeValues.length > 0) {
                            attributeValues.forEach((value) => {
                                if (value == 'Xando') {
                                    storeIcon = 'icon-xando'
                                }
                                if (value == 'Outlets') {
                                    storeIcon = 'icon-outlet'
                                }
                                if (value == 'Indépendant' || value == 'Ind-pendant') {
                                    storeIcon =
                                        commercialSign?.code.includes('I.CODE') ||
                                        commercialSign?.code.includes('ICODE')
                                            ? 'icon-icode-independant'
                                            : 'icon-ikks-independant'
                                }
                                if (value == 'Corner-ikks') {
                                    storeIcon = 'icon-ikks'
                                }
                                if (value == 'Ikks-stores') {
                                    storeIcon =
                                        commercialSign?.code.includes('I.CODE') ||
                                        commercialSign?.code.includes('ICODE')
                                            ? 'icon-icode'
                                            : 'icon-ikks'
                                }
                            })
                        }
                    }
                })
            })
        }
        if (store && store.c_workingSchedule) {
            const renameHour = (val) => {
                return val ? val.split(':')[0] + 'h' + val?.split(':')[1] : '-'
            }
            const schedule = JSON.parse(store.c_workingSchedule).map((time) => {
                if (time.title == dayValue) {
                    if (time.amBegin && !time.amEnd) {
                        if (
                            moment(hourValue, 'hh:mm:ss').isBetween(
                                moment(time.amBegin, 'hh:mm:ss'),
                                moment(time.pmEnd, 'hh:mm:ss')
                            )
                        ) {
                            timeCheck = true
                        }
                    } else if (!time.amBegin && time.pmBegin) {
                        if (
                            moment(hourValue, 'hh:mm:ss').isBetween(
                                moment(time.pmBegin, 'hh:mm:ss'),
                                moment(time.pmEnd, 'hh:mm:ss')
                            )
                        ) {
                            timeCheck = true
                        }
                    } else if (time.amBegin && !time.pmBegin) {
                        if (
                            moment(hourValue, 'hh:mm:ss').isBetween(
                                moment(time.amBegin, 'hh:mm:ss'),
                                moment(time.amEnd, 'hh:mm:ss')
                            )
                        ) {
                            timeCheck = true
                        }
                    } else if (time.amBegin && time.amEnd && time.pmBegin && time.pmEnd) {
                        if (
                            moment(hourValue, 'hh:mm:ss').isBetween(
                                moment(time.amBegin, 'hh:mm:ss'),
                                moment(time.amEnd, 'hh:mm:ss')
                            ) ||
                            moment(hourValue, 'hh:mm:ss').isBetween(
                                moment(time.pmBegin, 'hh:mm:ss'),
                                moment(time.pmEnd, 'hh:mm:ss')
                            )
                        ) {
                            timeCheck = true
                        }
                    } else {
                        noData = true
                    }
                }

                return {
                    title: time.title,
                    amBegin: renameHour(time.amBegin),
                    amEnd: renameHour(time.amEnd),
                    pmBegin: renameHour(time.pmBegin),
                    pmEnd: renameHour(time.pmEnd),
                    isActive: dayValue == time.title
                }
            })
            setStoreStatus(timeCheck)
            setNoData(noData)
            setTimeTableData(schedule)
        }
        if (store) {
            let lagLongobj = {
                lat: store.latitude,
                lng: store.longitude
            }

            setLtdLng(lagLongobj)
            const mapPinArray = [
                {
                    id: store.id,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    icon: storeIcon,
                    name: store.name,
                    address1: store.address1,
                    address2: store.postalCode + ' ' + store.city,
                    clickable: false,
                    unique: true,
                    storePinSVG: store.c_storePinSVG,
                    phone: store.phone,
                    hours: store.store_hours,
                    storeType: commercialSign?.code.includes('I.CODE') ? 'icode' : 'ikks'
                }
            ]
            setMapPin(mapPinArray)
        }
    }, [store])

    // Checks if the store is in the current site collection, if not changes canonical URL for the cross brand's domain
    useEffect(() => {
        if (appOrigin && store && siteID) {
            const storeCollection = getStoreCollection(store)
            const currentHost = new URL(appOrigin).hostname
            if (storeCollection.some(collection => collection.includes(siteID))) {
                setCanonical(appOrigin)
            } else {
                const currentHostID = getHostIDFromURL(currentHost)
                const crossSiteHost = getCrossSiteHost(currentHostID)
                setCanonical(`https://${crossSiteHost}`)
            }
        }
    }, [siteID, store, appOrigin]);

    const getNearStores = async (storeInfo) => {
        let siteSign
        let storesData = []
        if (appOrigin.includes('icode') || appOrigin.includes('ikks')) {
            siteSign = appOrigin.includes('icode') ? 'I.CODE' : 'IKKS'
        } else {
            siteSign = 'IKKS'
        }
        let result =
            (await useStoresHook.getStoresNear({
                latitude: storeInfo.latitude,
                longitude: storeInfo.longitude,
                distance: 25
            })) || []
        if (result.length) {
            if (siteSign == 'I.CODE') {
                result.forEach((element) => {
                    let commercialSign
                    if (element.c_commercialSign && element.c_commercialSign != 'undefined') {
                        commercialSign = JSON.parse(element.c_commercialSign)
                    }
                    if (commercialSign?.code) {
                        if (
                            commercialSign?.code.includes('I.CODE') ||
                            commercialSign?.code.includes('ICODE')
                        ) {
                            storesData.push(element)
                        }
                    }
                })
            } else {
                storesData = [...result]
            }
            setNearStores(storesData.filter((item, index) => index > 0 && index < 6))
        }
    }

    // SEO
    const seoTitle = `
    ${intl.formatMessage(
        {
            defaultMessage: 'Boutique',
            id: 'store_locator_seo_detail_page_title_1'
        }
    )}
    ${seoStoreName}
    ${intl.formatMessage(
        {
            defaultMessage: '| Magasin de Vêtements',
            id: 'store_locator_seo_detail_page_title_2'
        }
    )}
    `
    const seoDesc = `
    ${intl.formatMessage(
        {
            defaultMessage:
                'Retrouvez les coordonnées et horaires de votre boutique de Vêtements',
            id: 'store_locator_seo_detail_page_desc_1'
        }
    )}
    ${seoStoreName}
    ${intl.formatMessage(
        {
            defaultMessage:
                ', située',
            id: 'store_locator_seo_detail_page_desc_2'
        }
    )}
    ${seoStoreAddress}
    ${postalCode}
    ${city}
    `

    /**
     * @function checkStore
     * @description Store details creation
     * @returns Container with a message saying that the store or container is being loaded with the store details
     */
    const checkStore = () => {
        if (store) {
            // no store found
            if (store.hasOwnProperty('fault')) {
                return (
                    <>
                        <StoreBreadCrumb
                            activePage="detail"
                            storeName={store.name}
                            params={params}
                        />
                        <Center paddingY={'30px'}>
                            <Heading>
                                {intl.formatMessage({
                                    defaultMessage: 'Magasin introuvable',
                                    id: 'storelocator.storedetails.notfound'
                                })}
                            </Heading>
                        </Center>
                    </>
                )
            } else {
                return (
                    <ClickStoreContext.Provider value={[storeClickID, setStoreClickID]}>
                        <Container maxHeight={'auto'} backgroundColor={'w'}>
                            <StoreBreadCrumb
                                activePage="detail"
                                storeName={store.name}
                                params={params}
                            />

                            <Flex flex={1} display={{base: 'none', lg: 'flex'}}>
                                <StoreSearchLink
                                    props={params}
                                />
                            </Flex>

                            <Flex flex={1}>
                                <Heading as={'h1'} {...styles.title}>
                                    {store.name}
                                </Heading>
                            </Flex>

                            <Stack
                                marginTop={{base: '17px', lg: '27px'}}
                                marginBottom={{base: '17px', lg: '0'}}
                                spacing={{base: '0px', lg: '50px'}}
                                width={'100%'}
                                display={'flex'}
                                direction={{base: 'column', lg: 'row'}}
                            >
                                <Flex
                                    display={'flex'}
                                    flex={1}
                                    justify={'center'}
                                    position={'relative'}
                                    width={'100%'}
                                    minHeight={{base: '551px', md: '551px', lg: '551px'}}
                                    direction={{base: 'row', md: 'column'}}
                                    textAlign={'center'}
                                    order={{base: 2, lg: 1}}
                                    marginTop={['20px', '20px', '0px', '0px']}
                                >
                                    <StoreMap
                                        ltdLng={ltdLng}
                                        minHeight="551px"
                                        pins={mapPin}
                                        apiKey={googleApiKey}
                                        store={store}
                                    ></StoreMap>
                                </Flex>

                                <Flex
                                    flex={1}
                                    width={{base: '100%', lg: '344px'}}
                                    order={{base: 1, lg: 2}}
                                >
                                    <Box width="100%">
                                        <Box width="100%" height="180px">
                                            <StoreAddress store={store} />
                                        </Box>
                                        <Box
                                            width="100%"
                                            height="161px"
                                            marginTop={{base: '29px', lg: '51px'}}
                                        >
                                            <StoreTimetable
                                                data={timeTableData}
                                                storeStatus={storeStatus}
                                                noData={noData}
                                            />
                                        </Box>
                                        <Box
                                            width="100%"
                                            display={{lg: 'flex'}}>
                                            <Box
                                                width={{base: '100%', lg: '50%'}}
                                                height="100%"
                                                marginTop={{base: '29px', lg: '25px'}}
                                            >   
                                                <StoreCollection store={store} />
                                            </Box>
                                            <Box
                                                width={{base: '100%', lg: '50%'}}
                                                height="100%"
                                                marginTop={{base: '50px', lg: '25px'}}
                                                display="flex"
                                                flexDirection="column"
                                                marginBottom={{base: '50px', lg: '0'}}
                                                marginLeft={{lg: '10px'}}
                                            >
                                                <StoreGroup proximisGroups={proximisGroups} />
                                            </Box>
                                        </Box>
                                        
                                    </Box>
                                </Flex>
                            </Stack>
                            {nearStores && <StoresNear data={nearStores} />}
                        </Container>
                    </ClickStoreContext.Provider>
                )
            }
        } else {
            return (
                <>
                    <StoreBreadCrumb 
                        home={false}
                        storeName={''}
                        params={params}
                    >
                    </StoreBreadCrumb>
                    <Center paddingY={'30px'}>
                        <Heading>
                            {intl.formatMessage({
                                defaultMessage: ' Magasin de chargement...',
                                id: 'storelocator.storedetails.loading_store'
                            })}
                        </Heading>
                    </Center>
                </>
            )
        }
    }

    return (
        <>
            <Seo locale={intl?.locale} title={seoTitle} description={seoDesc} isDetailPage={true}>
            <link
                rel="canonical"
                hrefLang="x-default"
                href={`${canonical}${buildUrl(location.pathname)}`}
            />
            </Seo>
            
            {googleApiKey && (
                <Box data-testid="home-page" layerStyle="page" paddingBottom="100px">
                    {checkStore()}
                </Box>
            )}
        </>
    )
}

StoreLocatorDetails.getTemplateName = () => 'Store Locator Details'

StoreLocatorDetails.shouldGetProps = ({previousLocation, location}) =>
    !previousLocation || previousLocation.pathname !== location.pathname

StoreLocatorDetails.getProps = async ({res, params, api}) => {
    const appOrigin = getAppOrigin()
    const {storeId} = params
    if (res) {
        res.set('Cache-Control', 'max-age=900')
    }
    let store = await api.shopperStores.getStore({storeId: storeId})

    let sitePrefs = await api.shopperPreferences.getPreferences({})

    //SEO
    const {name, address1, postalCode, city} = store ?? {}
    const seoStoreName = name
    const seoStoreAddress = address1
    //...

    return {store, appOrigin, seoStoreName, seoStoreAddress, postalCode, city, params, sitePrefs}

}

StoreLocatorDetails.propTypes = {
    store: PropTypes.object,
    appOrigin: PropTypes.string
}

export default StoreLocatorDetails
