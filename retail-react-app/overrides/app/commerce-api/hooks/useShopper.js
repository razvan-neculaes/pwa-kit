/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useEffect} from 'react'
import useCustomer from './useCustomer'

/**
 * Joins basket and customer hooks into a single hook for initializing their states
 * when the app loads on the client-side. Should only be use at top-level of app.
 * @returns {Object} - customer and basket objects
 */
const useShopper = (opts = {}) => {
    const {currency} = opts
    const customer = useCustomer()

    // Create or restore the user session upon mounting
    useEffect(() => {
        customer.login()
    }, [])

    return {customer}
}

export default useShopper
