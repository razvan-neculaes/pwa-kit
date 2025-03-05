import React, {useEffect, useState} from 'react'

// Components
import {Flex, Text, useStyleConfig} from '@chakra-ui/react'

// Utils
import Link from '../../../components/link'

// Translations
import {useIntl} from 'react-intl'
import {useHistory} from 'react-router-dom'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'

const StoreBreadCrumb = ({activePage, storeName, params, cityInfo}) => {
    const intl = useIntl()
    const siteCode = useSiteCode()
    const commonInfo = useCommonInfo()
    const styles = useStyleConfig(`StoreLocatorBreadcrumb`)
    const history = useHistory()
    const [cityName, setCityName] = useState(null)

    useEffect(() => {
        if (cityInfo == 'empty') {
            setCityName(null)
        } else {
            if (params && params.city) {
                let cityParameter = ''
                if (decodeURI(params.city).includes('-')) {
                    cityParameter = decodeURI(params.city).split('-').join(' ')
                } else {
                    cityParameter = decodeURI(params.city)
                }
                setCityName(cityParameter)
            } else {
                setCityName(null)
            }
        }
    }, [params, cityInfo])

    const onClickSearch = async (val, isFilterSearch) => {
        if (val !== '') {
            const formattedText = val.split(' ').join('-')
            let storedCity = commonInfo.getCity()
            let storedStores = commonInfo.getStoresData()
            let lagLongobj

            if (isFilterSearch) {
                history.push({
                    pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${val}`,
                })
            } else if (storedStores && storedCity && (val != storedCity)) {
                lagLongobj = {
                    lat: storedStores[0].latitude,
                    lng: storedStores[0].longitude
                }
                if (params.groupId) {
                    history.push({
                        pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${params.groupId}/${formattedText}/${
                            lagLongobj.lat
                        },${lagLongobj.lng}`,
                        state: {inputParameter: val}
                    })
                } else {
                    history.push({
                        pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${formattedText}/${
                            lagLongobj.lat
                        },${lagLongobj.lng}`,
                        state: {inputParameter: val}
                    })
                }

            } else {
                let placesService = new google.maps.places.PlacesService(document.createElement('div')) //empty element. just to instantiate
                const request = {
                    query: val
                }

                // call google places  API
                await placesService.textSearch(request, async function(results, status) {
                    // for google maps api
                    // @ts-ignore
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // get the first element(lat and lng props) of the results returned from google maps (the first element will be the most accurate)
                        let lagLongobj = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        }

                        if (params.groupId) {
                            history.push({
                                pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${params.groupId}/${formattedText}/${
                                    lagLongobj.lat
                                },${lagLongobj.lng}`,
                                state: {inputParameter: val}
                            })
                        } else {
                            history.push({
                                pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${formattedText}/${
                                    lagLongobj.lat
                                },${lagLongobj.lng}`,
                                state: {inputParameter: val}
                            })
                        }
                    }
                })
            }
        }
    }

    return (
        <Flex
            {...styles.container}
            direction={['column', 'row', 'row', 'row']}
            alignItems={['flex-start', 'center', 'center', 'center']}
        >
            <Flex>
                <Text {...styles.title} textDecoration="underline">
                    <a
                        href={
                            siteCode.getSiteCodeId() == 'IKKS'
                                ? `https://www.ikks.com/${intl.locale}`
                                : siteCode.getSiteCodeId() == 'ICODE'
                                ? `https://www.icode.fr/${intl.locale}`
                                : ''
                        }
                    >
                        {intl.formatMessage({
                            defaultMessage: 'Accueil',
                            id: 'storelocator.accueil'
                        })}{' '}
                    </a>
                </Text>
                <Text {...styles.separator}>/</Text>
                <Text
                    {...styles.title}
                    textDecoration={activePage == 'home' ? 'none' : 'underline'}
                    pointerEvents={activePage == 'home' ? 'none' : 'all'}
                >
                    <Link to={`/`}>
                        {intl.formatMessage({
                            defaultMessage: 'Trouver une boutique',
                            id: 'storelocator.find_store'
                        })}{' '}
                    </Link>
                </Text>
                <Text {...styles.separator} display={['block', 'none', 'none', 'none']}>
                    /
                </Text>
            </Flex>
            <Flex
                wrap={'wrap'}
            >
                {params && params.groupId && (
                    <>
                        <Text {...styles.separator} display={['none', 'block', 'block', 'block']}>
                            /
                        </Text>
                        <Text
                            onClick={() => onClickSearch(params.groupId, true)}
                            {...styles.title}
                            {...styles.city}
                            textDecoration={activePage == 'result' && !params.city ? 'none' : 'underline'}
                            pointerEvents={activePage == 'result' && !params.city ? 'none' : 'all'}
                            cursor={activePage == 'result' && !params.city ? 'default' : 'pointer'}
                        >
                            {decodeURI(params.groupId).split('_').join(' ')}
                        </Text>
                    </>
                )}
                {cityName && (
                    <>
                        {params && params.groupId && (
                            <Text {...styles.separator} display={['block', 'none', 'none', 'none']}>
                                /
                            </Text>
                        )}
                        <Text {...styles.separator} display={['none', 'block', 'block', 'block']}>
                            /
                        </Text>
                        <Text
                            onClick={() => onClickSearch(cityName)}
                            {...styles.title}
                            {...styles.city}
                            textDecoration={activePage == 'result' ? 'none' : 'underline'}
                            pointerEvents={activePage == 'result' ? 'none' : 'all'}
                            cursor={activePage == 'result' ? 'default' : 'pointer'}
                        >
                            {cityName}
                        </Text>
                    </>
                )}
                {storeName && (
                    <>
                        <Text {...styles.separator}>/</Text>
                        <Text
                            {...styles.title}
                            textDecoration={activePage == 'detail' ? 'none' : 'underline'}
                            pointerEvents={activePage == 'detail' ? 'none' : 'all'}
                        >
                            {storeName}
                        </Text>
                    </>
                )}
            </Flex>
        </Flex>
    )
}

export default StoreBreadCrumb
