/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useContext, useMemo} from 'react'
import {SiteCodeContext} from '../contexts'

export default function useSiteCode() {
    const {siteCode, setSiteCode: _setSiteCode} = useContext(SiteCodeContext)

    const setSiteCode = (data) => {
        _setSiteCode(data)
    }

    const self = useMemo(() => {
        return {
            ...siteCode,

            setSiteCodeId(id) {
                setSiteCode(id)
            },

            getSiteCodeId() {
                return siteCode
            }
        }
    }, [siteCode, setSiteCode])


    return self
}
