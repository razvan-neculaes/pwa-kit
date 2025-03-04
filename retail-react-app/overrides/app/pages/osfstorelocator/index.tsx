import React, {useEffect, useState, useRef} from 'react'
import {loadGoogleMapApi} from '../../utils/osfstorelocator/LoadGoogleMapApi'
import PropTypes from 'prop-types'
import {getAppOrigin} from 'pwa-kit-react-sdk/utils/url'
import useStores from '../../commerce-api/hooks/useStores'
import useSiteCode from '../../commerce-api/hooks/useSiteCode'
import {useCommerceAPI} from '../../commerce-api/contexts'
import useSitePreferences from '../../commerce-api/hooks/useSitePreferences'
import useCommonInfo from '../../commerce-api/hooks/useCommonInfo'
import {useHistory} from 'react-router-dom'
import moment from 'moment'
import TagManager from 'react-gtm-module'

// Components
import {
    Box,
    Flex,
    Stack,
    Container,
    Spinner,
    Button,
    Icon,
    Text,
    useStyleConfig,
    Checkbox,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    Heading,
    Skeleton,
    Center
} from '@chakra-ui/react'

// loadable
import loadable from '@loadable/component'
const fallback = <Skeleton height="75vh" width="100%" />

// Project Components
import Seo from '../../components/seo'
const StoreBreadCrumb = loadable(() => import('../../components/osfstorelocator/store-breadcrumb'), {fallback})
const StoreCard = loadable(() => import('../../components/osfstorelocator/store-card'), {fallback})
const StoreSearch = loadable(() => import('../../components/osfstorelocator/store-search'), {fallback})
const StoreMapWrapper = loadable(() => import('../../components/osfstorelocator/store-map-wrapper'), {fallback})

// Interfaces
import {IStoreInformation, MapPin} from '../../utils/osfstorelocator/storelocator_types'

// Translations
import {useIntl} from 'react-intl'

//Hooks
import {useTimezone} from '../../hooks/use-timezone'
import {useWorkingHours} from '../../hooks/use-working-hours'

import {DropIcon} from '../../components/icons'

import {FormattedMessage} from 'react-intl'

const daysMap = {
    Monday: 'Lundi',
    Tuesday: 'Mardi',
    Wednesday: 'Mercredi',
    Thursday: 'Jeudi',
    Friday: 'Vendredi',
    Saturday: 'Samedi',
    Sunday: 'Dimanche'
}

const distanceOptions = [50, 100, 200, 500]

// React Context
export const ClickStoreContext = React.createContext([])

/**
 * This is the store locator page for Retail React App.
 */
const StoreLocator = ({appOrigin, seoBrandName, seoCityName, params}) => {
    const {getUTCOffset} = useTimezone()
    const {getWorkingHours} = useWorkingHours()
    const commonInfo = useCommonInfo()
    const useStoresHook = useStores()
    const api = useCommerceAPI()
    const history = useHistory()
    const siteCode = useSiteCode()
    const sitePref = useSitePreferences()
    const styles = useStyleConfig(
        `StoreLocatorResults${
            appOrigin ? (appOrigin.includes('icode') ? 'ICODE' : 'IKKS') : 'IKKS'
        }`
    )
    const intl = useIntl()
    const [collections, setCollections] = useState([])
    const [allStores, setAllStores] = useState(null)
    const [totalStores, setTotalStores] = useState(null)
    const [countryOptions, setCountryOptions] = useState([])
    const [noResultFound, setNoResultFound] = useState(false)
    const [googleApiKey, setGoogleApiKey] = useState(null)
    const [mapPins, setMapPins] = useState(null)
    const [cityInfo, setCityInfo] = useState(null)
    const [proximisGroups, setProximisGroups] = useState([])
    const [isFiltered, setIsFiltered] = useState({filterGroupID : params && params.groupId ? params.groupId : "", isFiltered: params && params.groupId ? true : false})
    const [hasPagination, setHasPagination] = useState<Boolean>(false)

    // Search input hook
    const [searchInput, setSearchInput] = useState<string>('')
    const [numberOfStores, setNumberOfStores] = useState<number>(0)
    const [numberOfStoresNearMe, setnumberOfStoresNearMe] = useState<number>(0)
    const [storeClickID, setStoreClickID] = useState<string>('')

    // Loading spinner hook
    const [debounceLoading, setDebounceLoading] = useState<Boolean>(true)
    const [searchType, setSearchType] = useState<string>('')
    const [maxDistance, setMaxDistance] = useState<number>(25)
    const [selectedStores, setSelectedStores] = useState([])
    const [ltdLng, setLtdLng] = useState({})
    const prevCollections = useRef(collections)
    const [GTMInit, setGTMInit] = useState<Boolean>(false)

    // Set max distance
    function getMaxDistance() {
        let prefList = sitePref.getSitePreferences()
        if (prefList) {
            setMaxDistance(prefList.c_ikks_googleMapMaxDistance)
        }
    }

    useEffect(() => {
        if (sitePref.getSitePreferences()?.c_ikks_googleMapKey) {
            setGoogleApiKey(sitePref.getSitePreferences()?.c_ikks_googleMapKey)
        } else {
            getGoogleApiKey()
        }
    }, [])

    useEffect(() => {
        getMaxDistance()
        checkFilters()
    }, [googleApiKey])

    useEffect(() => {
        if (appOrigin) {
            siteCode.setSiteCodeId(appOrigin.includes('icode') ? 'ICODE' : 'IKKS')
        }
    }, [appOrigin])

    useEffect(() => {
        const gtmenabled = sitePref.getSitePreferences()?.c_ikks_gtmenabled
        if (!GTMInit && gtmenabled && seoBrandName && seoCityName) {
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
    }, [seoBrandName, seoCityName, sitePref])

    /**
    * checkFilters is an async function that retrieves shopper preferences from the api, parses them, and sets the proximisGroups state.
    * It also checks if the searchparams is matching any of the elements in proximisgroups and sets the isFiltered state accordingly.
    */
    async function checkFilters() {
        let param
        let prefList = sitePref.getSitePreferences()

        if (prefList) {
            let customGroupsConfig = prefList.c_ikks_proximis_storelocator_group
            let customGroups = JSON.parse(customGroupsConfig)
            for (let i = 0; i < customGroups.length; i++) {
                if (!proximisGroups.includes(customGroups[i]) && customGroups[i].enable) {
                    proximisGroups.push(customGroups[i].proximisGroupValue)
                }
            }
        }

        setProximisGroups(proximisGroups)
        
        // Check for search parameters in the url
        const url = new URL(window.location.href)
        const searchParams = new URLSearchParams(url.search)
        const siteID = siteCode.getSiteCodeId()

        // If there are multiple parameters return to the previous page
        if (searchParams.toString().split('&').length > 1) {
            history.push('/')
        } else {
            param = params && params.groupId ? params.groupId : searchParams.get('filter')

            // if there is a different parameter for the icode website return to the previous page
            if (param) {
                if (siteID === 'ICODE' && (param.includes('xo') || param.includes('ikks'))) {
                    history.push('/')
                }
            }
        }

        // Check if searchparams is matching any of the elements in proximisgroups
        let appliedFilters = commonInfo.getFilters()
        if ((proximisGroups.includes(param) || param == null && appliedFilters != null) || (params && params.groupId && proximisGroups.includes(params.groupId))) {
            setIsFiltered({ isFiltered: true, filterGroupID: param ? param : appliedFilters })
            commonInfo.setFilters(param ? param : appliedFilters)
        }
        return {
            proximisGroups, param
        }
    }

    /**
    * getGoogleApiKey is an async function that retrieves the Google API key from the shopper preferences.
    * It then loads the Google Map API with the retrieved key and sets the Google API key in the window.
    */
    async function getGoogleApiKey() {
        let prefList; 
        if (sitePref.getSitePreferences()?.c_ikks_googleMapKey) {
            prefList = sitePref.getSitePreferences()
        } else {
            prefList = await api.shopperPreferences.getPreferences({});
            sitePref.setSitePreferences(prefList)
        }
        if (prefList) {
            const googleMapScript = loadGoogleMapApi(prefList.c_ikks_googleMapKey, intl?.locale)
            // for google maps api
            // @ts-ignore
            if (window.google) {
                setGoogleApiKey(prefList.c_ikks_googleMapKey)
            }

            googleMapScript.addEventListener('load', function() {
                setGoogleApiKey(prefList.c_ikks_googleMapKey)
            })
        }
    }

    // Update store when user goes back in history
    useEffect(() => {
        if (appOrigin && params && googleApiKey) {
            let cityParamater = decodeURI(params.city)
            let character = cityParamater.charAt(0)
            setNoResultFound(false)
            let searchParameter = ''
            let filterID = commonInfo.getFilters()
            if (filterID && (!cityParamater || cityParamater && cityParamater == 'undefined')) {
                handleStoreSearch(filterID.split('_').join(' '))
                setIsFiltered({isFiltered: true, filterGroupID: filterID})
            } else {
                if (filterID) {
                    setIsFiltered({isFiltered: true, filterGroupID: filterID})
                }
                if (isNaN(cityParamater)) {
                    if (character == character.toUpperCase()) {
                        const paramsLat = params.geoInfo.split(',')[0]
                        const paramsLng = params.geoInfo.split(',')[1]
                        getUserCoordsResult(paramsLat, paramsLng)
                    } else if (character == character.toLowerCase()) {
                        if (decodeURI(params.city).includes('-')) {
                            searchParameter = decodeURI(params.city).split('-').join(' ')
                        } else {
                            searchParameter = decodeURI(params.city)
                        }
                        commonInfo.setCity(searchParameter)
                        setCityInfo(searchParameter)
                        handleStoreSearch(searchParameter)
                    }
                } else {
                    commonInfo.setCity(cityParamater)
                    setCityInfo(cityParamater)
                    findUserCountry(cityParamater)
                }
            }
        }
    }, [params, appOrigin, googleApiKey])

    useEffect(() => {
        if (allStores) {
            // Filter by collections
            const storeObj = allStores.map((x) => (x.c_typology ? JSON.parse(x.c_typology) : {}))
            const newArray = []

            if (Object.keys(storeObj).length !== 0) {
                for (const obj of storeObj) {
                    // Iterate through the groups in each object
                    if (Object.keys(obj).length !== 0) {
                        for (const group of obj.groups) {
                            // Iterate through the attributes in each group
                            for (const attribute of group.attributes) {
                                // Check if the technicalName matches "storelocator-shelve"
                                if (attribute.technicalName === 'storelocator-shelve') {
                                    // Add the value of the attribute to the new array
                                    newArray.push(attribute.value)
                                }
                            }
                        }
                    }
                }
            }

            // Remove duplicates from array
            const removeDuplicates = (arr) => {
                let outputArray = Array.from(new Set(arr))
                return outputArray.filter((x) => x !== null)
            }

            // Set new collection rules for filters
            const setFilterCollections = (array) => {
                let excludedValues = []
                let filteredArray  = []
                if (isFiltered.filterGroupID == 'gift_card_ikks') {
                    excludedValues = ['IKKS WOMEN', 'IKKS JUNIOR', 'IKKS MEN']
                } else if (isFiltered.filterGroupID == 'gift_card_icode') {
                    excludedValues = ['ICODE']
                }
                if (excludedValues.length > 0) {
                    filteredArray = array.filter((item) => excludedValues.includes(item))
                }
                return filteredArray
            }

            const removedArray = removeDuplicates(
                newArray
                    .join(',')
                    .split(',')
                    .filter((x) => x !== '')
            )

            setCollections(removedArray)

            if (isFiltered && isFiltered.filterGroupID) {
                const filteredArray = setFilterCollections(removedArray);
                while (removedArray.length > 0) {
                    removedArray.pop();
                }
                filteredArray.forEach((item) => removedArray.push(item));
                setCollections(filteredArray)
            }
        }
    }, [allStores])

    useEffect(() => {
        if (maxDistance != 25) {
            if (params) {
                let cityParamater = decodeURI(params.city)
                let character = cityParamater.charAt(0)
                if (character == character.toUpperCase()) {
                    const paramsLat = params.geoInfo.split(',')[0]
                    const paramsLng = params.geoInfo.split(',')[1]
                    getUserCoordsResult(paramsLat, paramsLng)
                } else if (character == character.toLowerCase()) {
                    let searchParameter = ''
                    if (decodeURI(params.city).includes('-')) {
                        searchParameter = decodeURI(params.city).split('-').join(' ')
                    } else {
                        searchParameter = decodeURI(params.city)
                    }
                    commonInfo.setCity(searchParameter)
                    setCityInfo(searchParameter)
                    handleStoreSearch(searchParameter)
                }
            }
        }
    }, [maxDistance])

    /**
     * Run a function when the `collections` or `selectedStores` props change
     * @param {Array} collections - The array of collections to watch for changes
     * @param {Array} selectedStores - The array of selected stores to watch for changes
     * @param {RefObject} prevCollections - A reference to the previous value of `collections
     * @param {Function} handleChange - A function to handle changes to the selected stores
     */
    useEffect(() => {
        if (collections !== prevCollections.current) {
            prevCollections.current = collections
            const handleCollectionsUpdate = () => {
                if (selectedStores.length > 0) {
                    selectedStores.forEach((store) => {
                        if (!collections.includes(store)) {
                            // If one of the selected stores are not matching with updated collection, reset filters
                            setSelectedStores([])
                        }
                    })
                }
            }
            handleCollectionsUpdate()
        }
    }, [collections, selectedStores])

    /* SEND AND RECEIVE MESSAGES */
    if (typeof window !== 'undefined') {
        window.addEventListener('message', function(e) {
            try {
                const data = JSON.parse(e.data)
                if (data.source === 'SFCC' && data.token === 'token') {
                    document.querySelector('footer').style = 'display: none'
                    document.getElementById('header-class').style = 'display: none'
                }
            } catch (e) {
                //console.log(e)
            }
        })
    }

    /**
     * @function buildMapPins
     * @description Function that creates the markers that appear on the map
     * @param stores Array -> Array of stores
     * @returns Array -> Array of Pins(markers)
     */
    const buildMapPins = (storesData) => {
        if (storesData) {
            const d = new Date()
            const utc = d.getTime() + d.getTimezoneOffset() * 60000
            const newStores = [...storesData]

            let pins = newStores.map((store: IStoreInformation) => {
                const nd = new Date(utc + 3600000 * getUTCOffset(store.countryCode))
                const currentTime = nd.toLocaleString('en-US', {hour12: true})
                const dayValue = daysMap[moment(currentTime).format('dddd')]
                const hourValue = moment(currentTime).format('HH:mm')

                let timeCheck = false
                let commercialSign = ''
                let workingHours = ''
                let storeIcon = ''
                let typology = ''
                if (store.c_commercialSign && store.c_commercialSign != 'undefined') {
                    commercialSign = JSON.parse(store.c_commercialSign)
                    storeIcon = commercialSign?.code.includes('I.CODE') ? 'icon-icode' : 'icon-ikks'
                }
                if (store.c_workingSchedule && store.c_commercialSign != 'undefined') {
                    const workingSchedule = JSON.parse(store.c_workingSchedule)

                    timeCheck = getWorkingHours(workingSchedule, dayValue, hourValue).timeCheck
                    workingHours = getWorkingHours(workingSchedule, dayValue, hourValue)
                        .workingHours
                }
                if (store.c_typology && store.c_typology != 'undefined') {
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

                const attrs = JSON.parse(store?.c_typology).groups.reduce((acc, curr) => {
                    const attribute = curr.attributes.find(
                        (attribute) => attribute.technicalName === 'storelocator-shelve'
                    )
                    if (attribute) {
                        acc.push(attribute)
                    }
                    return acc
                }, [])

                return {
                    id: store.id,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    name: store.name,
                    address1: store.address1,
                    address2: store.postalCode + ' ' + store.city,
                    clickable: true,
                    unique: false,
                    storePinSVG: store.c_storePinSVG,
                    phone: store.phone,
                    hours: store.store_hours,
                    workingHours: workingHours,
                    icon: storeIcon,
                    isOpen: timeCheck,
                    collection: attrs.map((x) => x.value).join(),
                    storeType: commercialSign
                        ? commercialSign?.code.includes('I.CODE')
                            ? 'icode'
                            : 'ikks'
                        : 'ikks'
                }
            })
            return pins
        }
    }

    /**
     * @function handleStoreEmpty
     * @description Function that resets the original stores (which are cached) when the search is empty
     */
    const handleStoreEmpty = async () => {
        setMapPins(null)
        setAllStores(null)
        numberStoresFound(0, [])
        setSearchInput('')
        setnumberOfStoresNearMe(0)
        moveListToTop()
        setSearchType(null)
        commonInfo.setCity(null)
        setCityInfo('empty')

        history.push({
            pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}`,
            state: {
                city: null,
                lat: null,
                lng: null
            }
        })
    }

    /**
     * Selects a postal code and sets the country options based on the location.
     * @param {Object} item - An object containing the location data for the postal code.
     * @param {number} item.geometry.location.lat - The latitude of the location.
     * @param {number} item.geometry.location.lng - The longitude of the location.
     */
    const selectPostalCodeCountry = (item) => {
        const postalCodeLocation = {
            lat: item.geometry.location.lat(),
            lng: item.geometry.location.lng()
        }
        setCountryOptions([])
        handleStoreSearch(searchInput, postalCodeLocation)
    }

    /**
     * Finds the user's country using their current location.
     * @param {string} input - The input to be used for searching for stores.
     */
    const findUserCountry = (input) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const geocoder = new google.maps.Geocoder()
                var latlng = new google.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude
                )
                geocoder.geocode({latLng: latlng}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        const country = results[results.length - 1].formatted_address
                        geocoder.geocode({address: input}, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                let postalCodeLocation
                                let countries = []
                                results.forEach((element) => {
                                    if (element.formatted_address.includes(country)) {
                                        postalCodeLocation = {
                                            lat: element.geometry.location.lat(),
                                            lng: element.geometry.location.lng()
                                        }
                                    } else {
                                        countries.push(element)
                                    }
                                })
                                if (postalCodeLocation) {
                                    handleStoreSearch(input, postalCodeLocation)
                                } else if (countries.length == 1) {
                                    postalCodeLocation = {
                                        lat: countries[0].geometry.location.lat(),
                                        lng: countries[0].geometry.location.lng()
                                    }
                                    handleStoreSearch(input, postalCodeLocation)
                                } else if (countries.length > 1) {
                                    setSearchInput(input)
                                    setMapPins(null)
                                    numberStoresFound(0, [])
                                    setAllStores(null)
                                    setDebounceLoading(false)
                                    moveListToTop()
                                    setCountryOptions(countries)
                                }
                            } else {
                                handleStoreSearch(input)
                            }
                        })
                    }
                })
            },
            (err) => {
                // conducting search even geolocation is disabled
                handleStoreSearch(input)
                console.warn(`ERROR(${err.code}): ${err.message}`)
            }
        )
    }

    /**
     * @function handleStoreSearch
     * @description Function that filters the stores according to the search performed
     * @param input string -> Search Term
     */
    const handleStoreSearch = async (input: string, postalCodeLocation: any, pagination: boolean) => {
        let storesNear = []
        let storedStores = commonInfo.getStoresData()
        let storedCity = commonInfo.getCity()

        checkFilters().then(filters => {
            if (filters.proximisGroups.includes(filters.param)) {
                isFiltered.isFiltered = true
                isFiltered.filterGroupID = filters.param
            }
        })

        if (!isFiltered.isFiltered && params && params.groupId && proximisGroups.includes(params.groupId)) {
            isFiltered.isFiltered = true
            isFiltered.filterGroupID = params.groupId
        }

        if (isFiltered.isFiltered && (input == null || input == 'undefined' || input == '' || input == isFiltered.filterGroupID.split('_').join(' '))) {
            const clientSecret = (await useStoresHook.getClientSecret({
            })) || []
            const storeSearchFetch =
                (await useStoresHook.setStoreSearch({
                    groupID : isFiltered.filterGroupID,
                    groupType : 'c_typology',
                    data: 'data',
                    clientSecret: clientSecret,
                    start : allStores && allStores.length > 0 ? allStores.length : 0
                    })) || []
            setTotalStores(storeSearchFetch.total)

            if (storeSearchFetch.next && storeSearchFetch.next != null) {
                setHasPagination(true)
            } else {
                setHasPagination(false)
                input = isFiltered.filterGroupID.split('_').join(' ')
            }

            storesNear = allStores ? allStores : storesNear
            storesNear = [...storesNear, ...storeSearchFetch.hits]
        }

        commonInfo.setCity(input)
        setSearchType('store')
        getMaxDistance()

        if (input != null) {
            if ((isFiltered.isFiltered && storesNear.length > 0) || (storedCity == input && storedStores && storedStores.length > 0)) {
                if (storedStores && storedStores.length > 0 && !hasPagination) {
                    storesNear = storedStores
                }
                let pins: MapPin[] = buildMapPins(storesNear)
                setMapPins(pins)
                numberStoresFound(storesNear.length, storesNear)
                setNumberOfStores(totalStores)
                setAllStores(storesNear)
                setNoResultFound(false)
                setnumberOfStoresNearMe(0)
                setDebounceLoading(false)
                setSearchInput('')
            } else {
                // @ts-ignore
                // for google maps api
                let lagLongobj
                let placesService = new google.maps.places.PlacesService(document.createElement('div')) //empty element. just to instantiate
                const request = {
                    query: input
                }
                // call google places  API
                await placesService.textSearch(request, async function(results, status) {
                // for google maps api
                // @ts-ignore
                if (isFiltered.isFiltered && storesNear.length > 0) {
                    lagLongobj = {
                        lat: storesNear[0].latitude,
                        lng: storesNear[0].longitude
                    }
                } else if (status === google.maps.places.PlacesServiceStatus.OK) {
                    if (postalCodeLocation) {
                        lagLongobj = {
                            lat: postalCodeLocation.lat,
                            lng: postalCodeLocation.lng
                        }
                    } else {
                        // get the first element(lat and lng props) of the results returned from google maps (the first element will be the most accurate)
                        lagLongobj = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        }
                    }
                }
                if (lagLongobj) {
                    setLtdLng(lagLongobj)
                    // checks if the most relevant element found from Google Maps is a country
                    // if it is a country, the max distance will be 500km

                    // if it is not a country, the max distance will be 25km
                    // this is to avoid the case where the user enters a country name and the stores are too far away
                    // https://developers.google.com/maps/documentation/places/web-service/supported_types
                    let countryExists = false
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].types.includes('country')) {
                            countryExists = true
                            break
                        }
                    }
                    // Calls OCAPI with the lat and lng of the most relevant element found from Google Map
                    if (storesNear.length == 0) {
                        let storesNearResults =
                        (await useStoresHook.getStoresNear({
                            latitude: lagLongobj.lat,
                            longitude: lagLongobj.lng,
                            distance: (countryExists) ? 400 : maxDistance
                        })) || []
                    
                        if (isFiltered.isFiltered) {
                            storesNearResults.forEach((element) => {
                                if (
                                    element['c_typology'] &&
                                    element['c_typology'] != 'undefined' && 
                                    element['c_typology'].includes(isFiltered.filterGroupID)
                                ) {
                                    storesNear.push(element)
                                }
                            })
                            storesNearResults = storesNear
                        }

                        // Filter stores by commercial sign code
                        let siteSign
                        if (appOrigin.includes('icode') || appOrigin.includes('ikks')) {
                            siteSign = appOrigin.includes('icode') ? 'I.CODE' : 'IKKS'
                        } else {
                            siteSign = 'IKKS'
                        }
                        if (siteSign == 'I.CODE') {
                            storesNearResults.forEach((element) => {
                                let commercialSign
                                if (
                                    element.c_commercialSign &&
                                    element.c_commercialSign != 'undefined'
                                ) {
                                    commercialSign = JSON.parse(element.c_commercialSign)
                                }
                                if (commercialSign?.code) {
                                    if (
                                        commercialSign?.code.includes('I.CODE') ||
                                        commercialSign?.code.includes('ICODE')
                                    ) {
                                        // Check if storesNear already contains an identical element
                                        const isDuplicate = storesNear.some((store) => {
                                            return (
                                                store.id === element.id
                                            )
                                        })
                                        if (!isDuplicate) {
                                            storesNear.push(element)
                                        }
                                    }
                                }
                            })
                        } else {
                            storesNear = [...storesNearResults]
                        }
                    }

                    if (storesNear.length > 0) {
                        if ((input == 'undefined' && isFiltered.isFiltered) || !isFiltered.isFiltered) {
                            commonInfo.setStoresData(storesNear)
                        }
                        let pins: MapPin[] = buildMapPins(storesNear)
                        setMapPins(pins)
                        numberStoresFound(storesNear.length, storesNear)
                        setAllStores(storesNear)
                        setNoResultFound(false)
                        setnumberOfStoresNearMe(0)
                        setDebounceLoading(false)
                        setSearchInput(input)
                    } else {
                        setCountryOptions([])
                        setnumberOfStoresNearMe(-1)
                        setMapPins(null)
                        setAllStores(null)
                        numberStoresFound(0, [])
                        setSearchInput('')
                    }
                }
            })
        }
            moveListToTop()
        } else {
            setSearchInput('')
            setMapPins(null)
            numberStoresFound(0, [])
            setAllStores(null)
            setDebounceLoading(false)
            moveListToTop()
        }
    }

    /**
     * @function moveListToTop
     * @description Move div of stores to the top
     */
    const moveListToTop = () => {
        let storeList = document.getElementById('store-list')
        if (storeList) {
            let firstChild = storeList.firstElementChild
            firstChild.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'})
        }
    }

    /**
     * @function getStoresByUserLocation
     * @description Function that searches for stores near to the user's location
     */
    const getStoresByUserLocation = () => {
        setSearchInput('')
        navigator.geolocation.getCurrentPosition(getUserCoords, error)
    }

    /**
     * @function error
     * @description when the user denied access to geolocation
     */
    const error = (err) => {
        // TODO
        // User denied Geolocation
        console.log(err)
    }

    /**
     * @function getUserCoords
     * @description Obtain user coordinates after user allows access to geolocation
     */
    const getUserCoords = async (pos) => {
        getUserCoordsResult(pos.coords.latitude, pos.coords.longitude)
    }

    const getUserCoordsResult = async (lat, lng) => {
        setSearchType('location')
        let lagLongobj = {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        }
        setLtdLng(lagLongobj)
        setDebounceLoading(true)
        let storesData = []

        let storesResponse =
            (await useStoresHook.getStoresNear({
                latitude: lat,
                longitude: lng,
                distance: maxDistance
            })) || []

        let siteSign
        if (appOrigin.includes('icode') || appOrigin.includes('ikks')) {
            siteSign = appOrigin.includes('icode') ? 'I.CODE' : 'IKKS'
        } else {
            siteSign = 'IKKS'
        }

        if (siteSign == 'I.CODE') {
            storesResponse.forEach((element) => {
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
            storesData = [...storesResponse]
        }

        if (storesData.length > 0) {
            commonInfo.setStoresData(storesData)
            let pins: MapPin[] = buildMapPins(storesData)
            setCountryOptions([])
            setnumberOfStoresNearMe(storesData.length)
            setMapPins(pins)
            setAllStores(storesData)
            numberStoresFound(0, storesData)
            setSearchInput('')
        } else {
            setCountryOptions([])
            setnumberOfStoresNearMe(-1)
            setMapPins(null)
            setAllStores(null)
            numberStoresFound(0, [])
            setSearchInput('')
        }
        setDebounceLoading(false)
        setDistanceLoading(false)
    }

    /**
     * @function numberStoresFound
     * @description Function that determines the number of stores resulting from the search
     */
    const numberStoresFound = (number, stores) => {
        setAllStores(stores)
        stores?.length === 0 ? setNumberOfStores(-1) : setNumberOfStores(number)
    }

    /**
     * Handles the change event of the stores selection.
     * @param {Object} event - The event object.
     * @param {string} event.target.value - The value of the checkbox input.
     * @param {boolean} event.target.checked - The checked state of the checkbox input.
     */
    const handleChange = (event) => {
        setSelectedStores((selectedStores) => {
            if (selectedStores.includes(event.target.value)) {
                return selectedStores.filter((item) => item !== event.target.value)
            } else {
                return [...selectedStores, event.target.value]
            }
        })
    }

    /**
    * Handles the event of showing more stores.
    * Calls the handleStoreSearch function with empty strings and a true value to show more stores.
    */
    const handleShowMore = () => {
        handleStoreSearch("", "", true)
    }

    // Seo  
    const seoTitle = `
    ${intl.formatMessage(
        {
            defaultMessage: 'Boutiques de Vêtements',
            id: 'store_locator_seo_result_page_title_1'
        }
    )}
    ${seoBrandName}
    ${intl.formatMessage(
        {
            defaultMessage: 'près de',
            id: 'store_locator_seo_result_page_title_2'
        }
    )}
    ${seoCityName}
    `
    
    const seoDesc = `
    ${intl.formatMessage(
        {
            defaultMessage:
                'Toutes les Boutiques de Vêtements',
            id: 'store_locator_seo_result_page_desc_1'
        }
    )}
    ${seoBrandName}
    ${intl.formatMessage(
        {
            defaultMessage:
                'pour votre recherche près de',
            id: 'store_locator_seo_result_page_desc_2'
        }
    )}
    ${seoCityName}
    ${intl.formatMessage(
        {
            defaultMessage:
                'Retrouvez toutes les coordonnées de vos magasins',
            id: 'store_locator_seo_result_page_desc_3'
        }
    )}
    ${seoBrandName}
    ${intl.formatMessage(
        {
            defaultMessage:
                'sur notre Store Locator.',
            id: 'store_locator_seo_result_page_desc_4'
        }
    )}
    `

    const locale = intl?.locale

    // To avoid flashing a loader if the loading is very fast, you could implement a minimum delay.
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 200)
    }, [])
    
    return (
        <>
     {loading ? (
                <Center>     
                    <Skeleton height="75vh" width="100%" />   
                </Center>
      ) : (
        <>
        <Seo locale={locale} title={seoTitle} description={seoDesc} />
        <Box>
                <ClickStoreContext.Provider value={[storeClickID, setStoreClickID]}>
                    <Container maxHeight={{lg: '772px'}} backgroundColor={'w'}>
                        <Flex display={'flex'} flex={1}>
                            <StoreBreadCrumb
                                activePage="result"
                                params={params}
                                cityInfo={cityInfo}
                            />
                        </Flex>
                        {searchType && (
                            <Flex display={'flex'} flex={1}>
                                <Heading as={'h1'} {...styles.title}>
                                {params.groupId && !params.city ? (
                                        <>
                                            {intl.formatMessage({
                                                defaultMessage:
                                                    'Boutiques de vêtement - ',
                                                id: 'storelocator.storeresults.filter'
                                            })}{' '}
                                            {params.groupId ? decodeURI(params.groupId).split('_').join(' ') : ''}
                                        </>
                                    ) : (
                                        <>
                                            {intl.formatMessage({
                                                defaultMessage: 'Boutiques de vêtements près de',
                                                id: 'storelocator.storeresults.clothing_stores_near'
                                            })}{' '}
                                            {params.city ? decodeURI(params.city).split('-').join(' ') : ''}
                                        </>
                                    )}
                                    
                                    
                                </Heading>
                            </Flex>
                        )}
                        <StoreSearch
                            searchInput={searchInput}
                            handleStoreSearch={handleStoreSearch}
                            numberOfStores={numberOfStores}
                            getStoresByUserLocation={getStoresByUserLocation}
                            numberOfStoresNearMe={numberOfStoresNearMe}
                            handleStoreEmpty={handleStoreEmpty}
                            groupId={params.groupId}
                        ></StoreSearch>

                        {searchType == 'location' && countryOptions.length == 0 && (
                            <>
                                <Heading
                                    as={'h2'}
                                    {...styles.subtitle}
                                    height={{base: 'auto', lg: '21px'}}
                                >
                                    {siteCode.getSiteCodeId() === 'ICODE' ? (
                                        <>
                                            {intl.formatMessage({
                                                defaultMessage: 'Résultats pour votre recherche ICODE près de',
                                                id: 'storelocator.storeresults.results_icode'
                                            })}{' '}
                                            {params.city ? decodeURI(params.city).split('-').join(' ') : ''}
                                        </>
                                    ) : (
                                        <>
                                            {intl.formatMessage({
                                                defaultMessage: 'Résultats pour votre recherche près de',
                                                id: 'storelocator.storeresults.results'
                                            })}{' '}
                                            {params.city ? decodeURI(params.city).split('-').join(' ') : ''}
                                        </>
                                    )}
                                </Heading>

                                {allStores && allStores.length > 0 && (
                                    <Text {...styles.subtext}>
                                        {allStores.filter((x) =>
                                            x.c_typology?.includes(
                                                selectedStores.sort().join() ||
                                                selectedStores.reverse().join()
                                            )
                                        ).length}{' '}
                                        {intl.formatMessage({
                                            defaultMessage: 'boutiques',
                                            id: 'storelocator.storeresults.boutiques'
                                        })}
                                </Text>
                                )}
                            </>
                        )}

                        {searchType == 'store' && countryOptions.length == 0 && (
                            <>
                                <Heading
                                    as={'h2'}
                                    {...styles.subtitle}
                                    height={{base: 'auto', lg: '21px'}}
                                >
                                    {params && params.groupId && !params.city ? (
                                        <>
                                            {intl.formatMessage({
                                                defaultMessage: 'Résultats pour votre recherche',
                                                id: 'storelocator.storeresults.no.location'
                                            })}{' '}
                                        </>
                                    ) : siteCode.getSiteCodeId() === 'ICODE' ? (
                                        <>
                                            {intl.formatMessage({
                                                defaultMessage: 'Résultats pour votre recherche ICODE près de',
                                                id: 'storelocator.storeresults.results_icode'
                                            })}{' '}
                                            {params.city ? decodeURI(params.city).split('-').join(' ') : ''}
                                        </>
                                    ) : (
                                        <>
                                            {intl.formatMessage({
                                                defaultMessage: 'Résultats pour votre recherche près de',
                                                id: 'storelocator.storeresults.results'
                                            })}{' '}
                                            {params.city ? decodeURI(params.city).split('-').join(' ') : ''}
                                        </>
                                    )}
                                </Heading>
                                {allStores && allStores.length > 0 && (
                                    <Text {...styles.subtext}>
                                        {totalStores && totalStores > 0 ? (
                                            totalStores
                                        ) : (
                                        allStores.filter((x) =>
                                            x.c_typology?.includes(
                                                selectedStores.sort().join() ||
                                                selectedStores.reverse().join()
                                            )
                                        ).length + ' '
                                    )}{' '}
                                    {intl.formatMessage({
                                        defaultMessage: 'boutiques',
                                        id: 'storelocator.storeresults.boutiques'
                                    })}
                                    </Text>
                                )}
                            </>
                        )}

                        {countryOptions.length > 1 && (
                            <>
                                <Text {...styles.searchDistanceTitle} marginTop="20px">
                                    {intl.formatMessage({
                                        defaultMessage:
                                            'Résultats trouvés dans différents pays. Veuillez en sélectionner un pour continuer',
                                        id: 'storelocator.storeresults.different_countries'
                                    })}
                                </Text>
                                <Flex>
                                    {countryOptions.map((item, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => selectPostalCodeCountry(item)}
                                            variant="link"
                                            size="sm"
                                        >
                                            <Text
                                                {...styles.searchDistanceText}
                                                textDecoration="underline"
                                                marginRight={2}
                                            >
                                                {
                                                    item.address_components[
                                                        item.address_components.length - 1
                                                    ].long_name
                                                }
                                            </Text>
                                        </Button>
                                    ))}
                                </Flex>
                            </>
                        )}

                        {!noResultFound &&
                            countryOptions.length == 0 &&
                            ((searchType == 'location' && numberOfStoresNearMe == -1) ||
                                (searchType == 'store' && allStores && allStores.length == 0)) && (
                                <Box {...styles.searchDistance}>
                                    <Text {...styles.searchDistanceTitle}>
                                        {intl.formatMessage({
                                            defaultMessage:
                                                'Désolé mais aucune boutique n’est disponible pour votre recherche.',
                                            id: 'storelocator.storeresults.no_result'
                                        })}
                                    </Text>
                                    <Flex direction={['column', 'column', 'row', 'row']}>
                                        <Text
                                            {...styles.searchDistanceText}
                                            marginRight={['0px', '2px', '2px', '2px']}
                                        >
                                            {intl.formatMessage({
                                                defaultMessage: 'Élargir votre recherche de :',
                                                id: 'storelocator.storeresults.expand_your_search'
                                            })}
                                        </Text>

                                        <Flex>
                                            {distanceOptions.map((item, index) => (
                                                <Button
                                                    key={index}
                                                    onClick={() => {
                                                        setMaxDistance(item)
                                                    }}
                                                    variant="link"
                                                    size="sm"
                                                >
                                                    <Text
                                                        {...styles.searchDistanceText}
                                                        textDecoration="underline"
                                                        marginLeft={2}
                                                    >{`${item}km${
                                                        index + 1 == distanceOptions.length
                                                            ? ''
                                                            : ','
                                                    }`}</Text>
                                                </Button>
                                            ))}
                                        </Flex>
                                    </Flex>
                                </Box>
                            )}

                        {noResultFound && (
                            <Text {...styles.subtext}>
                                {0 + ' '}
                                {intl.formatMessage({
                                    defaultMessage: 'boutiques',
                                    id: 'storelocator.storeresults.boutiques'
                                })}
                            </Text>
                        )}

                        {allStores && mapPins && googleApiKey && (
                            <Stack
                                visibility={
                                    (searchType == 'location' && numberOfStoresNearMe == -1) ||
                                    (searchType == 'store' && allStores.length == 0)
                                        ? 'hidden'
                                        : 'visible'
                                }
                                maxHeight={
                                    (searchType == 'location' && numberOfStoresNearMe == -1) ||
                                    (searchType == 'store' && allStores.length == 0)
                                        ? '0'
                                        : 'unset'
                                }
                                display="flex"
                                width={'100%'}
                                direction={{base: 'column', lg: 'row'}}
                                minHeight={
                                    (searchType == 'location' && numberOfStoresNearMe == -1) ||
                                    (searchType == 'store' && allStores.length == 0)
                                        ? '0'
                                        : '492px'
                                }
                                marginTop="32px"
                                spacing={{base: '0px', lg: '37px'}}
                            >
                                <Flex
                                    display={{base: 'contents', lg: 'flex'}}
                                    flex={1}
                                    direction={{base: 'column', md: 'column'}}
                                    width={{base: '100%', lg: '448px'}}
                                    minHeight={'492px'}
                                    position={'relative'}
                                >
                                    {siteCode.getSiteCodeId() == 'IKKS' && (
                                        <Popover>
                                            <PopoverTrigger>
                                                <Box
                                                    {...styles.filterField}
                                                    marginBottom={{base: '32px', lg: '37px'}}
                                                >
                                                    <Box
                                                        {...styles.filterFieldInput}
                                                        title={
                                                            selectedStores &&
                                                            selectedStores.toString()
                                                        }
                                                    >
                                                        {selectedStores.length > 0 ? (
                                                            selectedStores
                                                                .toString()
                                                                .substring(0, 30)
                                                        ) : (
                                                            <FormattedMessage
                                                                defaultMessage="AFFINER VOTRE RECHERCHE"
                                                                id="store_locator_refine_your_search"
                                                            />
                                                        )}
                                                    </Box>
                                                    <Button
                                                        {...styles.filterFieldButton}
                                                        _hover={{}}
                                                        _active={{}}
                                                    >
                                                        <Icon
                                                            {...styles.filterFieldIcon}
                                                            color="black"
                                                            as={DropIcon}
                                                        />
                                                    </Button>
                                                </Box>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <PopoverHeader pt={5}>
                                                    <Text
                                                        fontFamily={'BebasNeue'}
                                                        fontSize="22px"
                                                        fontWeight="500"
                                                    >
                                                        <FormattedMessage
                                                            defaultMessage="COLLECTIONS"
                                                            id="store_locator_collection_title"
                                                        />
                                                    </Text>
                                                </PopoverHeader>
                                                <PopoverBody>
                                                    <Stack
                                                        spacing={3}
                                                        direction="column"
                                                        pb={5}
                                                        pl={4}
                                                        pr={4}
                                                    >
                                                        {collections &&
                                                            collections.sort().map((item) => (
                                                                <Checkbox
                                                                    onChange={handleChange}
                                                                    key={item}
                                                                    value={item}
                                                                >
                                                                    {item}
                                                                </Checkbox>
                                                            ))
                                                        }
                                                    </Stack>
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    <Flex
                                        marginTop={{base: '41px', lg: '0px'}}
                                        flex={1}
                                        width={'100%'}
                                        order={{
                                            base: allStores && allStores.length > 0 ? 3 : 2,
                                            lg: 2
                                        }}
                                    >
                                        {debounceLoading === true ? (
                                            <Box textAlign={'center'}>
                                                <Spinner
                                                    thickness="4px"
                                                    speed="0.65s"
                                                    emptyColor="gray.200"
                                                    color="blue.500"
                                                    size="xl"
                                                />
                                            </Box>
                                        ) : (
                                            <StoreCard
                                                ltdLng={ltdLng}
                                                searchTerm={searchInput}
                                                numberStoresFound={numberStoresFound}
                                                stores={allStores.filter((x) =>
                                                    x.c_typology?.includes(
                                                        selectedStores.sort().join() ||
                                                            selectedStores.reverse().join()
                                                    )
                                                )}
                                                groupId={isFiltered.isFiltered ? isFiltered.filterGroupID : ''}
                                                hasPagination={hasPagination}
                                                handleShowMore={handleShowMore}
                                            >
                                            </StoreCard>
                                        )}
                                        
                                    </Flex>
                                </Flex>
                                <Flex flex={1} width={'100%'} minHeight="492px">
                                    <StoreMapWrapper
                                        refreshEnabled={isFiltered.isFiltered ? false : true}
                                        ltdLng={ltdLng}
                                        minHeight="492px"
                                        pins={
                                            selectedStores.length > 0
                                                ? mapPins.filter((x) =>
                                                      x.collection.includes(selectedStores.join())
                                                  )
                                                : mapPins
                                        }
                                        apiKey={sitePref.getSitePreferences()?.c_ikks_googleMapKey}
                                    ></StoreMapWrapper>
                                </Flex>
                            </Stack>
                        )}
                    </Container>
                </ClickStoreContext.Provider>
        </Box>
        </>
      )}
        </>
        
    )
}

StoreLocator.getTemplateName = () => 'Store Locator'

StoreLocator.shouldGetProps = ({previousLocation, location}) =>
    !previousLocation || previousLocation.pathname !== location.pathname

StoreLocator.getProps = async ({res, params}) => {
    const appOrigin = getAppOrigin()
    if (res) {
        res.set('Cache-Control', 'max-age=900')
    }

    //SEO
    const {city} = params || {}
    const seoBrandName = appOrigin.includes('icode') ? 'ICODE' : 'IKKS'
    const seoCityName = city
    //...

    return {appOrigin, seoBrandName, seoCityName, params}
}

StoreLocator.propTypes = {
    stores: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    appOrigin: PropTypes.string
}

export default StoreLocator
