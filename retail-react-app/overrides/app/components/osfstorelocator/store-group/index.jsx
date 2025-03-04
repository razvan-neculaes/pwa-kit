import React from 'react'
import {Stack, Box, Text, Heading} from '@chakra-ui/react'
import {FormattedMessage} from 'react-intl'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'

const StoreGroup = (groups) => {
    const siteCode = useSiteCode()
    const proximisGroups = groups.proximisGroups

    function FormattedMessageFixed(props) {
        return <FormattedMessage {...props} />
    }

    return (
        <>
            <Stack direction="column" spacing="22px">
                {proximisGroups && proximisGroups.length > 0 &&
                    proximisGroups.map((group, idx) => (
                        <Box key={idx}>
                            <Heading
                                as="h2"
                                fontSize={siteCode.getSiteCodeId() === 'IKKS' ? '22px' : '16px'}
                                fontFamily={siteCode.getSiteCodeId() === 'IKKS' ? 'BebasNeue' : 'Montserrat'}
                                fontWeight={siteCode.getSiteCodeId() === 'IKKS' ? '400' : '700'}
                                color={'black'}
                                mb={'20px'}
                            >
                                <FormattedMessageFixed
                                    defaultMessage={group.title}
                                    id={group.title}
                                />
                            </Heading>
                            <Box mt={'10px'} overflowY={'hidden'}>
                                <Text
                                    fontSize={'16px'}
                                    fontFamily={
                                        siteCode.getSiteCodeId() === 'IKKS' ? 'Roboto' : 'Montserrat'
                                    }
                                    fontWeight={'400'}
                                    color={'black'}
                                    textAlign={'left'}
                                    lineHeight={'16px'}
                                >
                                    <FormattedMessageFixed
                                        defaultMessage={group.text}
                                        id={group.text}
                                    />
                                </Text>
                            </Box>
                        </Box>
                    ))}
            </Stack>
        </>
    )
}

export default StoreGroup
