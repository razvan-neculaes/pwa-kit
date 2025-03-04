/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useRef, useState} from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'
import {
    useMultiStyleConfig,
    Box,
    Flex,
    IconButton,
    Button,
    Popover,
    PopoverHeader,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    Stack,
    Text,
    Divider,
    useDisclosure
} from '@chakra-ui/react'

import useCustomer from '../../commerce-api/hooks/useCustomer'

import Link from '../link'
import {
    AccountIcon,
    IkksBrandLogo,
    IcodeBrandLogo,
    BasketIcon,
    ChevronDownIcon,
    HeartIcon,
    SignoutIcon
} from '../icons'

import {noop} from '../../utils/utils'
import useNavigation from '../../hooks/use-navigation'
import LoadingSpinner from '../loading-spinner'
import useSiteCode from '../../commerce-api/hooks/useSiteCode'


/**
 * The header is the main source for accessing
 * navigation, search, basket, and other
 * important information and actions. It persists
 * on the top of your application and will
 * respond to changes in device size.
 *
 * To customize the styles, update the themes
 * in theme/components/project/header.js
 * @param  props
 * @return  {React.ReactElement} - Header component
 */
const Header = ({children, onLogoClick = noop, ...props}) => {
    const LOGIN_URL_IKKS = `https://www.ikks.com/fr/connecter/`
    const WISHLIST_URL_IKKS = `https://www.ikks.com/fr/liste-souhaits/`
    const CART_URL_IKKS = `https://www.ikks.com/fr/panier`
    const LOGIN_URL_ICODE = `https://www.icode.fr/fr/connecter/`
    const WISHLIST_URL_ICODE = `https://www.icode.fr/fr/liste-souhaits/`
    const CART_URL_ICODE = `https://www.icode.fr/fr/panier/`
    const HOME_URL_IKKS = `https://www.ikks.com/`
    const HOME_URL_ICODE = `https://www.icode.fr/`
    const siteCode = useSiteCode()
    const intl = useIntl()

    const [showLoading, setShowLoading] = useState(false)

    const styles = useMultiStyleConfig('Header')

    const handleLogoClick = () => {
        siteCode?.getSiteCodeId() == 'IKKS'
            ? (window.location = HOME_URL_IKKS)
            : (window.location = HOME_URL_ICODE)
    }

    return (
        <Box {...styles.container} {...props} boxShadow={'none'}>
            <Box {...styles.content}>
                {showLoading && <LoadingSpinner wrapperStyles={{height: '100vh'}} />}
                <Flex wrap="wrap" alignItems={['baseline', 'baseline', 'baseline', 'center']}>
                    <IconButton
                        aria-label={intl.formatMessage({
                            id: 'header.button.assistive_msg.logo',
                            defaultMessage: 'Logo'
                        })}
                        icon={
                            siteCode.getSiteCodeId() == 'IKKS' ? (
                                <IkksBrandLogo
                                    {...styles.logo}
                                    style={{width: '110px', height: '21px'}}
                                />
                            ) : siteCode.getSiteCodeId() == 'ICODE' ? (
                                <IcodeBrandLogo
                                    {...styles.logo}
                                    style={{width: '82px', height: '41px'}}
                                />
                            ) : null
                        }
                        {...styles.icons}
                        variant="unstyled"
                        onClick={handleLogoClick}
                    />
                    <Box {...styles.bodyContainer}>{children}</Box>
                    <a
                        href={
                            siteCode?.getSiteCodeId() == 'ICODE' ? LOGIN_URL_ICODE :  LOGIN_URL_IKKS
                        }
                    >
                        <AccountIcon
                            {...styles.accountIcon}
                            width={35}
                            height={35}
                            tabIndex={0}
                            aria-label={intl.formatMessage({
                                id: 'header.button.assistive_msg.my_account',
                                defaultMessage: 'My account'
                            })}
                        />
                    </a>

                    <a
                        href={
                            siteCode?.getSiteCodeId() == 'ICODE'
                                ? WISHLIST_URL_ICODE
                                : WISHLIST_URL_IKKS
                        }
                    >
                        <HeartIcon ml={5} mr={5} width={30} height={30} />
                    </a>
                    <a href={siteCode?.getSiteCodeId() == 'ICODE' ? CART_URL_ICODE : CART_URL_IKKS}>
                        <BasketIcon width={'40px'} height={'40px'} />
                    </a>
                </Flex>
            </Box>
        </Box>
    )
}

Header.propTypes = {
    children: PropTypes.node,
    onLogoClick: PropTypes.func
}

export default Header
