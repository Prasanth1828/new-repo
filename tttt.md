# Summary of Code Changes (Localization & Language Switch Fixes)

This document provides a complete record of all files modified in the codebase to resolve language-switching (`en` ➔ `hi`) issues across the **Dashboard**, **Profile**, and **Registration** journeys.

---

## 1. Modified Files List

1. [`src/models/LoginRegistration/Registration/languageList.js`](file:///Users/prasanth/Downloads/IB_UAT/src/models/LoginRegistration/Registration/languageList.js)
2. [`src/models/Profile/Settings/TransactionLimit.js`](file:///Users/prasanth/Downloads/IB_UAT/src/models/Profile/Settings/TransactionLimit.js)
3. [`src/models/Profile/PersonalDetails/emailID.js`](file:///Users/prasanth/Downloads/IB_UAT/src/models/Profile/PersonalDetails/emailID.js)
4. [`src/lang/hindi/hi.json`](file:///Users/prasanth/Downloads/IB_UAT/src/lang/hindi/hi.json)

---

## 2. Detailed Code Changes & Diffs

### File 1: `src/models/LoginRegistration/Registration/languageList.js`
* **Reason:** When navigating to the Registration journey (`/register`), the language selection screen contained hardcoded English text for the heading `"Choose Your Language"` and the primary button `"Continue"`. These did not change when switching to Hindi.
* **Diff:**
```diff
--- a/src/models/LoginRegistration/Registration/languageList.js
+++ b/src/models/LoginRegistration/Registration/languageList.js
@@ -178,7 +178,7 @@ function LanguageList(props) {
               {type ? (
                 <FormattedMessage id="languageUpdate" />
               ) : (
-                "Choose Your Language"
+                <FormattedMessage id="languageText" />
               )}{" "}
               {type && <FormattedMessage id="languageUpdateBold" />}
             </Typography>
@@ -228,7 +228,7 @@ function LanguageList(props) {
                     ? intl.formatMessage({ id: "save" })
                     : type
                       ? intl.formatMessage({ id: "update" })
-                      : "Continue"
+                      : intl.formatMessage({ id: "continue" })
                 }
               />
             </Box>
```

---

### File 2: `src/models/Profile/Settings/TransactionLimit.js`
* **Reason:** In the Profile Settings tab under Transaction Limit, the dropdown options for transfer type were hardcoded in English (`"Within Equitas"`, `"Other Banks"`), and the dropdown placeholder was hardcoded (`"Type of transfer"`). The dropdown options have been updated to use `<TextFormatter>` while retaining unchanged internal values (`"withinEquitas"`, `"otherBanks"`), ensuring that filtering conditions and backend payload mappings remain 100% stable.
* **Diff:**
```diff
--- a/src/models/Profile/Settings/TransactionLimit.js
+++ b/src/models/Profile/Settings/TransactionLimit.js
@@ -15,11 +15,11 @@ import useMopStatus from "../../../components/UseMop";
 
 const transferOptions = [
   {
-    label: "Within Equitas",
+    label: <TextFormatter id="withinEquitas" />,
     value: "withinEquitas",
   },
   {
-    label: "Other Banks",
+    label: <TextFormatter id="otherBanks" />,
     value: "otherBanks",
   },
 ];
@@ -225,7 +225,7 @@ function TransactionLimit(props) {
   return (
     <Box className="profile__Transaction">
       <MuiDropdown
-        placeholder="Type of transfer"
+        placeholder={<TextFormatter id="transferType" />}
         value={selectedTransfer}
         variant="filled"
         onChange={handleTransfer}
```

---

### File 3: `src/models/Profile/PersonalDetails/emailID.js`
* **Reason:** In the Profile Personal Details tab under Email Update, the authentication dropdown option labels were hardcoded in English (`"Debit Card"`, `"Aadhar Card"`), and the placeholder was `"Authentication"`. These have been wrapped with `<TextFormatter>` while retaining unchanged option values (`"withDebit"`, `"aadharCard"`).
* **Diff:**
```diff
--- a/src/models/Profile/PersonalDetails/emailID.js
+++ b/src/models/Profile/PersonalDetails/emailID.js
@@ -46,11 +46,11 @@ const EmailID = (props) => {
   const blockOptions = [
     {
-      label: "Debit Card",
+      label: <TextFormatter id="debitCard" />,
       value: "withDebit",
     },
     {
-      label: "Aadhar Card",
+      label: <TextFormatter id="aadhaarCard" />,
       value: "aadharCard",
     },
   ];
@@ -232,7 +232,7 @@ const EmailID = (props) => {
           />
           <MuiDropdown
-            placeholder={"Authentication"}
+            placeholder={<TextFormatter id="authentication" />}
             value={authSelected}
             variant="filled"
             onChange={authHandler}
```

---

### File 4: `src/lang/hindi/hi.json`
* **Reason:** Across Dashboard, Profile, and Registration, several user-facing keys were completely missing or corrupted with a generic placeholder string (`"इक्विटास के साथ अपना पैसा बढ़ाएँ"`).
* **Summary of Changes:**
  * **Dashboard missing keys added:** `debitCard`, `manageMyDebitCards`, `manageMyDebitCardsDesc`, `noNewNotifications`.
  * **Profile missing keys added (60 keys):** `aadhaarAlertContent`, `aadhaarAlertTitle`, `addressChangeRequestDescription`, `addressDetails`, `aepsNote`, `aepsTransactions`, `changePhoto`, `changeUserId`, `ckycNumber`, `confirmImage`, `copyReferTooltip`, `customerName`, `debitCardFrozenBlockedMsg`, `disableMobileQRInfo`, `disableMobileTokenInfo`, `editEmailId`, `email`, `emailChangeRequestDescription`, `emailIdDuplicateError`, `enableMobileQRInfo`, `enableMobileTokenInfo`, `enableSlashDisable`, `existingUserId`, `invalidPwdErrorMsg`, `languageSelection`, `lastLoginDateTime`, `lastUpdateDate`, `line1`, `maximum32characters`, `minimum6Characters`, `newUserId`, `noOfAttemptsLeft`, `noRegisteredEmailId`, `noRegisteredMobileNumber`, `oneTapTokenText`, `otherPolicies`, `passwordError`, `passwordExpiryDate`, `passwordMismatch`, `photoUploadSizeErrorMessage`, `pinCode`, `qrLoginText`, `reasonForChange`, `referaFriend`, `referralMessage`, `registerAComplaint`, `removePhoto`, `specialCharactersNotAllowed`, `statementPreference`, `success`, `title`, `tncVersionModified`, `transactionLimit`, `type`, `uploadPhotoErrMsg`, `userIDContains`, `useriDIsCaseSensitive`, `userIdMatchMsg`, `userIDNote`, `validPinCodeError`.
  * **Profile corrupted placeholder keys fixed:**
    * `changeCommunicationAddress`: `"संचार पता बदलें"`
    * `invalidEmail`: `"अमान्य ईमेल आईडी"`
    * `withinEquitas`: `"इक्विटास के भीतर"`
    * `otherBanks`: `"अन्य बैंक"`
    * `nickName`: `"उपनाम"`
    * `year`: `"वर्ष"`
  * **Registration missing keys added (16 keys):** `acceptNdContinue`, `cardNumber`, `customerIdProceed`, `enterCustomerId`, `incorrectDebitCardDetails`, `inCorrectEMailMobileDesc`, `invalidCustomerId`, `maxInvalidPinAttemptsMsg`, `otpExpiredSMSEmail`, `ourTncGotExpired`, `registeredCustId`, `reviewUpdateTnC`, `updateTncDescription`, `updateUserIdSuccessMsg`, `verifyUserDetails`, `verifyUsingUserDetails`.
  * **Registration corrupted placeholder keys fixed:**
    * `account`: `"खाता"`
    * `location`: `"स्थान"`

---

## 3. Verification & Validation Results

* **Condition Check:** Verified all string comparisons (`===`, `!==`, `switch/case`) across Dashboard, Profile, and Registration. Zero conditions depend on English display text.
* **Backend Data Contract:** Zero modifications to API responses, payloads, or mock data.
* **ESLint:** 0 errors across all modified components.
* **Webpack Build:** `npm run build:dev` completed successfully with exit code `0`.
