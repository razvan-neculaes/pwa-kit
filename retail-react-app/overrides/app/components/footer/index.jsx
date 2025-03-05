/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState} from 'react'
import {Box, Text, SimpleGrid, useMultiStyleConfig, Icon} from '@chakra-ui/react'
import {useIntl, FormattedMessage} from 'react-intl'

// Icons
import {
    SocialFacebookIcon,
    SocialInstagramIcon,
    SocialPinterestIcon,
    SocialTwitterIcon,
    SocialYoutubeIcon,
    PlusIcon,
    DashIcon
} from '../../components/icons'

import {
    IkksTruckIcon,
    IkksLockedIcon,
    IkksCalendarIcon,
    IkksChatIcon,
    IkksArrowDownIcon,
    IcodeTruckIcon,
    IcodeLockedIcon,
    IcodeHeartIcon,
    IcodeChatIcon,
    IcodeArrowDownIcon
} from '../icons'

import LocaleText from '../locale-text'
import useMultiSite from '../../hooks/use-multi-site'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import useSiteCode from '../../commerce-api/hooks/useSiteCode'

const Footer = (props) => {
    const siteCode = useSiteCode()
    const styles = useMultiStyleConfig(`Footer`)
    const intl = useIntl()
    const [languageMenuVisibility, setLanguageMenuVisibility] = useState(false)
    const [selectedAccordion, setSelectedAccordion] = useState(0)
    const [locale, setLocale] = useState(intl.locale)
    const {site} = useMultiSite()
    const {l10n} = site
    const appOrigin = getAppOrigin()

    const phoneNumbers = {...props.phoneNumbers}

    const linksIKKS = [
        {
            id: 1,
            label: 'Service client',
            labelId: 'footer.link.customer_service',
            content: [
                {
                    id: 11,
                    label: 'Nous contacter',
                    labelId: 'footer.link.contact_us',
                    link: `https://www.ikks.com/${locale}/contact/`
                },
                {
                    id: 12,
                    label: 'Questions fréquentes',
                    labelId: 'footer.link.frequently_asked_questions',
                    link: `https://www.ikks.com/${locale}/faq.html`
                },
                {
                    id: 13,
                    label: 'Livraison',
                    labelId: 'footer.link.delivery',
                    link: `https://www.ikks.com/${locale}/ikks_livraison.html`
                },
                {
                    id: 14,
                    label: 'Paiement',
                    labelId: 'footer.link.payment',
                    link: `https://www.ikks.com/${locale}/paiement.html`
                }
            ]
        },
        {
            id: 2,
            label: 'Entreprise',
            labelId: 'footer.link.company',
            content: [
                {
                    id: 21,
                    label: 'Groupe IKKS',
                    labelId: 'footer.link.ikks_group',
                    link: 'http://www.ikksgroup.com/'
                },
                {
                    id: 22,
                    label: 'Recrutement',
                    labelId: 'footer.link.recruitment',
                    link: 'http://www.ikksgroup.com/'
                },
                {
                    id: 23,
                    label: `Offres d'emplois`,
                    labelId: 'footer.link.job_offers',
                    link: 'https://www.ikksgroup.com/offres-demploi/'
                },
                {
                    id: 24,
                    label: 'Egalité chez IKKS',
                    labelId: 'footer.link.equality_at_ikks',
                    link: 'https://www.ikksgroup.com/egalite-femmes-hommes/'
                }
            ]
        },
        {
            id: 3,
            label: 'Boutiques',
            labelId: 'footer.link.shops',
            content: [
                {
                    id: 31,
                    label: 'Store locator',
                    labelId: 'footer.link.store_locator',
                    link: `https://stores.ikks.com/${locale}?_gl=1*7y0l7d*_ga*MTY2MTk3MjMyNS4xNjY5MDk3NTAw*_ga_8W5W1F0BVP*MTY2OTYyMDE3MS4xMS4xLjE2Njk2MjE3MjMuMC4wLjA.`
                },
                {
                    id: 32,
                    label: 'Click & Collect',
                    labelId: 'footer.link.click_collect',
                    link: `https://www.ikks.com/${locale}/e_reservation.html`
                },
                {
                    id: 33,
                    label: 'Livraison en boutique',
                    labelId: 'footer.link.delivery_to_store',
                    link: `https://www.ikks.com/${locale}/e_livraison.html`
                },
                {
                    id: 34,
                    label: 'Shopping à distance',
                    labelId: 'footer.link.remote_shopping',
                    link: `https://www.ikks.com/${locale}/live-shopping-party.html`
                }
            ]
        },
        {
            id: 4,
            label: 'Sites',
            labelId: 'footer.link.sites',
            content: [
                {
                    id: 41,
                    label: 'Fashion Gazette',
                    labelId: 'footer.link.fashion_gazette',
                    link: `https://archives.ikks.com/${locale}/?_gl=1*7y0l7d*_ga*MTY2MTk3MjMyNS4xNjY5MDk3NTAw*_ga_8W5W1F0BVP*MTY2OTYyMDE3MS4xMS4xLjE2Njk2MjE3MjMuMC4wLjA.`
                }
            ]
        },
        {
            id: 5,
            label: 'Mentions légales',
            labelId: 'footer.link.legal_notice',
            content: [
                {
                    id: 51,
                    label: 'CGV',
                    labelId: 'footer.link.cgv',
                    link: `https://www.ikks.com/${locale}/cgv.html`
                },
                {
                    id: 52,
                    label: 'Mentions légales',
                    labelId: 'footer.link.legal_notice',
                    link: `https://www.ikks.com/${locale}/mentions_legales.html`
                },
                {
                    id: 53,
                    label: 'Offres en cours',
                    labelId: 'footer.link.current_office',
                    link: `https://www.ikks.com/${locale}/mentions-legales-offre-en-cours/`
                },
                {
                    id: 54,
                    label: 'Données personnelles',
                    labelId: 'footer.link.personal_data',
                    link: `https://www.ikks.com/${locale}/privacy.html`
                }
            ]
        }
    ]

    const linksICODE = [
        {
            id: 1,
            label: 'Service client',
            labelId: 'footer.link.customer_service',
            content: [
                {
                    id: 11,
                    label: 'Nous contacter',
                    labelId: 'footer.link.contact_us',
                    link: `https://www.icode.fr/${locale}/contact`
                },
                {
                    id: 12,
                    label: 'Questions fréquentes',
                    labelId: 'footer.link.frequently_asked_questions',
                    link: `https://www.icode.fr/${locale}/faq-icode.html`
                },
                {
                    id: 13,
                    label: 'Livraison',
                    labelId: 'footer.link.delivery',
                    link: `https://www.icode.fr/${locale}/livraison-icode.html`
                },
                {
                    id: 14,
                    label: 'Paiement',
                    labelId: 'footer.link.payment',
                    link: `https://www.icode.fr/${locale}/paiement-icode.html`
                }
            ]
        },
        {
            id: 2,
            label: 'Services I.Code',
            labelId: 'footer.link.service_icode',
            content: [
                {
                    id: 21,
                    label: 'Trouver une boutique',
                    labelId: 'footer.link.find_store',
                    link: `https://www.icode.fr/${locale}/boutiques/`
                },
                {
                    id: 22,
                    label: 'e-Réservation',
                    labelId: 'footer.link.e_reservation',
                    link: `https://www.icode.fr/${locale}/e_reservation-icode.html`
                },
                {
                    id: 23,
                    label: 'e-Livraison',
                    labelId: 'footer.link.e_delivery',
                    link: `https://www.icode.fr/${locale}/e_livraison-icode.html`
                }
            ]
        },
        {
            id: 3,
            label: 'Mentions Légales',
            labelId: 'footer.link.legal_notice',
            content: [
                {
                    id: 31,
                    label: 'CGV',
                    labelId: 'footer.link.cgv',
                    link: `https://www.icode.fr/${locale}/cgv-icode.html`
                },
                {
                    id: 32,
                    label: 'Mentions légales',
                    labelId: 'footer.link.legal_notice',
                    link: `https://www.icode.fr/${locale}/mentions_legales-icode.html`
                },
                {
                    id: 33,
                    label: 'Offres en cours',
                    labelId: 'footer.link.current_offers',
                    link: `https://www.icode.fr/${locale}/i.code/i.code/mentions-legales-offres-en-cours/`
                },
                {
                    id: 34,
                    label: 'Données personnelles',
                    labelId: 'footer.link.personal_data',
                    link: `https://www.icode.fr/${locale}/privacy-icode.html`
                }
            ]
        }
    ]
    let links

    if (siteCode.getSiteCodeId() == 'IKKS') {
        links = linksIKKS
    } else if (siteCode.getSiteCodeId() == 'ICODE') {
        links = linksICODE
    } else {
        links = []
    }

    const socialLinks = [
        {
            id: 1,
            icon: SocialTwitterIcon,
            link: 'https://www.twitter.com/ikks616'
        },
        {
            id: 2,
            icon: SocialPinterestIcon,
            link: 'https://pinterest.com/ikks'
        },
        {
            id: 3,
            icon: SocialFacebookIcon,
            link: 'https://facebook.com/ikksuk'
        },
        {
            id: 4,
            icon: SocialYoutubeIcon,
            link: 'https://youtube.com/ikks'
        },
        {
            id: 5,
            icon: SocialInstagramIcon,
            link: 'https://instagram.com/ikksofficial'
        }
    ]

    const supportedLocaleIds = l10n?.supportedLocales.map((locale) => locale.id)

    function FormattedMessageFixed(props) {
        return <FormattedMessage {...props} />
    }

    return (
        <>
            {styles && (
                <Box as="footer" {...styles.container}>
                    <SimpleGrid
                        columns={[1, 2, 2, 4]}
                        paddingTop={['32px', '32px', '50px', '50px']}
                        paddingBottom={['32px', '32px', '50px', '50px']}
                    >
                        <Box {...styles.sticker}>
                            {siteCode.getSiteCodeId() == 'IKKS' ? (
                                <IkksTruckIcon {...styles.stickerIcon} />
                            ) : siteCode.getSiteCodeId() == 'ICODE' ? (
                                <IcodeTruckIcon {...styles.stickerIcon} />
                            ) : (
                                ''
                            )}
                            <Text {...styles.stickerText}>
                                {intl.formatMessage({
                                    defaultMessage: 'Livraison offerte dès 200€ d\'achat',
                                    id: 'footer.sticker.free_delivery'
                                })}
                            </Text>
                        </Box>
                        <Box {...styles.sticker}>
                            {siteCode.getSiteCodeId() == 'IKKS' ? (
                                <IkksLockedIcon {...styles.stickerIcon} />
                            ) : siteCode.getSiteCodeId() == 'ICODE' ? (
                                <IcodeLockedIcon {...styles.stickerIcon} />
                            ) : (
                                ''
                            )}
                            <Text {...styles.stickerText}>
                                {intl.formatMessage({
                                    defaultMessage: 'paiement sécurisé en 3ds',
                                    id: 'footer.sticker.secure_payment3d'
                                })}
                            </Text>
                        </Box>
                        <Box {...styles.sticker}>
                            {siteCode.getSiteCodeId() == 'IKKS' ? (
                                <IkksCalendarIcon {...styles.stickerIcon} />
                            ) : siteCode.getSiteCodeId() == 'ICODE' ? (
                                <IcodeHeartIcon {...styles.stickerIcon} />
                            ) : (
                                ''
                            )}
                            {siteCode.getSiteCodeId() == 'IKKS' ? (
                                <Text {...styles.stickerText}>
                                    {intl.formatMessage({
                                        defaultMessage: 'Satisfait Ou Rembourse',
                                        id: 'footer.sticker.satisfied_or_refunded'
                                    })}
                                </Text>
                            ) : siteCode.getSiteCodeId() == 'ICODE' ? (
                                <Text {...styles.stickerText}>
                                    {intl.formatMessage({
                                        defaultMessage: '30 jours pour changer d’avis',
                                        id: 'footer.sticker.days_to_change_your_mind'
                                    })}
                                </Text>
                            ) : (
                                ''
                            )}
                        </Box>
                        <Box {...styles.sticker} border="none">
                            {siteCode.getSiteCodeId() == 'IKKS' ? (
                                <IkksChatIcon {...styles.stickerIcon} />
                            ) : siteCode.getSiteCodeId() == 'ICODE' ? (
                                <IcodeChatIcon {...styles.stickerIcon} />
                            ) : (
                                ''
                            )}
                            <Box>
                                {phoneNumbers?.tel && (
                                    <Text {...styles.stickerText}>
                                        {intl.formatMessage({
                                            defaultMessage: 'service client au ',
                                            id: 'footer.sticker.service_client_1'
                                        })}
                                        {phoneNumbers?.tel}
                                    </Text>
                                )}
                                {phoneNumbers?.whatsapp && (
                                    <Text {...styles.stickerText}>
                                        {intl.formatMessage({
                                            defaultMessage: 'whatsapp au ',
                                            id: 'footer.sticker.whatsup'
                                        })}
                                        {phoneNumbers?.whatsapp}
                                    </Text>
                                )}
                            </Box>
                        </Box>
                    </SimpleGrid>

                    <Box
                        {...styles.footerBox}
                        paddingLeft={['14px', '14px', '73px', '73px']}
                        paddingRight={['14px', '14px', '73px', '73px']}
                    >
                        <Box
                            {...styles.links}
                            display={['block', 'block', 'flex', 'flex']}
                            paddingTop={['5px', '5px', '55px', '55px']}
                            paddingBottom={['5px', '5px', '43px', '43px']}
                        >
                            {links.map((item) => (
                                <Box key={item.id} {...styles.linksContainer}>
                                    <Box
                                        {...styles.accordionHeader}
                                        height={['50px', '50px', '50px', '50px']}
                                        borderBottom={[
                                            '1px solid white',
                                            '1px solid white',
                                            'none',
                                            'none'
                                        ]}
                                        onClick={() =>
                                            setSelectedAccordion(
                                                selectedAccordion == item.id ? 0 : item.id
                                            )
                                        }
                                    >
                                        <Text
                                            {...styles.linksTitle}
                                            fontSize={
                                                siteCode.getSiteCodeId() == 'IKKS'
                                                    ? ['16px', '16px', '16px', '16px']
                                                    : ['20px', '20px', '16px', '16px']
                                            }
                                            textTransform={
                                                siteCode.getSiteCodeId() == 'IKKS'
                                                    ? [
                                                          'uppercase',
                                                          'uppercase',
                                                          'uppercase',
                                                          'uppercase'
                                                      ]
                                                    : [
                                                          'uppercase',
                                                          'uppercase',
                                                          'capitalize',
                                                          'capitalize'
                                                      ]
                                            }
                                        >
                                            <FormattedMessageFixed
                                                defaultMessage={item.label}
                                                id={item.labelId}
                                            />
                                        </Text>
                                        <Icon
                                            display={['block', 'block', 'none', 'none']}
                                            {...styles.accordionIcon}
                                            as={selectedAccordion == item.id ? DashIcon : PlusIcon}
                                        />
                                    </Box>
                                    <Box
                                        {...styles.accordionContent}
                                        display={[
                                            selectedAccordion === item.id ? 'block' : 'none',
                                            selectedAccordion === item.id ? 'block' : 'none',
                                            'block',
                                            'block'
                                        ]}
                                    >
                                        {item.content.map((element, index) => (
                                            <a key={index} href={element.link} rel="noreferrer">
                                                <Text
                                                    {...styles.linksText}
                                                    _hover={{
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    <FormattedMessageFixed
                                                        defaultMessage={element.label}
                                                        id={element.labelId}
                                                    />
                                                </Text>
                                            </a>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <SimpleGrid
                            columns={[1, 1, 2, 2]}
                            borderTop={['', '', '1px solid white', '1px solid white']}
                            paddingTop={['5px', '5px', '31px', '31px']}
                            paddingBottom={['5px', '5px', '51px', '51px']}
                        >
                            <Box
                                {...styles.bottomColumn}
                                display={['block', 'block', 'flex', 'flex']}
                                borderRight={['0px', '0px', '1px solid white', '1px solid white']}
                                borderBottom={['1px solid white', '1px solid white', '0px', '0px']}
                                paddingRight={['0px', '0px', '20px', '20px']}
                            >
                                <Text
                                    {...styles.socialText}
                                    marginTop={['33px', '33px', '0px', '0px']}
                                >
                                    {intl.formatMessage({
                                        defaultMessage: 'Suivez-nous sur les réseaux sociaux',
                                        id: 'footer.social.follow_us_on_social_networks'
                                    })}
                                </Text>
                                <Box
                                    {...styles.socialIconStack}
                                    width="100%"
                                    maxWidth={['517px', '517px', '170px', '170px']}
                                    marginTop={['30px', '30px', '0px', '0px']}
                                    marginBottom={['30px', '30px', '0px', '0px']}
                                >
                                    {socialLinks.map((item) => (
                                        <a href={item.link} key={item.id}>
                                            <Icon {...styles.socialIcon} as={item.icon} />
                                        </a>
                                    ))}
                                </Box>
                            </Box>
                            <Box
                                {...styles.bottomColumn}
                                height={['163px', '163px', '50px', '50px']}
                                display={['block', 'block', 'block', 'flex']}
                                paddingLeft={['0px', '0px', '20px', '20px']}
                                justifyContent={[
                                    'flex-start',
                                    'flex-start',
                                    'flex-start',
                                    'flex-end'
                                ]}
                            >
                                <Box
                                    {...styles.language}
                                    justifyContent={['', '', '', 'flex-end']}
                                    marginTop={['30px', '30px', '0px', '0px']}
                                >
                                    <Text {...styles.languageLabel}>
                                        {intl.formatMessage({
                                            defaultMessage: 'Langue:',
                                            id: 'footer.language.language'
                                        })}
                                    </Text>
                                    <Box
                                        width={['100%', '100%', '100%', '316px']}
                                        {...styles.languageSelector}
                                        onMouseEnter={() => setLanguageMenuVisibility(true)}
                                        onMouseLeave={() => setLanguageMenuVisibility(false)}
                                    >
                                        <LocaleText
                                            value={locale}
                                            shortCode={locale}
                                            {...styles.languageText}
                                        />

                                        {siteCode.getSiteCodeId() == 'IKKS' ? (
                                            <IkksArrowDownIcon {...styles.languageIcon} />
                                        ) : siteCode.getSiteCodeId() == 'ICODE' ? (
                                            <IcodeArrowDownIcon {...styles.languageIcon} />
                                        ) : (
                                            ''
                                        )}

                                        {languageMenuVisibility && (
                                            <Box
                                                {...styles.languageMenu}
                                                onMouseEnter={() => setLanguageMenuVisibility(true)}
                                                onMouseLeave={() =>
                                                    setLanguageMenuVisibility(false)
                                                }
                                            >
                                                {supportedLocaleIds.map((locale) => (
                                                    <Box
                                                        key={locale}
                                                        onClick={() => {
                                                            setLocale(locale)
                                                            const url = appOrigin + '/' + locale
                                                            window.location = url
                                                        }}
                                                    >
                                                        <LocaleText
                                                            value={locale}
                                                            shortCode={locale}
                                                            cursor={'pointer'}
                                                            {...styles.languageItem}
                                                            _hover={{
                                                                background: '#fff',
                                                                color: '#000'
                                                            }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </SimpleGrid>
                    </Box>
                </Box>
            )}
        </>
    )
}

export default Footer
