/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Provide the sites for your app. Each site includes site id, and its localization configuration.
// You can also provide aliases for your locale. They will be used in place of your locale id when generating paths across the app
module.exports = [
    {
        id: 'IKKS_COM',
        l10n: {
            supportedCurrencies: ['EUR'],
            defaultCurrency: 'EUR',
            defaultLocale: 'fr',
            supportedLocales: [
                {
                    id: 'fr',
                    alias: 'fr-fr',
                    preferredCurrency: 'EUR'
                },
                {
                    id: 'de',
                    alias: 'de-de',
                    preferredCurrency: 'EUR'
                },
                {
                    id: 'es',
                    alias: 'es-es',
                    preferredCurrency: 'EUR'
                },
                {
                    id: 'nl',
                    alias: 'nl-nl',
                    preferredCurrency: 'EUR'
                },
                {
                    id: 'en',
                    alias: 'en-uk',
                    preferredCurrency: 'GBP'
                }
            ]
        }
    },
    {
        id: 'ONESTEP_FR',
        l10n: {
            supportedCurrencies: ['EUR'],
            defaultCurrency: 'EUR',
            defaultLocale: 'fr',
            supportedLocales: [
                {
                    id: 'fr',
                    alias: 'fr-fr',
                    preferredCurrency: 'EUR'
                }
            ]
        }
    }
]
