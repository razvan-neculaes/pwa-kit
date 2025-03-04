import React from 'react'
import {Link} from 'react-router-dom'
import {Flex, Box, Text, Stack, useStyleConfig, Heading} from '@chakra-ui/react'
import {useIntl} from 'react-intl'
import PropTypes from 'prop-types'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'

const StoresNear = ({data}) => {
    const siteCode = useSiteCode()
    const commonInfo = useCommonInfo()
    const intl = useIntl()
    const styles = useStyleConfig(`StoreLocatorStoresNear${siteCode.getSiteCodeId()}`)

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
    return (
        <>
            <Flex flex={1}>
                <Heading as={'h3'} {...styles.storesNearTitle}>
                    {intl.formatMessage({
                        defaultMessage: 'Autres boutiques à proximité',
                        id: 'storelocator.storedetails.other_shops_nearby'
                    })}
                </Heading>
            </Flex>
            <Stack
                height={{base: '320px', md: '67px'}}
                direction={{base: 'column', md: 'row'}}
                {...styles.storesNearContainer}
            >
                {data.map((item, index) => (
                    <Link
                        key={index}
                        to={{
                            pathname: `/${commonInfo.getLanguage()}/${commonInfo.getStoreLink()}/${item.city
                                .toLowerCase()
                                .split(' ')
                                .join('-')}/${renameStore(item.name)}/${item.id}`
                        }}
                    >
                        <Box
                            {...styles.storesNearItem}
                            height={{base: '67px', md: '120px', lg: '67px'}}
                        >
                            <Text {...styles.storesNearName}>{item.name}</Text>
                            <Text {...styles.storesNearCity}>{item.city}</Text>
                        </Box>
                    </Link>
                ))}
            </Stack>
        </>
    )
}

StoresNear.propTypes = {
    data: PropTypes.array
}

export default StoresNear
