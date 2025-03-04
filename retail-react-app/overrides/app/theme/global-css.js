import React from 'react'
import {Global} from '@emotion/react'
import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'

const GlobalCss = () => (
    <Global
        styles={`
        @font-face {
          font-family:'BebasNeue';
          src: url('${getAssetUrl('static/fonts/BebasNeue-Regular.ttf')}');
        }
        @font-face {
          font-family:'Roboto';
          src: url('${getAssetUrl('static/fonts/Roboto-Regular.ttf')}');
        }
        @font-face {
          font-family:'Montserrat';
          src: url('${getAssetUrl('static/fonts/Montserrat-Regular.ttf')}');
        }
        .gm-style-iw {
          width: 380px;
          height: auto;
          max-height: unset !important;
          padding-top: 0 !important;
          padding-left: 0 !important;
          padding-right: 19px !important;
          padding-bottom: 19px !important;
          border-radius: 0 !important;
        }
        .gm-style-iw-d {
          height: auto !important;
          max-height: unset !important;
          overflow: visible !important;
        }
        .gm-style-iw>button {
          position:absolute;
          right: 16px !important;
          top: 16px !important;
          width: 13px !important;
          height: 13px !important;
        }
        .gm-style-iw>button>span {
          margin:0 !important;
          width: 16px !important;
          height: 16px !important;
        }
        .map-pin-name {
          margin-top: 19px;
          margin-left: 20px;
          font-style: normal;
          font-weight: 700;
          min-height: 22px;
          height: auto;
          line-height: 22px;
          text-transform: uppercase;

          &.IKKS {
            font-family: 'BebasNeue';
            font-size: 22px;
          }
          &.ICODE {
            font-family: 'Montserrat';
            font-size: 16px;
          }
        },
        .map-pin-address1 {
          margin-left: 20px;
          margin-top: 6px;
          font-style: normal;
          font-weight: 400;
          height: auto;
          min-height: 18px;
          line-height: 18px;

          &.IKKS {
            font-family: 'BebasNeue';
            font-size: 18px;
          }
          &.ICODE {
            font-family: 'Montserrat';
            font-size: 16px;
          }
        },
        .map-pin-address2 {
          margin-left: 20px;
          font-style: normal;
          font-weight: 400;
          height: auto;
          min-height: 18px;
          line-height: 18px;

          &.IKKS {
            font-family: 'BebasNeue';
            font-size: 18px;
          }
          &.ICODE {
            font-family: 'Montserrat';
            font-size: 16px;
          }
        },
        .map-pin-text {
          margin-left: 20px;
          margin-top: 10px;
        }
        .map-pin-text-status {
          font-family: 'Roboto';
          font-style: normal;
          font-size: 16px;
          line-height: 19px;

          &.open {
            color:green;
          },
          &.closed {
            color:red;
          }
          &.IKKS {
            font-family: 'Roboto';
            font-weight: 700;
          }
          &.ICODE {
            font-family: 'Montserrat'
            font-weight: 400;
          }
        },
        .map-pin-text-info {
          font-style: normal;
          font-weight: 400;
          font-size: 16px;
          line-height: 19px;
          color: #000000;

          &.IKKS {
            font-family: 'Roboto';
          }
          &.ICODE {
            font-family: 'Montserrat'
          }
        },
        .map-pin-text-hours {
          font-style: normal;
          font-size: 16px;
          line-height: 19px;
          color: #000000;

          &.IKKS {
            font-family: 'Roboto';
            font-weight: 700;
          }
          &.ICODE {
            font-family: 'Montserrat'
            font-weight: 500;
          }
        }
      `}
    />
)

export default GlobalCss
