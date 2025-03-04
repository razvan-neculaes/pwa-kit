/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export default {
    baseStyle: {
        container: {
            width: 'full',
            borderTop: '5px solid white'
        },
        sticker: {
            width: '100%',
            height: '70px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRight: '1px solid #CECECE'
        },
        stickerIcon: {
            width: '40px',
            height: '30px',
            marginBottom: '5px'
        },
        stickerText: {
            fontFamily: 'Montserrat',
            height: '32px',
            lineHeight: '15px',
            color: '#777777',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            textAlign: 'center'
        },
        footerBox: {
            backgroundColor: 'white'
        },
        links: {
            borderTop: '1px solid #CECECE',
            borderBottom: '1px solid #CECECE',
            justifyContent: 'space-between'
        },
        linksContainer: {
            width: 'auto'
        },
        linksTitle: {
            fontFamily: 'Montserrat',
            fontSize: '16px',
            lineHeight: '22px',
            fontWeight: '700',
            color: 'black'
        },
        linksText: {
            fontFamily: 'Montserrat',
            fontSize: '12px',
            lineHeight: '30px',
            fontWeight: '700',
            color: '#707070',
            cursor: 'pointer'
        },
        bottomColumn: {
            alignItems: 'center'
        },
        socialText: {
            fontFamily: 'Montserrat',
            fontSize: '22px',
            minHeight: '38px',
            height: 'auto',
            lineHeight: '27px',
            fontWeight: '600',
            color: 'black',
            marginRight: '20px'
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
            color: 'black'
        },
        pays: {
            width: '174px',
            height: '51px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        paysLabel: {
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '13px',
            color: 'black'
        },
        paysValue: {
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '13px',
            color: 'black',
            marginLeft: '10px',
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
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '14px',
            color: 'black'
        },
        languageSelector: {
            border: '1px solid #A7A7A7',
            height: '51px',
            color: 'black',
            paddingLeft: '22px',
            paddingRight: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
        },
        languageText: {
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '13px',
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
            fontFamily: 'Montserrat',
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
            color: 'black'
        }
    }
}
