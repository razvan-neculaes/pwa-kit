// Google Import
import {loadGoogleMapApi} from '../../../utils/osfstorelocator/LoadGoogleMapApi'

// Components
import {Box, Heading} from '@chakra-ui/react'

// React Imports
import React, {useEffect, useState} from 'react'

// Project Components
import Map from '../store-map'

// Interfaces
import {GoogleMapProps} from '../../../utils/osfstorelocator/storelocator_types'

// Translations
import {useIntl} from 'react-intl'

/**
 * Store Map Wrapper component used on stores page and store details page.
 */
const StoreMapWrapper = ({
    apiKey,
    pins,
    minHeight,
    ltdLng,
    refreshEnabled,
    store
}: GoogleMapProps): JSX.Element => {
    //Instantiate resource object
    const intl = useIntl()
    const [mapScriptLoaded, SetMapScriptLoaded] = useState<boolean>(false)

    useEffect(() => {
        const googleMapScript = loadGoogleMapApi(apiKey, intl?.locale)
        // for google maps api
        // @ts-ignore
        if (window.google) {
            SetMapScriptLoaded(true)
        }

        if (!mapScriptLoaded) {
            googleMapScript.addEventListener('load', function() {
                SetMapScriptLoaded(true)
            })
        }
    }, [apiKey])

    return (
        <>
            <Box position={'relative'} width={'full'} overflow={'hidden'}>
                {mapScriptLoaded && pins ? (
                    <Map
                        pins={pins}
                        minHeight={minHeight}
                        ltdLng={ltdLng}
                        refreshEnabled={refreshEnabled}
                        store={store}
                    />
                ) : (
                    <Box top={'35%'} position={'relative'}>
                        <Heading>
                            {intl.formatMessage({
                                defaultMessage: 'Loading Map...',
                                id: 'storelocator.map.loading'
                            })}
                        </Heading>
                    </Box>
                )}
            </Box>
        </>
    )
}

export default StoreMapWrapper
