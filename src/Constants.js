class Constants {
  static baseUrl() {
    return 'https://genshin.honeyhunterworld.com';
  }

  static httpRequestsTimeoutMs() {
    return 500;
  }

  static rawFilesFolderId() {
    return '1FpnRg7guRdOs8kJZv2sxUC2ybNaKDkcu';
  }

  static logsFolderId() {
    return '1WfETeFgi5x58v29pHBaZx43e-X9ESz3V';
  }

  static scriptTimeoutMs() {
    return 4 * 60 * 1000; // 4 minutes
  }

  static urlReloadPeriodSecs() {
    return 10 * 24 * 60 * 60; // 10 days
  }

  static rawFilesRetentionPeriodSecs() {
    return 10 * 24 * 60 * 60; // 10 days
  }

  static rotationPeriodMinutes() {
    return 15;
  }

  /** @returns { {[lang: string]: { rawSheetId: string, parsedSheetId: string, finSheetId: string }} } */
  static supportedLangs() {
    return {
      CHS: { rawSheetId: '1KKGBjiheUdhMhCcvzZ8jQ2aXRzZQaA9cwdGsrW8ohCk', parsedSheetId: '1x-vbSJ8IfEQD6DigmNKjaVo9YW1n9LquqDv164k3co4', finSheetId: '1XMFUw8k5vFO_p0IEhr2RiRcRXQ3wd-mn5i2F6MO-r2U' },
      CHT: { rawSheetId: '1RiG5pEXIgBQGHmOA_CTuZsxpfj70o5ylv-3ZnoFGGD8', parsedSheetId: '1BcjDCvI8btxH47L7AUeTFHM--dzzoPpS51AAy8wwkG0', finSheetId: '1eT3OtCvUvXpy2Odt6HlXN8hy8qFw2S6R4SYhWLn2DsU' },
      DE: { rawSheetId: '1tTbgWhcSwsY94CvmTq_4eataISrM2tSP7apJXcAf9Zk', parsedSheetId: '1iJQ-DTC75lcGUFc_i2Jn4O_BTWgghlvm1rF68Y6OknE', finSheetId: '15RB88-FsGWP1ODrxJL4q0ISnhhaO25TL8MRmK_ucdpw' },
      EN: { rawSheetId: '1UZErw0gucVTDVkDlGMj0QjulP9_a5EUBmsjFAk6QXbM', parsedSheetId: '1_CuM9MEkxgXr_-LhSHyp2ojafFDHmWWie3WXoZSWRaQ', finSheetId: '1yDpQjdoLebIbNlfGc-_xXZeELjC1vV7Y7YOe7tZRFqU' },
      ES: { rawSheetId: '10bWc1-wyFv_kwzXuiSGJImFXi0luNXV6o2rda9uF_jc', parsedSheetId: '1c0sHIjHD9A5nAUta65mc_o_hq3NADN9T4D4sC_XiLOk', finSheetId: '1KRP-bfThgHKnbISM6cdacLJNI9zg0GtTC1m4DWWr-Mw' },
      FR: { rawSheetId: '1m6jesGjX3nU-lMWT8hXQwdpLcWmkciGGR0fGE5PhKKw', parsedSheetId: '1cEC9lnzYyQ3BcGfSWY-7T-HEX5dsAMISPKz15U7dFBQ', finSheetId: '1WwE_4-N65oCk_RboZqkrtQwWiaURz2cQA9SK2EAQutY' },
      ID: { rawSheetId: '10CfmQkJxJgFPzBfaKEY8X9VQOaGew-XxVEjfBalgSCQ', parsedSheetId: '1yoIDcGxm7FRWDqs5YGbiSrtvBAEi5kOmehXRDojXJZA', finSheetId: '16IU6MYAaLx3_p9kVZTzu6i5uZ1yssdygM_dgT7O5WGs' },
      IT: { rawSheetId: '1q-vpTTu32jGSkdLaj8ZwFZ3hkCoDDJvcLEXSmKeCLpk', parsedSheetId: '1wu3hHT3EERgz6au8q_jVSNitPnWM32mjc_nk1Qo3HII', finSheetId: '1htjboHWrx-MQh8jx-_aA1k5zYEqhutRxg82j5mbjS8k' },
      JA: { rawSheetId: '1k60IfEIracKhpEM3mnuNbiKqEATeiCLlfzA5NMs6O0E', parsedSheetId: '1o9rEBYCYey8P212accOegm02UUc2Ji4ohA_jPnfBDsQ', finSheetId: '1jwXFTI32IJLwf5X3wnI9JPk4DnruXJavAZ6Xztrxzsw' },
      KO: { rawSheetId: '1JrM9jJXTY0f1R6OZL0ShjvyNbau5GAptSYbC6FSa3zw', parsedSheetId: '1T0f7SGdbUcMgeCPrizvlS9ujhkIlQ78ZA49hB5xGzrQ', finSheetId: '16RHjp0IDGZ7PQBqHD7hyJEanuZRE62lgRpTufF9quxA' },
      PT: { rawSheetId: '1Bpv2Nl9XLJMQO6tULjdglHLaBEWrWa8ZiwVHFSPVDAA', parsedSheetId: '1VmrqYSN0ESCHGdWuZOGkgKVVeVHt8lMBu-N3IKwbtwM', finSheetId: '1Grti8GOyIxKLAjMXWSD5lytBZva31LsHAdng3TKBLp0' },
      RU: { rawSheetId: '11WDb-fNYXlSvcC54-Nfh6VPrZaIfwkL_SNofDmOEbbk', parsedSheetId: '1D8rF03TXcBxiYYZ5naYGFrLEk9Gfw1O4PTX5PS9rPLk', finSheetId: '1LXi6XEyvhI9IB08shO9UyKX-frlTNaU9DzXrDbFDWiI' },
      TH: { rawSheetId: '1DSKXYc4g1KdHlTinwT1S1HGvnd5N7qafc7QdsHDFM5o', parsedSheetId: '1SglRYGjGcPCzOcnp4nLN0FMoKYCn72GmMX8BU48n4xQ', finSheetId: '1zAf9kYHDMgLdLkKut6vQUFXKacTioasQ7fOhIACj2Bg' },
      TR: { rawSheetId: '17Lf004D-E_Pzzvos9Od3ER3fRCSXJ1gQ_l9XjT89dQ0', parsedSheetId: '1jL-fVmkBaEzZ2TtOkO6zi8BDJjYloDcrcO6uIwiPlQY', finSheetId: '1wyWyfqXD5hyTPTfwB_ATpGwKoBuuZmluSO8GO4VbwjM' },
      VI: { rawSheetId: '12iGfmXSDILs86nItxsw6_nHI7YoqRsSoOHoTbbMMm5w', parsedSheetId: '186l-tznf5uO33kLsQJiT9VDhfBGUwfeQrg74m2B5Hy8', finSheetId: '1vSl8Kq2M7L8GOPaISKn1aolyy2bbYS9cx7hrPX-3d3w' },
    };
  }
}

globalRegister(Constants);
