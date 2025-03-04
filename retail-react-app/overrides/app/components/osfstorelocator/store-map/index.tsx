// Components
import {Box, Text, AspectRatio, useStyleConfig} from '@chakra-ui/react'

// React Imports
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'

// React Context
import {ClickStoreContext} from '../../../pages/osfstorelocator'

// Interfaces
import {MapPin} from '../../../utils/osfstorelocator/storelocator_types'

// Translations
import {useIntl} from 'react-intl'

import {getAssetUrl} from 'pwa-kit-react-sdk/ssr/universal/utils'

import {useHistory} from 'react-router-dom'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'
import {useLocation} from '../../../hooks/use-location'

// MarkerClusterer
import {MarkerClusterer} from '@googlemaps/markerclusterer'
/**
 * Map component used on stores page and store details page.
 */
const Map = ({pins, minHeight, ltdLng, refreshEnabled, store}: {pins: MapPin[]}): JSX.Element => {
    const siteCode = useSiteCode()
    const mapRef = useRef<HTMLDivElement>(null)
    // for google maps api
    // @ts-ignore
    const [Map, setMap] = useState<google.maps.Map>(null)
    const prevMarkersRef = useRef([])
    const [storeID, setVal] = useContext(ClickStoreContext)
    const [previousPosition, setPreviousPosition] = useState(undefined)
    const history = useHistory()
    const commonInfo = useCommonInfo()
    const {getAccurateLocation} = useLocation()
    const [isloaded, setIsloaded] = useState(Boolean)
    const [isUnique, setIsUnique] = useState(Boolean)
    const [mapCenter, setMapCenter] = useState(null)
    const intl = useIntl()
    const selectedOpacity = '1'
    const styles = useStyleConfig(`StoreLocatorMap${siteCode.getSiteCodeId()}`)

    /**
     * @function clearMarkers
     * @description Function that clears markers from the map
     */
    const clearMarkers = (markers) => {
        if (markers) {
            for (let m of markers) {
                m.setMap(null)
            }
        }
    }

    /**
     * @function onClickMarkerStoreMap
     * @description Function that stores the marker that was clicked
     */
    const onClickMarkerStoreMap = (marker) => {
        setVal(marker)
    }

    /**
     * @function buildMarker
     * @description Function that builds the marker
     * @param pin - MapPin type object
     * @param selected - If this pin was clicked by the user
     * @returns marker - marker object
     */
    const buildMarker = (pin: MapPin) => {
        let marker

        marker = new google.maps.MarkerImage(
            getAssetUrl(`static/img/icons/${pin.icon}.png`),
            new google.maps.Size(40, 60), // size of the image
            new google.maps.Point(0, 0) // origin, in this case top-left corner
        )

        return marker
    }

    const translateOpen = intl.formatMessage({
        defaultMessage: 'OUVERT',
        id: 'storelocator.storeinformation.open'
    })
    const translateClosed = intl.formatMessage({
        defaultMessage: 'FERMÉ',
        id: 'storelocator.storeinformation.closed'
    })
    const translateSchedule = intl.formatMessage({
        defaultMessage: '- Horaire du jour :',
        id: 'storelocator.storeinformation.day_schedule'
    })

    // remove accentuated characters
    const normalizeText = (value) => {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
    }

    /**
     * @function generateMapPins
     * @description Function that generates the pins on the map
     * @param storeID - Store ID clicked (if it doesn't exist it's undefined)
     */
    const generateMapPins = useCallback(
        (storeID: string | undefined): void => {
            if ((isloaded !== true && !store) || store.id) {
                // for google maps api
                // @ts-ignore
                const bounds = new google.maps.LatLngBounds()
                let markers = []

                const map = new google.maps.Map(mapRef.current, {
                    zoom: 9,
                    center: {lat: ltdLng.lat, lng: ltdLng.lng}
                })

                google.maps.event.addListener(map, 'dragend', function() {
                    var center = map.getCenter()
                    var lat = center.lat()
                    var lng = center.lng()
                    setMapCenter({lat: lat, lng: lng})
                })

                let zoomLevel = pins.length > 1 ? 0 : -2
                google.maps.event.addListener(map, 'zoom_changed', function() {
                    zoomLevel = zoomLevel + 1
                    if (zoomLevel > 1) {
                        var center = map.getCenter()
                        var lat = center.lat()
                        var lng = center.lng()
                        setMapCenter({lat: lat, lng: lng})
                    }
                })

                if (pins) {
                    clearMarkers(prevMarkersRef.current) //clear prev markers
                    // @ts-ignore
                    let infowindow = new google.maps.InfoWindow()

                    prevMarkersRef.current = []

                    if (pins.length > 0) {
                        setPreviousPosition({lat: pins[0].latitude, lng: pins[0].longitude})
                    }

                    markers = pins.map((pin) => {
                        // for google maps api
                        // @ts-ignore
                        const position = new google.maps.LatLng({
                            lat: pin.latitude,
                            lng: pin.longitude
                        })

                        // for google maps api
                        // @ts-ignore
                        var marker = new google.maps.Marker({
                            position,
                            icon: buildMarker(pin),
                            map: Map,
                            clickable: pin.clickable,
                            storeID: pin.id
                        })
                        if (storeID === pin.id) {
                            marker.setOptions({opacity: 1})
                        } else {
                            marker.setOptions({opacity: 0.95})
                        }

                        let mqSE = window.matchMedia('(max-width: 570px)')
                        let content = ``
                        if (mqSE.matches) {
                            content = `<div class="map-pin-content">`
                            // window width is at less than 570px
                        } else {
                            let mqIpad = window.matchMedia('(max-width: 812px)')
                            if (mqIpad.matches) {
                                content = `<div class="google-maps-window-info" style="text-align: left; padding: 2px 14px 8px 4px">`
                            } else {
                                content = `<div class="google-maps-window-info" style="text-align: left;">`
                            }
                        }

                        content += `<div class="map-pin-name ${siteCode.getSiteCodeId()}">${
                            pin.name
                        }</div>
                        <div class="map-pin-address1 ${siteCode.getSiteCodeId()}">${
                            pin.address1
                        }</div>
                        <div class="map-pin-address2 ${siteCode.getSiteCodeId()}">${
                            pin.address2
                        }</div>
                        <div class="map-pin-text">

                       
                        <span class="map-pin-text-status ${siteCode.getSiteCodeId()} ${pin.isOpen ? 'open' : 'closed'}">${pin.workingHours ? (pin.workingHours && pin.isOpen ? translateOpen : translateClosed): ''}</span>
                            
                        <span class="map-pin-text-info ${siteCode.getSiteCodeId()}">${
                            pin.workingHours ? translateSchedule : ''
                        }</span>
                        <span class="map-pin-text-hours ${siteCode.getSiteCodeId()}">${
                            pin.workingHours ? pin.workingHours : ''
                        }</span>
                        </div>`

                        // append store hours property if exist
                        content +=
                            pin.hours !== undefined ? `<p><b>Store Hours</b>: ${pin.hours}</p>` : ``

                        // close div content(popup)
                        content += `</div>`

                        // if is the selected marker
                        if (marker.opacity === 1) {
                            infowindow.setContent(content)
                            infowindow.open(Map, marker)
                            map.setZoom(18)
                            map.setCenter(marker.getPosition())
                        }

                        // @ts-ignore
                        google.maps.event.addListener(marker, 'click', function() {
                            onClickMarkerStoreMap(this.storeID)
                        })

                        // for google maps api
                        // @ts-ignore
                        google.maps.event.addListener(Map, 'click', function() {
                            infowindow.close()
                        })

                        if (pin.unique === true) {
                            setIsloaded(true)
                            setIsUnique(true)
                        }

                        prevMarkersRef.current.push(marker)
                        bounds.extend(marker.getPosition())

                        return marker
                    })
                }

                if (isUnique || pins.length <= 2) {
                    Map.setZoom(6)
                }

                if (map.getZoom() !== 18) {
                    map.fitBounds(bounds)
                    if (pins.length === 1) {
                        setTimeout(() => {
                            map.setZoom(9)
                        }, 100)
                    }
                }

                // set previous position when we don't have any results
                if (pins.length === 0) {
                    let previousPlace = {lat: ltdLng.lat, lng: ltdLng.lng}
                    Map.setCenter(previousPlace)
                }

                new MarkerClusterer({map, markers})
            }
        },
        [pins, Map]
    )

    useEffect(() => {
        if (!Map) {
            if (mapRef.current) {
                // if else to better visibility
                if (pins[0].unique === true) {
                    setMap(
                        // for google maps api
                        // @ts-ignore
                        new window.google.maps.Map(mapRef.current, {
                            zoom: 12,
                            center: {
                                lat: pins[0].latitude,
                                lng: pins[0].longitude
                            },
                            disableDoubleClickZoom: true
                        })
                    )
                } else {
                    setMap(
                        // for google maps api
                        // @ts-ignore
                        new window.google.maps.Map(mapRef.current, {
                            zoom: 4
                        })
                    )
                }
            }
        }

        if (Map) {
            const marker = prevMarkersRef.current.find(marker => marker.storeID === storeID)
            if (store && store.id) {
                generateMapPins(store.id)
            } else {
                generateMapPins(marker ? storeID : null)
            }
        }
  
    }, [Map, generateMapPins, storeID, store])

    const refreshSearch = () => {
        const geocoder = new google.maps.Geocoder()
        var latlng = new google.maps.LatLng(mapCenter.lat, mapCenter.lng)
        geocoder.geocode({latLng: latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                const city = getAccurateLocation(results)
                if (city) {
                    history.push({
                        pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoresLink()}/${normalizeText(
                            city
                        )}/${mapCenter.lat.toFixed(3)},${mapCenter.lng.toFixed(3)}`,
                        state: {
                            city: city,
                            lat: mapCenter.lat,
                            lng: mapCenter.lng
                        }
                    })
                    setMapCenter(null)
                } else {
                    alert(
                        intl.formatMessage({
                            defaultMessage: 'Aucun résultat disponible pour cette coordonnée',
                            id: 'storelocator.map.no_result'
                        })
                    )
                }
            }
        })
    }

    return (
        <>
            {refreshEnabled && mapCenter && mapCenter.lat && mapCenter.lng && (
                <Box {...styles.refreshButton} onClick={refreshSearch}>
                    <Text {...styles.refreshText}>
                        {intl.formatMessage({
                            defaultMessage: 'Actualiser la liste des boutiques',
                            id: 'storelocator.map.refresh'
                        })}
                    </Text>
                </Box>
            )}
            <AspectRatio minHeight={{base: minHeight, md: minHeight, lg: minHeight}} ratio={4 / 3}>
                <Box
                    minHeight={{base: minHeight, md: minHeight, lg: minHeight}}
                    position={'initial'}
                    ref={mapRef}
                ></Box>
            </AspectRatio>
        </>
    )
}

export default Map
