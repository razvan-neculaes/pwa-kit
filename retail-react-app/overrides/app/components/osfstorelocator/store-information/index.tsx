// React Imports
import React, {useContext, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'
import {getAssetUrl} from 'pwa-kit-react-sdk/ssr/universal/utils'

// Components
import {
    Box,
    Text,
    UnorderedList,
    ListItem,
    Flex,
    Spacer,
    Icon,
    SimpleGrid,
    useStyleConfig,
    Heading,
    Image
} from '@chakra-ui/react'

import {CallIcon, InformationIcon, MarkerIcon, RouteIcon} from '../../icons'

// React Context
import {ClickStoreContext} from '../../../pages/osfstorelocator'

// Interfaces
import {IStoreInformationArray} from '../../../utils/osfstorelocator/storelocator_types'

// Translations
import {useIntl} from 'react-intl'

import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'
import {useTimezone} from '../../../hooks/use-timezone'
import {useWorkingHours} from '../../../hooks/use-working-hours'

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
 * Store Information Component used on stores page.
 * Here a list of all stores is built from the data returned from the API
 */
const StoreInformationComponent = (props: IStoreInformationArray): JSX.Element => {
    const siteCode = useSiteCode()
    const commonInfo = useCommonInfo()
    const {getUTCOffset} = useTimezone()
    const {getWorkingHours} = useWorkingHours()
    //Instantiate resource object
    const intl = useIntl()
    const [val, setVal] = useContext(ClickStoreContext)
    const [storeActive, setStoreActive] = useState<string>('')
    const [phoneVisibility, setPhoneVisibility] = useState<string>(null)
    const [calculatedStores, setCalculatedStores] = useState<array>([])
    const styles = useStyleConfig(`StoreLocatorInformation${siteCode.getSiteCodeId()}`)

    /**
     * @function storeClick
     * @description saves the store ID that is clicked
     */
    const storeClick = (id) => {
        setVal(id)
    }

    useEffect(() => {
        if (val !== storeActive) {
            let oldStore = document.getElementById(storeActive)

            if (oldStore) {
                // @ts-ignore
                oldStore.style.borderColor = '#C9C9C9'
            }

            let store = document.getElementById(val)

            if (store) {
                // scroll to element
                const onScroll = () => {
                    const parent = document.getElementById('store-wrapper')

                    const relativeTop =
                        window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop

                    parent.scrollTo({
                        behavior: 'smooth',
                        top: store.offsetTop - relativeTop
                    })
                }

                window.removeEventListener('scroll', onScroll)
                window.addEventListener('scroll', onScroll)
                onScroll()

                // @ts-ignore
                store.style.borderColor = '#0176D3'
                // in the end, remove again event listener
                window.removeEventListener('scroll', onScroll)
            }

            setStoreActive(val)
        }
    }, [val])

    /**
     * @function buildStore
     * @description Function that builds a list of stores
     * @returns list of stores
     */

    useEffect(() => {
        const rad = (x) => {
            return (x * Math.PI) / 180
        }
        const d = new Date()
        const utc = d.getTime() + d.getTimezoneOffset() * 60000
        const newStores = [...props.stores]

        newStores.forEach((store) => {
            const nd = new Date(utc + 3600000 * getUTCOffset(store.countryCode))
            const currentTime = nd.toLocaleString('en-US', {hour12: true})
            const dayValue = daysMap[moment(currentTime).format('dddd')]
            const hourValue = moment(currentTime).format('HH:mm')

            const R = 6378137 // Earth’s mean radius in meter
            const dLat = rad(props.ltdLng.lat - store.latitude)
            const dLong = rad(props.ltdLng.lng - store.longitude)
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(store.latitude)) *
                    Math.cos(rad(props.ltdLng.lat)) *
                    Math.sin(dLong / 2) *
                    Math.sin(dLong / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = ((R * c) / 1000).toFixed(1)

            let storeTypeName = 'none'
            let storeBrandName
            let timeCheck = false
            let typology = ''
            let commercialSign = ''
            let workingHours = ''
            let storeTags = []
            let storeIcon = ''
            if (store.c_commercialSign && store.c_commercialSign != 'undefined') {
                commercialSign = JSON.parse(store.c_commercialSign)
                storeIcon = commercialSign?.code.includes('I.CODE') ? 'icon-icode' : 'icon-ikks'
                storeBrandName = commercialSign?.code.includes('I.CODE') ? 'icode' : 'ikks'
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
                                        storeTags.push('Xando')
                                        storeIcon = 'icon-xando'
                                    }
                                    if (value == 'Outlets') {
                                        storeTags.push('Outlets')
                                        storeIcon = 'icon-outlet'
                                    }
                                    if (value == 'Indépendant' || value == 'Ind-pendant') {
                                        storeTags.push('Indépendant')
                                        storeIcon =
                                            commercialSign?.code.includes('I.CODE') ||
                                            commercialSign?.code.includes('ICODE')
                                                ? 'icon-icode-independant'
                                                : 'icon-ikks-independant'
                                    }
                                    if (value == 'Corner-ikks') {
                                        storeTags.push('Corner IKKS')
                                        storeIcon = 'icon-ikks'
                                    }
                                    if (value == 'Ikks-stores') {
                                        storeTags.push('IKKS Stores')
                                        storeIcon =
                                            commercialSign?.code.includes('I.CODE') ||
                                            commercialSign?.code.includes('ICODE')
                                                ? 'icon-icode'
                                                : 'icon-ikks'
                                    }
                                })

                                if (attributeValues.find((value) => value == 'Indépendant' || value == 'Ind-pendant')) {
                                    storeTypeName = 'independant'
                                } else if (
                                    attributeValues.find((value) => value == 'Corner-ikks')
                                ) {
                                    storeTypeName = 'ikks-corner'
                                } else if (
                                    attributeValues.find((value) => value == 'Ikks-stores')
                                ) {
                                    storeTypeName = 'ikks-stores'
                                }
                                if (attributeValues.find((value) => value == 'Xando')) {
                                    storeBrandName = 'xando'
                                }
                            }
                        }
                    })
                })
            }

            if (store.c_workingSchedule && store.c_commercialSign != 'undefined') {
                const workingSchedule = JSON.parse(store.c_workingSchedule)
                timeCheck = getWorkingHours(workingSchedule, dayValue, hourValue).timeCheck
                workingHours = getWorkingHours(workingSchedule, dayValue, hourValue).workingHours
            }
            store.storeTypeName = storeTypeName
            store.storeBrandName = storeBrandName
            store.icon = storeIcon
            store.tags = storeTags
            store.workingHours = workingHours
            store.isOpen = timeCheck
            store.calculatedDistance = isNaN(distance) ? '' : distance
            store.storeType = commercialSign
                ? commercialSign?.code.includes('I.CODE')
                    ? 'icode'
                    : 'ikks'
                : 'ikks'
        })

        if (!props.hasPagination) {
            const sortingWithType = ['ikks-stores', 'ikks-corner', 'independant', 'none']
            const sortingWithBrand = ['ikks', 'icode', 'xando']
    
            newStores.sort(function(a, b) {
                return a.calculatedDistance - b.calculatedDistance
            })
    
            newStores.sort(function(a, b) {
                var abrand = sortingWithBrand.indexOf(a.storeBrandName)
                var bbrand = sortingWithBrand.indexOf(b.storeBrandName)
                var brand_diff = abrand - bbrand
                return brand_diff
            })
    
            newStores.sort(function(a, b) {
                var atype = sortingWithType.indexOf(a.storeTypeName)
                var btype = sortingWithType.indexOf(b.storeTypeName)
                var type_diff = atype - btype
                return type_diff
            })
        }

        setCalculatedStores(newStores)
    }, [props.stores, props.ltdLng])

    const renameStore = (val) => {
        let newName = ''
        const storeWords = val.split(' ')
        storeWords.forEach((word, index) => {
            newName = newName + word.toLowerCase()
            if (index != storeWords.length - 1) {
                newName = newName + '-'
            }
        })
        return newName
    }

    const buildStore = () => {
        return (
            <>
                <UnorderedList marginLeft={'0px'} paddingRight={{base: '0px', lg: '11px'}}>
                    {props.searchTerm && (
                        <Heading as={'h2'} {...styles.locationTitle}>
                            {props.searchTerm}
                        </Heading>
                    )}
                    {calculatedStores.length > 0 &&
                        calculatedStores.map((store) => (
                            <ListItem listStyleType={'none'} key={store.id}>
                                <Box {...styles.container} id={store.id} height={'auto'}>
                                    <Flex flex={1} direction={['column', 'row', 'row', 'row']}>
                                        <Flex>
                                            <Box width="57px" minWidth="57px">
                                                <Image
                                                    src={getAssetUrl(
                                                        `static/img/icons/${store.icon}.png`
                                                    )}
                                                />
                                            </Box>
                                            <Box>
                                                <Heading
                                                    as={'h3'}
                                                    {...styles.title}
                                                    height={'auto'}
                                                    onClick={() => storeClick(store.id)}
                                                    cursor="pointer"
                                                >
                                                    {store.name}
                                                </Heading>
                                                <Text {...styles.address1}>{store.address1}</Text>
                                                <Text {...styles.address2}>
                                                    {store.postalCode + ' ' + store.city}
                                                </Text>
                                                <Flex
                                                    {...styles.text}
                                                    flexDirection={{
                                                        base: 'column',
                                                        sm: 'row',
                                                        lg: 'row'
                                                    }}
                                                >
                                                    <Flex>
                                                        <Text
                                                            {...styles.status}
                                                            color={store.isOpen ? 'green' : 'red'}
                                                        >
                                                            {store.isOpen ? (
                                                                <>
                                                                    {intl.formatMessage({
                                                                        defaultMessage: 'OUVERT',
                                                                        id: 'storelocator.storeinformation.open'
                                                                    })}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {store.workingHours !==
                                                                        undefined &&
                                                                        intl.formatMessage({
                                                                            defaultMessage: 'FERMÉ',
                                                                            id: 'storelocator.storeinformation.closed'
                                                                        })}
                                                                </>
                                                            )}
                                                        </Text>
                                                    </Flex>

                                                    {store.workingHours && (
                                                        <Flex
                                                            marginTop={{
                                                                base: '5px',
                                                                sm: '0px',
                                                                lg: '0px'
                                                            }}
                                                        >
                                                            <Text
                                                                {...styles.dash}
                                                                display={{
                                                                    base: 'none',
                                                                    sm: 'flex',
                                                                    lg: 'flex'
                                                                }}
                                                            >
                                                                -
                                                            </Text>
                                                            <Text {...styles.schedule}>
                                                                {intl.formatMessage({
                                                                    defaultMessage:
                                                                        'Horaire du jour :',
                                                                    id:
                                                                        'storelocator.storeinformation.day_schedule'
                                                                })}
                                                            </Text>
                                                            <Text {...styles.hours}>
                                                                {store.workingHours}
                                                            </Text>
                                                        </Flex>
                                                    )}
                                                </Flex>
                                            </Box>
                                        </Flex>
                                        <Spacer />
                                        <Box
                                            justifyContent="flex-end"
                                            marginTop={['10px', '0px', '0px', '0px']}
                                            marginLeft={['58px', '0px', '0px', '0px']}
                                        >
                                            <Flex>
                                                <>
                                                    {store.tags.length > 0 &&
                                                        store.tags.map((item, index) => (
                                                            <Text key={index} {...styles.location}>
                                                                {item}
                                                            </Text>
                                                        ))}
                                                </>
                                                {props.searchTerm && (
                                                    <Text
                                                        {...styles.distance}
                                                    >{store.calculatedDistance ? `${store.calculatedDistance} km` : ''}</Text>
                                                )}
                                            </Flex>
                                        </Box>
                                    </Flex>
                                    <SimpleGrid
                                        columns={[2, 4, 4, 4]}
                                        {...styles.footer}
                                        justifyContent="space-between"
                                    >
                                        {phoneVisibility === store.id ? (
                                            <Flex {...styles.footerItem}>
                                                <a href={`tel:${store.phone}`}>
                                                    <Text {...styles.footerText}>
                                                        {store.phone}
                                                    </Text>
                                                </a>
                                            </Flex>
                                        ) : (
                                            <Flex
                                                {...styles.footerItem}
                                                onClick={() => setPhoneVisibility(store.id)}
                                            >
                                                <Icon
                                                    {...styles.footerIcon}
                                                    color="black"
                                                    as={CallIcon}
                                                />
                                                <Text {...styles.footerText}>
                                                    {intl.formatMessage({
                                                        defaultMessage: 'Appeler',
                                                        id: 'storelocator.storeinformation.call'
                                                    })}
                                                </Text>
                                            </Flex>
                                        )}
                                        <Flex
                                            {...styles.footerItem}
                                            onClick={() => storeClick(store.id)}
                                        >
                                            <Icon
                                                {...styles.footerIcon}
                                                color="black"
                                                as={MarkerIcon}
                                            />
                                            <Text {...styles.footerText}>
                                                {intl.formatMessage({
                                                    defaultMessage: 'Localiser',
                                                    id: 'storelocator.storeinformation.locate'
                                                })}
                                            </Text>
                                        </Flex>
                                        <Flex
                                            {...styles.footerItem}
                                            marginTop={['10px', '0px', '0px', '0px']}
                                        >
                                            <Icon
                                                {...styles.footerIcon}
                                                color="black"
                                                as={RouteIcon}
                                            />
                                            <Box display={['block', 'none', 'none', 'none']}>
                                                <a
                                                    target="_blank"
                                                    href={`https://www.google.com/maps/dir//${store.latitude},${store.longitude}/@${store.latitude},${store.longitude},12z`}
                                                    rel="noreferrer"
                                                >
                                                    <Text {...styles.footerText}>
                                                        {intl.formatMessage({
                                                            defaultMessage: 'Itinéraire',
                                                            id:
                                                                'storelocator.storeinformation.route'
                                                        })}
                                                    </Text>
                                                </a>
                                            </Box>
                                            <Box display={['none', 'block', 'block', 'block']}>
                                                <a
                                                    target="_blank"
                                                    href={`https://www.google.com/maps/dir//${
                                                        store.address1
                                                    } ${store.postalCode + ' ' + store.city}/@${
                                                        store.address1
                                                    } ${store.postalCode + ' ' + store.city},12z`}
                                                    rel="noreferrer"
                                                >
                                                    <Text {...styles.footerText}>
                                                        {intl.formatMessage({
                                                            defaultMessage: 'Itinéraire',
                                                            id:
                                                                'storelocator.storeinformation.route'
                                                        })}
                                                    </Text>
                                                </a>
                                            </Box>
                                        </Flex>
                                        <Link
                                            to={{
                                                pathname: props.groupId ? `/${commonInfo.getLanguage()}/${commonInfo.getStoreLink()}/${props.groupId}/${store.city
                                                    ?.toLowerCase()
                                                    .trim().replace(/[\s|\-]{2,}/g, '-')}/${renameStore(
                                                    store.name
                                                )}/${store.id}` : 
                                                `/${commonInfo.getLanguage()}/${commonInfo.getStoreLink()}/${store.city
                                                    ?.toLowerCase()
                                                    .trim().replace(/[\s|\-]{2,}/g, '-')}/${renameStore(
                                                    store.name
                                                )}/${store.id}`
                                            }}
                                        >
                                            <Flex
                                                {...styles.footerItem}
                                                marginTop={['10px', '0px', '0px', '0px']}
                                            >
                                                <Icon
                                                    {...styles.footerIcon}
                                                    color="black"
                                                    as={InformationIcon}
                                                />
                                                <Text {...styles.footerText}>
                                                    {intl.formatMessage({
                                                        defaultMessage: 'Voir la fiche',
                                                        id:
                                                            'storelocator.storeinformation.see_details'
                                                    })}
                                                </Text>
                                            </Flex>
                                        </Link>
                                    </SimpleGrid>
                                </Box>
                            </ListItem>
                        ))}
                </UnorderedList>
                <Box id="list-bottom"></Box>
            </>
        )
    }

    return <>{buildStore()}</>
}

export default StoreInformationComponent
