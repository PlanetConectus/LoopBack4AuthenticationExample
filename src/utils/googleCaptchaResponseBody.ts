export interface GoogleCaptchaAndroidResponseBody {
    success: true|false,
    challenge_ts: Date,
    apk_package_name: string,
    "error-codes": []
}

export interface GoogleCaptchaWebResponseBody {
    success: true|false,
    challenge_ts: Date,
    hostname: string,
    "error-codes": []
}
