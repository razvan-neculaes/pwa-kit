import React, {useState, useEffect} from 'react'
import {loadGoogleMapApi} from '../../../utils/osfstorelocator/LoadGoogleMapApi'
// Components
import {
    Box,
    Text,
    Heading,
    Stack,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    useMultiStyleConfig,
    Spinner,
    Flex,
} from '@chakra-ui/react'

// Others
import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'

import {SearchIcon, IkksLocation} from '../../icons'
import {FormattedMessage, useIntl} from 'react-intl'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useSitePref from '../../../commerce-api/hooks/useSitePreferences'
import {useHistory} from 'react-router-dom'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'
import {useLocation} from '../../../hooks/use-location'
import StoreBreadCrumb from '../store-breadcrumb'
import TagManager from 'react-gtm-module'

const StoreLanding = ({...props}) => {
    const siteCode = useSiteCode()
    const sitePref = useSitePref()
    const styles = useMultiStyleConfig('Landing')
    const history = useHistory()
    const commonInfo = useCommonInfo()
    const {getAccurateLocation} = useLocation()
    const [status, setStatus] = useState(false)
    const [info, setInfo] = useState('')
    const [text, setText] = useState('')
    const intl = useIntl()
    const [mapScriptLoaded, SetMapScriptLoaded] = useState(false)
    const [GTMInit, setGTMInit] = useState(false)

    useEffect(() => {
        commonInfo.setFilters(null)
        commonInfo.setStoresData(null)
        const url = new URL(window.location.href)
        const searchParams = new URLSearchParams(url.search)
        const siteID = siteCode.getSiteCodeId()
        let param
        // if there are multiple parameters return to the previous page
        if (searchParams.toString().split('&').length > 1) {
            history.push('/')
        } else {
            param = searchParams.get('filter')
            if (param) {
                // if there is a different parameter for the icode website return to the previous page
                if (siteID === 'ICODE' && (param.includes('xo') || param.includes('ikks'))) {
                    history.push('/')
                } else {
                    history.push({
                        pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${param}`,
                    })
                }
            }
        }
    }, [])

    useEffect(() => {
        // for google maps api
        // @ts-ignore
        if (window.google) {
            SetMapScriptLoaded(true)
        }
        if (!mapScriptLoaded && sitePref.getSitePreferences()?.c_ikks_googleMapKey) {
            const googleMapScript = loadGoogleMapApi(
                sitePref.getSitePreferences()?.c_ikks_googleMapKey,
                intl?.locale
            )
            googleMapScript.addEventListener('load', function () {
                SetMapScriptLoaded(true)
            })
        }

        const gtmenabled = sitePref.getSitePreferences()?.c_ikks_gtmenabled
        if (gtmenabled && !GTMInit) {
            TagManager.dataLayer({
                dataLayer: {
                    event: 'page_view',
                    page_path: window.location.href,
                    page_title: document.title,
                },
                dataLayerName: 'dataLayer',
            })
            setGTMInit(true)
        }
    }, [mapScriptLoaded, sitePref])

    // remove accentuated characters
    const normalizeText = (value) => {
        return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }

    const handleLocationClickByCoords = (event) => {
        event.preventDefault()
        if (!navigator.geolocation) {
            setStatus(false)
            setInfo(
                intl.formatMessage({
                    defaultMessage: 'Geolocation is not supported by your browser',
                    id: 'storelocator_geolocation_unsupported_browser_error_message',
                })
            )
        } else {
            setInfo('')
            setStatus(true)
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const geocoder = new google.maps.Geocoder()
                    var latlng = new google.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    )
                    geocoder.geocode({latLng: latlng}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            const city = getAccurateLocation(results)
                            history.push({
                                pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${normalizeText(
                                    city
                                )}/${position.coords.latitude.toFixed(
                                    3
                                )},${position.coords.longitude.toFixed(3)}`,
                                state: {
                                    city: city,
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                },
                            })
                        }
                    })
                },
                () => {
                    setStatus(false)
                    setInfo(
                        intl.formatMessage({
                            defaultMessage: 'Unable to retrieve your location"',
                            id: 'storelocator_geolocation_retrieve_error_message',
                        })
                    )
                }
            )
        }
    }

    const handleLocationChangeByText = (event) => {
        setText(event.target.value)
    }

    const handleLocationClickByText = async (event) => {
        event.preventDefault()
        if (text === '') return

        let storedCity = commonInfo.getCity()
        let storedStores = commonInfo.getStoresData()
        let formattedText = text.toLowerCase().replace(/ /g, '-')
        let storedFilters = commonInfo.getFilters()

        let lagLongobj

        if (isNaN(formattedText)) {
            commonInfo.setCity(text)

            if (storedStores && storedCity && text != storedCity && !storedFilters) {
                lagLongobj = {
                    lat: storedStores[0].latitude,
                    lng: storedStores[0].longitude,
                }
                history.push({
                    pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${normalizeText(
                        formattedText
                    )}/${lagLongobj.lat.toFixed(3)},${lagLongobj.lng.toFixed(3)}`,
                    state: {inputParameter: text},
                })
            } else {
                commonInfo.setFilters(null)

                let placesService = new google.maps.places.PlacesService(
                    document.createElement('div')
                ) //empty element. just to instantiate
                const request = {
                    query: text,
                }

                // call google places  API
                await placesService.textSearch(request, async function (results, status) {
                    // for google maps api
                    // @ts-ignore
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // get the first element(lat and lng props) of the results returned from google maps (the first element will be the most accurate)
                        lagLongobj = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng(),
                        }
                        history.push({
                            pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${normalizeText(
                                formattedText
                            )}/${lagLongobj.lat.toFixed(3)},${lagLongobj.lng.toFixed(3)}`,
                            state: {inputParameter: text},
                        })
                    }
                })
            }
        } else {
            history.push({
                pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${formattedText}/0,0`,
                state: {inputParameter: text},
            })
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLocationClickByText(event)
        }
    }

    return (
        <Box {...styles.container}>
            {mapScriptLoaded && (
                <Box {...styles.content}>
                    <Flex display={'flex'} flex={1}>
                        <StoreBreadCrumb activePage="home" />
                    </Flex>
                    <Box
                        backgroundImage={getAssetUrl(
                            `static/img/landing-${
                                siteCode && siteCode.getSiteCodeId() == 'IKKS'
                                    ? 'ikks'
                                    : siteCode.getSiteCodeId() == 'ICODE'
                                    ? 'icode'
                                    : ''
                            }.jpg`
                        )}
                        marginBottom={{base: 0, md: 10}}
                        height={{base: '690px'}}
                        position={{lg: 'relative'}}
                        {...props}
                    >
                        <Stack align={'center'} width={'100%'} pl={5} pr={5}>
                            <Stack
                                spacing={{base: '5px '}}
                                w={{lg: '620px', sm: '504px', base: '100%'}}
                                h={'250px'}
                                mt={'220px'}
                                backgroundColor={'white'}
                                align={'center'}
                            >
                                <Heading
                                    as="h1"
                                    fontSize={siteCode.getSiteCodeId() == 'IKKS' ? '28px' : '16px'}
                                    fontFamily={
                                        siteCode.getSiteCodeId() == 'IKKS'
                                            ? 'BebasNeue'
                                            : 'Montserrat'
                                    }
                                    fontWeight={siteCode.getSiteCodeId() == 'IKKS' ? '400' : '500'}
                                    textTransform={
                                        siteCode.getSiteCodeId() == 'IKKS' ? '' : 'uppercase'
                                    }
                                    textAlign={'center'}
                                    mt={'32px'}
                                    mb={'21px'}
                                >
                                    <FormattedMessage
                                        defaultMessage="Trouver une boutique"
                                        id="store_locator_landing_title"
                                    />
                                </Heading>

                                <Stack
                                    width={{lg: '455px', sm: '344px', base: '100%'}}
                                    pl={3}
                                    pr={3}
                                >
                                    <Button
                                        target="_blank"
                                        paddingX={7}
                                        _hover={{textDecoration: 'none'}}
                                        backgroundColor={
                                            siteCode.getSiteCodeId() == 'IKKS'
                                                ? 'black'
                                                : siteCode.getSiteCodeId() == 'ICODE'
                                                ? '#9C895D'
                                                : null
                                        }
                                        width={'100%'}
                                        height={'41px'}
                                        leftIcon={
                                            status ? (
                                                <Spinner />
                                            ) : (
                                                <IkksLocation width={'13'} height={'15'} />
                                            )
                                        }
                                        fontSize={{base: '16px'}}
                                        fontFamily={
                                            siteCode.getSiteCodeId() == 'IKKS'
                                                ? 'Roboto'
                                                : 'Montserrat'
                                        }
                                        fontWeight={'400'}
                                        borderRadius={0}
                                        onClick={handleLocationClickByCoords}
                                    >
                                        <FormattedMessage
                                            defaultMessage="Localisez-moi"
                                            id="store_locator_locate_me"
                                        />
                                    </Button>
                                </Stack>
                                <Text fontSize={'sm'} color="#CC4747" fontWeight={'500'}>
                                    {info}
                                </Text>
                                <Text fontWeight={500} fontSize={'16px'}>
                                    <FormattedMessage
                                        defaultMessage="Ou"
                                        id="store_locator_text_or"
                                    />
                                </Text>
                                <Stack
                                    width={{lg: '455px', sm: '344px', base: '100%'}}
                                    pl={3}
                                    pr={3}
                                >
                                    <InputGroup width={'100%'} height={'41px'}>
                                        <InputRightElement
                                            backgroundColor={
                                                siteCode.getSiteCodeId() == 'IKKS'
                                                    ? 'black'
                                                    : siteCode.getSiteCodeId() == 'ICODE'
                                                    ? '#9C895D'
                                                    : null
                                            }
                                            cursor={'pointer'}
                                            onClick={handleLocationClickByText}
                                        >
                                            <SearchIcon color={'white'} w={'20px'} h={'20px'} />
                                        </InputRightElement>
                                        <Input
                                            type={'text'}
                                            fontFamily={
                                                siteCode.getSiteCodeId() == 'IKKS'
                                                    ? 'Roboto'
                                                    : 'Montserrat'
                                            }
                                            placeholder={intl.formatMessage({
                                                defaultMessage: 'Ville, Code Postal ou Adresse',
                                                id: 'storelocator.storesearch.city_postal_code_or_address',
                                            })}
                                            borderRadius={0}
                                            fontSize={'16px'}
                                            textAlign={'center'}
                                            value={text}
                                            onChange={handleLocationChangeByText}
                                            onKeyPress={handleKeyPress}
                                        />
                                    </InputGroup>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default StoreLanding
