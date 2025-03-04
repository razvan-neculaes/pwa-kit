import React from 'react'
import {Flex, Box, Text, useStyleConfig, Heading} from '@chakra-ui/react'
import {useIntl} from 'react-intl'
import PropTypes from 'prop-types'
import useSiteCode from '../../../commerce-api/hooks/useSiteCode'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const StoreTimetable = ({data, storeStatus, noData}) => {
    const siteCode = useSiteCode()
    const styles = useStyleConfig(`StoreLocatorTimetable${siteCode.getSiteCodeId()}`)
    const intl = useIntl()

    const daysMessage = {
        monday: intl.formatMessage({
            defaultMessage: 'Lundi',
            id: 'storelocator.storedetails.monday'
        }),
        Lundi: intl.formatMessage({
            defaultMessage: 'Lundi',
            id: 'storelocator.storedetails.monday'
        }),
        tuesday: intl.formatMessage({
            defaultMessage: 'Mardi',
            id: 'storelocator.storedetails.tuesday'
        }),
        Mardi: intl.formatMessage({
            defaultMessage: 'Mardi',
            id: 'storelocator.storedetails.tuesday'
        }),
        wednesday: intl.formatMessage({
            defaultMessage: 'Mercredi',
            id: 'storelocator.storedetails.wednesday'
        }),
        Mercredi: intl.formatMessage({
            defaultMessage: 'Mercredi',
            id: 'storelocator.storedetails.wednesday'
        }),
        thursday: intl.formatMessage({
            defaultMessage: 'Jeudi',
            id: 'storelocator.storedetails.thursday'
        }),
        Jeudi: intl.formatMessage({
            defaultMessage: 'Jeudi',
            id: 'storelocator.storedetails.thursday'
        }),
        friday: intl.formatMessage({
            defaultMessage: 'Vendredi',
            id: 'storelocator.storedetails.friday'
        }),
        Vendredi: intl.formatMessage({
            defaultMessage: 'Vendredi',
            id: 'storelocator.storedetails.friday'
        }),
        saturday: intl.formatMessage({
            defaultMessage: 'Samedi',
            id: 'storelocator.storedetails.saturday'
        }),
        Samedi: intl.formatMessage({
            defaultMessage: 'Samedi',
            id: 'storelocator.storedetails.saturday'
        }),
        sunday: intl.formatMessage({
            defaultMessage: 'Dimanche',
            id: 'storelocator.storedetails.sunday'
        }),
        Dimanche: intl.formatMessage({
            defaultMessage: 'Dimanche',
            id: 'storelocator.storedetails.sunday'
        })
    }

    return (
        <>
            <Flex {...styles.timeTableHeader}>
                <Heading as={'h2'} {...styles.timeTableHeaderTitle}>
                    <>
                        {intl.formatMessage({
                            defaultMessage: 'Horaires d’ouverture',
                            id: 'storelocator.storedetail.openingTime'
                        })}
                        {data.length > 0 && ' - '}
                    </>
                </Heading>
                {data.length > 0 && (
                    <Text {...styles.timeTableHeaderStatus} color={storeStatus ? 'green' : 'red'}>
                        {storeStatus ? (
                            <>
                                {intl.formatMessage({
                                    defaultMessage: 'OUVERT',
                                    id: 'storelocator.storedetail.open'
                                })}
                            </>
                        ) : (noData ? null :
                            <>
                                {intl.formatMessage({
                                    defaultMessage: 'FERMÉ',
                                    id: 'storelocator.storedetail.closed'
                                })}
                            </>
                        )}
                    </Text>
                )}
            </Flex>

            <Flex {...styles.timeTable}>
                {data.length > 0 ? (
                    <>
                        {data.map((item, index) => (
                            <Box key={index} {...styles.timeTableColumn}>
                                <Box {...styles.timeTableRow} {...styles.timeTableRowBordered}>
                                    <Text {...styles.timeTableTitle}>{daysMessage[item.title] || item.title}</Text>
                                </Box>
                                <Box backgroundColor={item.isActive ? '#CCCCCC' : ''}>
                                    <Box {...styles.timeTableRow}>
                                        <Text {...styles.timeTableHour}>{item.amBegin}</Text>
                                    </Box>
                                    <Box {...styles.timeTableRow} {...styles.timeTableRowBordered}>
                                        <Text {...styles.timeTableHour}>{item.amEnd}</Text>
                                    </Box>
                                    <Box {...styles.timeTableRow}>
                                        <Text {...styles.timeTableHour}>{item.pmBegin}</Text>
                                    </Box>
                                    <Box {...styles.timeTableRow} {...styles.timeTableRowBordered}>
                                        <Text {...styles.timeTableHour}>{item.pmEnd}</Text>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        {days.map((item, index) => (
                            <Box key={index} {...styles.timeTableColumn}>
                                <Box {...styles.timeTableRow} {...styles.timeTableRowBordered}>
                                    <Text {...styles.timeTableTitle}>{daysMessage[item]}</Text>
                                </Box>
                                <Box backgroundColor={item.isActive ? '#CCCCCC' : ''}>
                                    <Box {...styles.timeTableRow}>
                                        <Text {...styles.timeTableHour}>-</Text>
                                    </Box>
                                    <Box {...styles.timeTableRow} {...styles.timeTableRowBordered}>
                                        <Text {...styles.timeTableHour}>-</Text>
                                    </Box>
                                    <Box {...styles.timeTableRow}>
                                        <Text {...styles.timeTableHour}>-</Text>
                                    </Box>
                                    <Box {...styles.timeTableRow} {...styles.timeTableRowBordered}>
                                        <Text {...styles.timeTableHour}>-</Text>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </>
                )}
            </Flex>
        </>
    )
}

StoreTimetable.propTypes = {
    data: PropTypes.array,
    storeStatus: PropTypes.bool,
    noData: PropTypes.bool,
}

export default StoreTimetable
