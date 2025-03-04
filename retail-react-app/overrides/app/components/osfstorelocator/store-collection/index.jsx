import React from 'react'
import {Stack, Box, Text, Image, Heading} from '@chakra-ui/react'
import {FormattedMessage} from 'react-intl'
import {getAssetUrl} from 'pwa-kit-react-sdk/ssr/universal/utils'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'

const StoreCollection = (store) => {
    const siteCode = useSiteCode()
    const groups = JSON.parse(store.store.c_typology).groups
    let collections = []
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

    return (
        <>
            <Heading
                as="h2"
                fontSize={siteCode.getSiteCodeId() == 'IKKS' ? '22px' : '16px'}
                fontFamily={siteCode.getSiteCodeId() == 'IKKS' ? 'BebasNeue' : 'Montserrat'}
                fontWeight={siteCode.getSiteCodeId() == 'IKKS' ? '400' : '700'}
                color={'black'}
                mb={'20px'}
            >
                <FormattedMessage
                    defaultMessage="COLLECTIONS"
                    id="store_locator_collection_title"
                />
            </Heading>
            <Stack direction="row" spacing="22px">
                {collections &&
                    collections.map((value, idx) => (
                        <Box key={idx}>
                            <Image
                                w={'70px'}
                                h={'70px'}
                                src={
                                    value === 'IKKS JUNIOR'
                                        ? getAssetUrl('static/img/collection-ikks-junior.png')
                                        : value === 'IKKS MEN'
                                        ? getAssetUrl('static/img/collection-ikks-men.png')
                                        : value === 'IKKS WOMEN'
                                        ? getAssetUrl('static/img/collection-ikks-women.png')
                                        : value === 'ICODE'
                                        ? getAssetUrl('static/img/collection-icode-missing.jpeg')
                                        : getAssetUrl('static/img/collection-default.png')
                                }
                                alt={value}
                                margin={'0 auto'}
                            />
                            <Box mt={'10px'} overflowY={'hidden'}>
                                <Text
                                    fontSize={'16px'}
                                    fontFamily={
                                        siteCode.getSiteCodeId() == 'IKKS' ? 'Roboto' : 'Montserrat'
                                    }
                                    fontWeight={'400'}
                                    color={'black'}
                                    textAlign={'center'}
                                >
                                    {value}
                                </Text>
                            </Box>
                        </Box>
                    ))}
            </Stack>
        </>
    )
}

export default StoreCollection
