/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useContext, useMemo} from 'react'
import {SitePreferencesContext} from '../contexts'

export default function useSitePreferences() {
    const {sitePref, setSitePref: _setSitePref} = useContext(SitePreferencesContext)

    const setSitePref = (data) => {
        _setSitePref(data)
    }

    const self = useMemo(() => {
        return {
            ...sitePref,

            setSitePreferences(obj) {
                setSitePref(obj)
            },

            getSitePreferences() {
                return sitePref
            }
        }
    }, [sitePref, setSitePref])
    return self
}
