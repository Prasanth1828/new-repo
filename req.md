# Request Journey Localization (i18n) Changes

Indha document-la namma mathina ella files, athoda exact line numbers, Before vs After code changes, matrum language JSON files-la sertha keys irukku. Vera branch-la copy-paste panni apply panna idhai direct-ah use pannikonga.

---

## 📁 Summary of Files Modified

### 🔹 Component Files (8 Files)
1. `src/models/ServiceRequest/components/NonWorkingHrs.js`
2. `src/models/ServiceRequest/DoorStepRequest/index.js`
3. `src/models/ServiceRequest/TransactionRealtedRquest/DisputeStatus.js`
4. `src/models/ServiceRequest/MyRequest.js`
5. `src/models/ServiceRequest/AccountVariant.js`
6. `src/models/ServiceRequest/AccountRelatedRequest/DormantAccountVariant.js`
7. `src/models/ServiceRequest/ProfileRelatedRequest/ReKycUpdate.js`
8. `src/models/ServiceRequest/components/VideoCallRequest/iframe.js`

### 🔹 Language JSON Files (5 Files)
1. `src/lang/en/en.json`
2. `src/lang/tamil/ta.json`
3. `src/lang/hindi/hi.json`
4. `src/lang/kannada/kn.json`
5. `src/lang/telugu/te.json`

---

## 🛠 Detailed Code Changes (Before vs After)

### 1. `src/models/ServiceRequest/components/NonWorkingHrs.js`
**Location:** Inside `CloseInfoIcon` MuiButton (around Line 52-59)  
**Reason:** "Close" button text hardcoded-ah irundhadhu.

```diff
             <MuiButton
               className="profileService-button"
               size="small"
               color="secondary"
               onClick={CloseInfoIcon}
-              text={"Close"}
+              text={<TextFormatter id="close" />}
             />
```

---

### 2. `src/models/ServiceRequest/DoorStepRequest/index.js`
**Location:** Inside `onClickNearestBranchActivation` MuiButton (around Line 169-176)  
**Reason:** "Contact Customer Care" button text hardcoded-ah irundhadhu.

```diff
                   <MuiButton
                     className="customerService-button"
                     size="medium"
                     color="secondary"
                     onClick={onClickNearestBranchActivation}
-                    text={"Contact Customer Care"}
+                    text={<TextFormatter id="contactCustomerCare" />}
                   />
```

---

### 3. `src/models/ServiceRequest/TransactionRealtedRquest/DisputeStatus.js`
**Location:** Inside `getDisputeStatusEvent` MuiButton (around Line 204-213)  
**Reason:** "Get Dispute Status" button text hardcoded-ah irundhadhu.

```diff
           <Box className="getStatement">
             <MuiButton
               size="small"
               color="primary"
               selectedview
               startIcon={<RefreshIcon />}
               disabled={!startDate || !endDate}
               onClick={getDisputeStatusEvent}
-              text="Get Dispute Status"
+              text={<TextFormatter id="getDisputeStatus" />}
             />
           </Box>
```

---

### 4. `src/models/ServiceRequest/MyRequest.js`
**Location 1:** Status Filter Button text (around Line 137-140)  
**Reason:** Filter list-la "All" label hardcoded-ah irundhadhu (state/logic match `"All"` aave irukkum, UI display mattum localize aagum).

```diff
                 onClick={() => onClickStatus(journey?.value)}
-                text={journey?.value}
+                text={
+                  journey?.value === "All" ? (
+                    <TextFormatter id="all" />
+                  ) : (
+                    journey?.value
+                  )
+                }
               />
```

**Location 2:** Video Call Button text (around Line 171-177)  
**Reason:** "Video Call" label hardcoded-ah irundhadhu.

```diff
                             text={
                               <Box className="my-request__videocall-text">
                                 <Typography className="title" color={"neutral"}>
-                                  {"Video Call"}
+                                  <TextFormatter id="videoCall" />
                                 </Typography>
                               </Box>
                             }
```

---

### 5. `src/models/ServiceRequest/AccountVariant.js`
**Location 1:** Future Product Dropdown placeholder (around Line 350-356)  
**Reason:** "Future Product" placeholder hardcoded string-ah irundhadhu.

```diff
             <Box className="feature-product_dropdown-container">
               <DropDown
-                placeholder={"Future Product"}
+                placeholder={<TextFormatter id="futureProduct" />}
                 value={futureProduct}
                 variant="filled"
                 onChange={onChangeFutureProduct}
                 options={idProofOptions}
               />
             </Box>
```

**Location 2:** Submit MuiButton (around Line 412-419)  
**Reason:** "Submit" button text hardcoded-ah irundhadhu.

```diff
         <MuiButton
           className="submit-btn"
           size="small"
           color="secondary"
-          text={"Submit"}
+          text={<TextFormatter id="submit" />}
           disabled={!(checked && accountNumber && futureProduct)}
           onClick={onClickSubmit}
         />
```

---

### 6. `src/models/ServiceRequest/AccountRelatedRequest/DormantAccountVariant.js`
**Location:** DropDown placeholder (around Line 258-267)  
**Reason:** "Select Account Number" placeholder hardcoded-ah irundhadhu.

```diff
       <Box className="dormantAccountVariant__account-dropdown-container">
         <DropDown
-          placeholder={"Select Account Number"}
+          placeholder={<TextFormatter id="selectAccountNumber" />}
           value={selectedAccount}
           variant="filled"
           onChange={onChangeAccountNumber}
           options={formatMasking(availableAccountSR)}
           disabled={availableAccountSR?.length === 1}
         />
       </Box>
```

---

### 7. `src/models/ServiceRequest/ProfileRelatedRequest/ReKycUpdate.js`
**Location 1:** Page Title (around Line 478-480)  
**Reason:** Key name `id={"Re-KYC Update"}` thappa irundhadhu (JSON-la irukkum key `reKycUpdate`, so fallback literal mattume render aagi language change aagala).

```diff
       <Typography color={"primary1"} className="nominee__title">
-        <FormattedMessage id={"Re-KYC Update"} />
+        <FormattedMessage id="reKycUpdate" />
       </Typography>
```

**Location 2:** Email helpertext (around Line 696-699)  
**Reason:** "Invalid Email" error text hardcoded-ah irundhadhu.

```diff
                 maxLength={Config.emailIdLength}
-                helpertext={error ? "Invalid Email" : ""}
+                helpertext={error ? <TextFormatter id="invalidEmail" /> : ""}
                 error={error}
```

---

### 8. `src/models/ServiceRequest/components/VideoCallRequest/iframe.js`
**Location:** Loading state & imports (around Line 1-13)  
**Reason:** "Loading..." hardcoded-ah irundhadhu.

```diff
 import React from "react";
 import PropTypes from "prop-types";
+import { TextFormatter } from "../../../../components";
 
 const Iframe = ({ source }) => {
   if (!source) {
-    return <div>Loading...</div>;
+    return (
+      <div>
+        <TextFormatter id="loading" />
+      </div>
+    );
   }
```

---

## 🌐 Language JSON Files Updates

Idhai ungaloda JSON files-oda last lines-la add pannikonga:

### 1. `src/lang/en/en.json`
Add before closing `}`:
```json
  "contactCustomerCare": "Contact Customer Care",
  "getDisputeStatus": "Get Dispute Status",
  "futureProduct": "Future Product",
  "loading": "Loading...",
  "UCIC": "UCIC",
  "profession": "Profession"
```

### 2. `src/lang/tamil/ta.json`
Add before closing `}`:
```json
  "contactCustomerCare": "வாடிக்கையாளர் சேவையைத் தொடர்பு கொள்ளவும்",
  "getDisputeStatus": "சர்ச்சை நிலையைப் பெறவும்",
  "futureProduct": "எதிர்கால தயாரிப்பு",
  "loading": "ஏற்றுகிறது...",
  "UCIC": "UCIC",
  "profession": "தொழில்"
```

### 3. `src/lang/hindi/hi.json`
Add before closing `}`:
```json
  "contactCustomerCare": "ग्राहक सेवा से संपर्क करें",
  "getDisputeStatus": "विवाद की स्थिति प्राप्त करें",
  "futureProduct": "भविष्य का उत्पाद",
  "loading": "लोड हो रहा है...",
  "UCIC": "UCIC",
  "profession": "पेशा"
```

### 4. `src/lang/kannada/kn.json`
Add before closing `}`:
```json
  "contactCustomerCare": "ಗ್ರಾಹಕ ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ",
  "getDisputeStatus": "ವಿವಾದದ ಸ್ಥಿತಿಯನ್ನು ಪಡೆಯಿರಿ",
  "futureProduct": "ಭವಿಷ್ಯದ ಉತ್ಪನ್ನ",
  "loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
  "UCIC": "UCIC",
  "profession": "ವೃತ್ತಿ"
```

### 5. `src/lang/telugu/te.json`
Add before closing `}`:
```json
  "contactCustomerCare": "కస్టమర్ కేర్‌ను సంప్రదించండి",
  "getDisputeStatus": "వివాద స్థితిని పొందండి",
  "futureProduct": "భవిష్యత్ ఉత్పత్తి",
  "loading": "లోడ్ అవుతోంది...",
  "UCIC": "UCIC",
  "profession": "వృత్తి"
```
