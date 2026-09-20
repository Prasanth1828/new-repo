# OTP Authentication Flow & UI Fixes Summary (Before vs After)

This document lists all exact code changes made across the project with **Before** and **After** code snippets and the rationale for each change.

---

### 1. `src/utils/constants.js`

**Before Code**:
```javascript
export const noFooterJourneys = ["PaymentGateway", "DEBITCARDREGISTRATION"];
```

**After Code**:
```javascript
export const noFooterJourneys = ["PaymentGateway", "DEBITCARDREGISTRATION", "PlatformAuth"];
```

**Reason / Impact**: Prevents the main application Footer from rendering when `/otp` (`PlatformAuth` journey) is opened in a pop-up window.

---

### 2. `src/layouts/DashboardLayout.js`

**Before Code**:
```javascript
) : (
  <>
    <Header />
```

**After Code**:
```javascript
) : (
  <>
    {journeyName !== "PlatformAuth" && <Header />}
```

**Reason / Impact**: Prevents the main Bank Navigation Header from showing up on the external OTP popup window.

---

### 3. `src/models/OtpAuthentication/index.js`

**Before Code**:
```javascript
const getURL = get(journey, "url", "");
const queryParams = getUrlParams(getURL);
const encryptedRequestFromUrl = get(queryParams, "encryptedRequest", "");
```

**After Code**:
```javascript
const getURL = get(journey, "url", "");
const queryParams = getURL ? getUrlParams(getURL) : {};
const encryptedRequestFromUrl =
  get(queryParams, "encryptedRequest", "") ||
  new URLSearchParams(window.location.search).get("encryptedRequest") ||
  "";
```

**Reason / Impact**: Ensures the `encryptedRequest` parameter is immediately extracted directly from `window.location.search` even if `journey.url` in Redux hasn't loaded yet.

---

### 4. `src/models/OtpAuthentication/OtpAuthenticationHome.js`

**Before Code**:
```javascript
// Handle Verify OTP failure
useEffect(() => {
  if (
    (sendOtpError && Object.keys(sendOtpError).length > 0) ||
    (validatePlatformAuthError && Object.keys(validatePlatformAuthError).length > 0)
  ) {
    setOpenOTP(false);
    triggerSavePlatformAuth("fail");
  }
}, [verifyOtpCardFailed, dispatch, triggerSavePlatformAuth, validatePlatformAuthError, sendOtpError]);

...

return (
  <>
    {!showLoader && (
      <Box>
        {openOTP ? (
          <OtpVerification ... />
        ) : (
          <FailedErrorPopup />
        )}
      </Box>
    )}
  </>
);
```

**After Code**:
```javascript
// Handle Verify OTP failure
useEffect(() => {
  if (
    (sendOtpError && Object.keys(sendOtpError).length > 0) ||
    (validatePlatformAuthError && Object.keys(validatePlatformAuthError).length > 0) ||
    verifyOtpCardFailed
  ) {
    setOpenOTP(false);
    triggerSavePlatformAuth("fail");
  }
}, [verifyOtpCardFailed, dispatch, triggerSavePlatformAuth, validatePlatformAuthError, sendOtpError]);

...

const hasError =
  (sendOtpError && Object.keys(sendOtpError).length > 0) ||
  (validatePlatformAuthError && Object.keys(validatePlatformAuthError).length > 0) ||
  verifyOtpCardFailed;

return (
  <Box>
    {openOTP ? (
      <OtpVerification ... />
    ) : hasError ? (
      <FailedErrorPopup />
    ) : null}
  </Box>
);
```

**Reason / Impact**:
1. Prevents the red Error Popup from flashing on initial page load while waiting for API response.
2. Prevents a blank/empty white screen from showing during `sendOtp` loading.

---

### 5. `src/components/Otp/index.js`

**Before Code**:
```javascript
{displayTokenCarousel && (
  <Grid item xs={12}>
    <Box className="btn-container">
      <MuiButton color="primary" size="small" className="cancel-btn" text={<TextFormatter id="cancel" />} onClick={onCancelButton} />
      <MuiButton color="secondary" size="small" disabled={!showVerify} onClick={onClickContinue} text={<TextFormatter id="continue" />} />
    </Box>
  </Grid>
)}
```

**After Code**:
```javascript
{(displayTokenCarousel || currentPath === "/otp") && (
  <Grid item xs={12}>
    <Box className="btn-container">
      <MuiButton color="primary" size="small" className="cancel-btn" text={<TextFormatter id="cancel" />} onClick={onCancelButton} />
      <MuiButton color="secondary" size="small" disabled={!showVerify} onClick={onClickContinue} text={<TextFormatter id="continue" />} />
    </Box>
  </Grid>
)}
```

**Reason / Impact**: Ensures Cancel and Submit (Continue) buttons are ALWAYS rendered on `/otp` route whether Token Carousel is active or disabled.

---

### 6. `src/models/Accounts/components/OtpVerification.js`

**Before Code**:
```javascript
actions={
  !isToken && !displayTokenCarousel ? (
    <>
      <MuiButton ... text="cancel" />
      <MuiButton ... text="continue" />
    </>
  ) : null
}
```

**After Code**:
```javascript
const sendOtpSuccess = otpInputDatas?.sendOtp?.response?.success;

useEffect(() => {
  if (sendOtpSuccess) {
    setResendTokenClicked(undefined);
  }
}, [sendOtpSuccess]);

...

actions={
  !isToken && !displayTokenCarousel && currentPath !== "/otp" ? (
    <>
      <MuiButton ... text="cancel" />
      <MuiButton ... text="continue" />
    </>
  ) : null
}
```

**Reason / Impact**: 
1. Restores the Token Carousel UI when a new OTP response arrives after clicking Resend OTP after 3 minutes.
2. Avoids duplicate action buttons on the `/otp` popup route.

---

### 7. `.vscode/settings.json`

**Before File**: (File did not exist in project workspace)

**After File**:
```json
{
  "editor.formatOnSave": false,
  "editor.formatOnPaste": false,
  "editor.formatOnType": false,
  "editor.codeActionsOnSave": {
    "source.fixAll": "never",
    "source.fixAll.eslint": "never"
  }
}
```

**Reason / Impact**: Prevents code from automatically re-formatting every time a file is saved in the IDE.
