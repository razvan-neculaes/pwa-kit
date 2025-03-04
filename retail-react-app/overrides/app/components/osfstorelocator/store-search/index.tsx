// React Imports
import React, {useRef, useState, useCallback, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
// Translations
import {useIntl} from 'react-intl'

// Components
import {
    Flex,
    FormControl,
    Heading,
    Input,
    Stack,
    Text,
    Link,
    Box,
    InputLeftAddon,
    InputGroup,
    Icon,
    InputRightAddon,
    Button,
    useStyleConfig
} from '@chakra-ui/react'
import {SmallCloseIcon} from '@chakra-ui/icons'
import {InputSearchIcon, MiniPinIcon} from '../../icons'

// debounce
import debounce from 'lodash/debounce'

// Interfaces
import {IStoreSearch} from '../../utils/osfstorelocator/storelocator_types'

import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'
import {useLocation} from '../../../hooks/use-location'

/**
 * Store Search Component used on stores page.
 */
const StoreSearch = (props: IStoreSearch): JSX.Element => {
    const siteCode = useSiteCode()
    const commonInfo = useCommonInfo()
    const {getAccurateLocation} = useLocation()
    const history = useHistory()
    //Instantiate resource object
    const intl = useIntl()
    const inputGroupRef = useRef<HTMLInputElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const styles = useStyleConfig(`StoreLocatorSearch${siteCode.getSiteCodeId()}`)

    //React use State
    const [searchInput, setSearchInput] = useState<string>('')
    const [info, setInfo] = useState('')

    useEffect(() => {
        setSearchInput(props.searchInput)
    }, [props.searchInput])

    /**
     * @function onSearchInputChange
     * @description On click function.Function that detects when the user is typing something in the search input
     */
    const onSearchInputChange = (event) => {
        setSearchInput(event.target.value)
    }

    const debouncedChangeHandler = useCallback(debounce(onSearchInputChange, 0), [])

    // remove accentuated characters
    const normalizeText = (value) => {
        return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }

    const handleLocationClickByCoords = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const geocoder = new google.maps.Geocoder()
                    var latlng = new google.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    )
                    geocoder.geocode({latLng: latlng}, function(results, status) {
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
                                    lng: position.coords.longitude
                                }
                            })
                        }
                    })
                },
                () => {
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

    /**
     * @function onClickXIcon
     * @description On click function. Function that detects when user clicks on "X" icon
     */
    const onClickXIcon = () => {
        let storedFilters = commonInfo.getFilters() || props.groupId

        if (storedFilters) {
            history.push({
                pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${storedFilters}`,
            })
        } else {
            setSearchInput('')
            props.handleStoreEmpty()
            inputRef.current.value = ''
        }
    }

    const onClickSearch = async () => {
        if (searchInput !== '') {
            let storedCity = commonInfo.getCity()
            let storedStores = commonInfo.getStoresData()
            const formattedText = searchInput.toLowerCase().split(' ').join('-')
            let storedFilters = commonInfo.getFilters() || props.groupId
            let lagLongobj

            if (storedStores && storedCity && (searchInput != storedCity) && !storedFilters) {
                lagLongobj = {
                    lat: storedStores[0].latitude,
                    lng: storedStores[0].longitude
                }
                history.push({
                    pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${normalizeText(
                        formattedText
                    )}/${lagLongobj.lat.toFixed(3)},${lagLongobj.lng.toFixed(3)}`,
                    state: {inputParameter: searchInput}
                })
            } else {
                let placesService = new google.maps.places.PlacesService(document.createElement('div')) //empty element. just to instantiate

                const request = {
                    query: searchInput
                }

                // call google places  API
                await placesService.textSearch(request, async function(results, status) {
                    // for google maps api
                    // @ts-ignore
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // get the first element(lat and lng props) of the results returned from google maps (the first element will be the most accurate)
                        lagLongobj = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        }
                        if (storedFilters) {
                            history.push({
                                pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${storedFilters}/${normalizeText(
                                    formattedText
                                )}/${lagLongobj.lat.toFixed(3)},${lagLongobj.lng.toFixed(3)}`,
                                state: {inputParameter: searchInput}
                            })
                        } else {
                            history.push({
                                pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${normalizeText(
                                    formattedText
                                )}/${lagLongobj.lat.toFixed(3)},${lagLongobj.lng.toFixed(3)}`,
                                state: {inputParameter: searchInput}
                            })
                        }
                    }
                })
            }
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            onClickSearch()
        }
    }

    return (
        <>
            <Flex
                display={'flex'}
                flexDirection={{base: 'column', lg: 'row'}}
                height={{base: 'unset', lg: '55px'}}
                flex={1}
                justifyContent="space-between"
                alignItems="center"
                {...styles.searchBox}
            >
                <Box
                    display={'flex'}
                    alignItems="center"
                    flexDirection={{base: 'column', lg: 'row'}}
                    width={{base: '100%', lg: 'unset'}}
                >
                    <Button
                        onClick={() => handleLocationClickByCoords()}
                        {...styles.nearButton}
                        width={{base: '100%', lg: '320px'}}
                    >
                        <Icon {...styles.nearButtonIcon} as={MiniPinIcon} />
                        <Text {...styles.nearButtonText}>
                            {' '}
                            {intl.formatMessage({
                                defaultMessage: 'Localisez-moi',
                                id: 'storelocator.storesearch.locate_me'
                            })}
                        </Text>
                    </Button>
                    <Text fontSize={'sm'} color="#CC4747" fontWeight={'500'} marginLeft={{base: '0', lg: '10px'}}
                        marginBottom={{base: '10px', lg: '0px'}} marginTop={{base: '10px', lg: '0px'}}>
                        {info}
                    </Text>
                </Box>
                <Text {...styles.ou} display={{base: 'none', lg: 'flex'}}>
                    {intl.formatMessage({
                        defaultMessage: 'Ou',
                        id: 'storelocator.storesearch.or'
                    })}
                </Text>

                <Box {...styles.searchField} width={{base: '100%', lg: '324px'}}>
                    <Box {...styles.searchFieldInput}>
                        <FormControl>
                            <InputGroup
                                {...styles.searchFormGroup}
                                width={'100%'}
                                ref={inputGroupRef}
                                className="input-group"
                            >
                                <Input
                                    {...styles.searchFormInput}
                                    placeholder={intl.formatMessage({
                                        defaultMessage: 'Ville, Code Postal ou Adresse',
                                        id: 'storelocator.storesearch.city_postal_code_or_address'
                                    })}
                                    _placeholder={{color: '#CCCCCC'}}
                                    color={'#000'}
                                    type="text"
                                    onChange={debouncedChangeHandler}
                                    borderWidth={'0px'}
                                    ref={inputRef}
                                    _focus={{
                                        borderColor: 'none',
                                        borderStyle: 'none',
                                        borderWidth: 'none'
                                    }}
                                    defaultValue={props.searchInput && props.searchInput}
                                    onKeyPress={handleKeyPress}
                                />
                                {props.searchInput.length > 0 && (
                                    <InputRightAddon
                                        {...styles.searchFormClose}
                                        onClick={() => onClickXIcon()}
                                        borderWidth={'0px'}
                                        children={<SmallCloseIcon />}
                                        _hover={{
                                            cursor: 'pointer'
                                        }}
                                    />
                                )}
                            </InputGroup>
                        </FormControl>
                    </Box>
                    <Button {...styles.searchFieldIcon} onClick={() => onClickSearch()}>
                        <Icon color="white" as={InputSearchIcon} />
                    </Button>
                </Box>
            </Flex>
        </>
    )
}

export default StoreSearch
