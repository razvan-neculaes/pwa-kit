import React, {useEffect, useState} from 'react'
import {HStack, VStack, Box, Text, Flex, Heading, Link, Image} from '@chakra-ui/react'
import {IkksPhone, IkksRoute} from '../../icons'
import {FormattedMessage} from 'react-intl'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'
import useStores from '../../../commerce-api/hooks/useStores'
import useCommonInfo from '../../../commerce-api/hooks/useCommonInfo'

const StoreAddress = (store) => {
    const siteCode = useSiteCode()
    const res = store.store
    const useStoresHook = useStores()
    const [image, setImage] = useState('')
    const [images, setImages] = useState('')
    const commonInfo = useCommonInfo()

    /**
    * fetchContentAsset is a function that fetches the content asset of the store brand name
    * @param {string} storeBrandName - The store brand name
    * @returns {object} storeImage - The store image
    */
    const fetchContentAsset = async () => {
        let contentIkks = await useStoresHook.getContentAsset({contentAssetId: 'Storelocator-Store-IKKS'})
        let contentIcode = await useStoresHook.getContentAsset({contentAssetId: 'Storelocator-Store-ICODE'})
        let imageIkks = getImageInfoFromHtml(contentIkks)
        let imageIcode = getImageInfoFromHtml(contentIcode)
        let images = {imageIkks, imageIcode}

        return images
    }

    /**
    * fetchData is an async function that fetches the content asset and sets the store images.
    */
    const fetchData = async () => {
        if (!images) {
            let storeImages = await fetchContentAsset()
            commonInfo.setStoreImages(storeImages)
            setImages(storeImages)
        }
    }

    /**
    * useEffect hook to fetch store images from commonInfo
    */
    useEffect(() => {
        const images = commonInfo.getStoreImages()
        fetchData(images)
    }, [commonInfo])
    

    /**
    * useEffect hook to set the store image based on the store brand name
    */
    useEffect(() => {
        let commercialSign = JSON.parse(res.c_commercialSign)
        let storeBrandName = commercialSign?.code.includes('I.CODE') ? 'icode' : 'ikks'
        
        if (storeBrandName && images) {
            let storeImage = storeBrandName === 'ikks' ? images.imageIkks : storeBrandName === 'icode' ? images.imageIcode : null
            setImage(storeImage)
        }
    }, [store])

    /**
    * Parses an HTML string and returns an object containing the image URL and alt text of the first image found in the string.
    *
    * @param {string} htmlString The HTML string to parse.
    * @returns {Object|null} An object containing the image URL and alt text of the first image found in the string, or null if no image is found.
    */
    function getImageInfoFromHtml(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const imgElement = doc.querySelector('img');
        
        if (imgElement) {
            const imageUrl = imgElement.src;
            const altText = imgElement.alt;
            return { imageUrl, altText };
        }

        return null;
    }

    return (
        <>
            <HStack alignItems={'flex-start'}>
                <Box w="40%">
                    <Image
                        src={image && image.imageUrl ? image.imageUrl : ""}
                        alt={image && image.altText ? image.altText : ""}
                    />
                </Box>
                <Box w="60%">
                    <Heading
                        as="h2"
                        fontSize={siteCode.getSiteCodeId() == 'IKKS' ? '22px' : '16px'}
                        fontFamily={siteCode.getSiteCodeId() == 'IKKS' ? 'BebasNeue' : 'Montserrat'}
                        fontWeight={siteCode.getSiteCodeId() == 'IKKS' ? '400' : '700'}
                        color={'black'}
                        marginBottom={{base: '19px', lg: '19px', md: '19px', sm: '0px', xs: '0px'}}
                    >
                        <FormattedMessage
                            defaultMessage="COORDONNÉES MAGASIN "
                            id="store_locator_address_contact_information"
                        />
                        <br />
                        <Text
                            as="span"
                            mt={'5px'}
                            fontFamily={
                                siteCode.getSiteCodeId() == 'IKKS' ? 'BebasNeue' : 'Montserrat'
                            }
                            fontSize={siteCode.getSiteCodeId() == 'IKKS' ? '20px' : '16px'}
                            fontWeight={'400'}
                        >
                            {`${res.address1} `}
                            <br />
                            {`${res.postalCode} `} {`${res.city} `} 
                        </Text>
                    </Heading>
                    
                    <VStack
                        alignItems={'flex-start'}
                        fontSize={'16px'}
                        fontFamily={'Roboto'}
                        fontWeight={'400'}
                    >
                        <Text as={'u'}>
                            <IkksPhone width={'15px'} height={'15px'} mr={'12px'} mb={'4px'} />
                            <Link href={`tel:${res.phone}`}>{res.phone}</Link>
                        </Text>
                        <Flex>
                            <IkksRoute width={'17px'} height={'17px'} mr={'12px'} mb={'4px'} />
                            <Box
                                display={['block', 'none', 'none', 'none']}
                                textDecoration="underline"
                            >
                                <a
                                    target="_blank"
                                    href={`https://www.google.com/maps/dir//${res.latitude},${res.longitude}/@${res.latitude},${res.longitude},12z`}
                                    rel="noreferrer"
                                >
                                    <FormattedMessage
                                        defaultMessage="Obtenir l’itinéraire"
                                        id="store_locator_address_get_directions"
                                    />
                                </a>
                            </Box>
                            <Box
                                display={['none', 'block', 'block', 'block']}
                                textDecoration="underline"
                            >
                                <a
                                    target="_blank"
                                    href={`https://www.google.com/maps/dir//${
                                        res.address1
                                    } ${res.postalCode + ' ' + res.city}/@${
                                        res.address1
                                    } ${res.postalCode + ' ' + res.city},12z`}
                                    rel="noreferrer"
                                >
                                    <FormattedMessage
                                        defaultMessage="Obtenir l’itinéraire"
                                        id="store_locator_address_get_directions"
                                    />
                                </a>
                            </Box>
                        </Flex>
                    </VStack>
                </Box>
            </HStack>
        </>
    )
}

export default StoreAddress
