// Components
import {Heading, Stack, Text, Box, Button} from '@chakra-ui/react'

// Components
import {SearchIcon} from '@chakra-ui/icons'

// React Importes
import React, {useState} from 'react'

// Project Components
import StoreInformationComponent from '../store-information'

// Interfaces
import {
    IStoreInformation,
    StoreCardInformation
} from '../../../utils/osfstorelocator/storelocator_types'

// Translations
import {useIntl} from 'react-intl'

import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'

/**
 * Store Card component used on stores page.
 */
const StoreCard = (props: StoreCardInformation): JSX.Element => {
    const siteCode = useSiteCode()
    //Instantiate resource object
    const intl = useIntl()
    const [stores, setStores] = useState<IStoreInformation[]>(props.stores)

    // update store list according to search
    React.useEffect(() => {
        setStores(props.stores)
    }, [props.searchTerm, props.stores, props.hasPagination])

    return (
        <>
            <Stack direction={{base: 'column', sm: 'row'}} w={'full'} margin={'0'}>
                {Array.isArray(stores) && stores.length > 0 ? (
                    <Box
                        overflowY="scroll"
                        textAlign="initial"
                        height={siteCode.getSiteCodeId() == 'IKKS' ? '450px' : '514px'}
                        width={'100%'}
                        id="store-wrapper"
                    >
                        <StoreInformationComponent
                            ltdLng={props.ltdLng}
                            stores={stores}
                            searchTerm={props.searchTerm}
                            groupId={props.groupId}
                            hasPagination={props.hasPagination}
                        ></StoreInformationComponent>

                        {props && props.hasPagination ? (
                            <Box
                            marginTop={'15px'}
                            display="flex"
                            justifyContent={'center'}
                        >
                            <Button
                                paddingX={7}
                                _hover={{textDecoration: 'none'}}
                                backgroundColor={
                                    siteCode.getSiteCodeId() === 'IKKS'
                                        ? 'black'
                                        : siteCode.getSiteCodeId() === 'ICODE'
                                        ? '#9C895D'
                                        : null
                                }
                                width={{base : '100%', md : '250px'}}
                                height={'41px'}
                                fontSize={{base: '16px'}}
                                fontFamily={
                                    siteCode.getSiteCodeId() === 'IKKS'
                                        ? 'Roboto'
                                        : 'Montserrat'
                                }
                                fontWeight={'600'}
                                borderRadius={0}
                                onClick={props.handleShowMore}
                            >
                                {intl.formatMessage({
                                defaultMessage: 'Show More',
                                id: 'storelocator.showmore'
                            })}
                            </Button>
                        </Box> ) : null}
                    </Box>
                ) : (
                    <Box
                        overflowY="hidden"
                        textAlign="center"
                        width={'100%'}
                        backgroundColor={'#F3F3F3'}
                        padding={'20px'}
                    >
                        <SearchIcon boxSize={16}></SearchIcon>
                        <Heading
                            paddingBottom={'20px'}
                            paddingTop={'20px'}
                            fontSize={'32px'}
                            lineHeight={'44.8px'}
                        >
                            {intl.formatMessage({
                                defaultMessage: 'No Stores Found',
                                id: 'storelocator.nostoresfound'
                            })}
                        </Heading>
                        <Text fontSize={'16px'} lineHeight={'24px'}>
                            {intl.formatMessage({
                                defaultMessage:
                                    'Use the search above to search a location or by store name.',
                                id: 'storelocator.nostoresfound.helptext'
                            })}
                        </Text>
                    </Box>
                )}
            </Stack>
        </>
    )
}

export default StoreCard
