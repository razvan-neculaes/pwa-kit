/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export default {
    baseStyle: {
        container: {
            width: 'full'
        },
        sticker: {
            width: '100%',
            height: '70px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingLeft: '50px'
        },
        stickerIcon: {
            width: '32px',
            height: '32px',
            marginRight: '20px'
        },
        stickerText: {
            fontFamily: 'BebasNeue',
            height: '32px',
            lineHeight: '32px',
            color: '#767676',
            fontSize: '18px',
            fontWeight: '400',
            textTransform: 'uppercase'
        },
        footerBox: {
            backgroundColor: 'black'
        },
        links: {
            justifyContent: 'space-between'
        },
        linksContainer: {
            width: 'auto'
        },
        linksTitle: {
            fontFamily: 'BebasNeue',
            fontSize: '16px',
            lineHeight: '22px',
            fontWeight: '400',
            color: 'white'
        },
        linksText: {
            fontFamily: 'Roboto',
            fontSize: '12px',
            lineHeight: '37px',
            fontWeight: '700',
            color: 'white',
            cursor: 'pointer'
        },
        bottomColumn: {
            alignItems: 'center'
        },
        socialText: {
            fontFamily: 'BebasNeue',
            fontSize: '32px',
            minHeight: '38px',
            height: 'auto',
            lineHeight: '38px',
            fontWeight: '400',
            color: 'white',
            marginRight: '20px',
            textTransform: 'uppercase'
        },
        socialIconStack: {
            height: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        socialIcon: {
            width: '22px',
            height: '22px',
            color: 'white'
        },
        pays: {
            width: '174px',
            height: '51px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        paysLabel: {
            fontFamily: 'BebasNeue',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '16px',
            color: 'white',
            textTransform: 'uppercase'
        },
        paysValue: {
            fontFamily: 'BebasNeue',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '16px',
            color: 'white',
            marginLeft: '10px',
            textTransform: 'uppercase',
            textDecoration: 'underline'
        },
        language: {
            width: 'auto',
            height: '51px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        languageLabel: {
            width: '72px',
            height: '22px',
            fontFamily: 'BebasNeue',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '16px',
            color: 'white'
        },
        languageSelector: {
            border: '1px solid #A7A7A7',
            height: '51px',
            color: 'white',
            paddingLeft: '22px',
            paddingRight: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
        },
        languageText: {
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: '700',
            fontSize: '14px',
            lineHeight: '22px'
        },
        languageIcon: {
            width: '17px',
            height: '17px'
        },
        languageMenu: {
            position: 'absolute',
            width: 'inherit',
            height: 'auto',
            bottom: '49px',
            backgroundColor: 'black',
            border: '1px solid #fff',
            right: '-1px'
        },
        languageItem: {
            width: '100%',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: '700',
            fontSize: '14px',
            color: '#fff',
            paddingLeft: '10px'
        },
        accordionHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        accordionIcon: {
            width: '20px',
            height: '20px',
            color: 'white'
        }
    }
}
