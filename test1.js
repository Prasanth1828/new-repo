import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { connect, useDispatch } from "react-redux";
import { get, includes } from "lodash";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import RefreshIcon from "@mui/icons-material/Refresh";
import Keyboard from "react-simple-keyboard";
import {
  Captcha,
  MuiButton,
  MuiTextField,
  MuiLink,
  DebitCardComponent,
  MuiSnackbars,
  TextFormatter,
  MuiDialog,
  StringToJSX,
} from "../../../components";
import {
  isValidPassword,
  removeSpaceAll,
  removeSpaceandPlus,
  setAtmPinNumber,
  stringLength,
} from "../../../utils/validation";
import {
  clearCaptchaData,
  clearLastLoginDetails,
  clearLoginData,
  clearGetQRData,
  getCaptchaData,
  getQRCodeData,
  loginRequest,
  onLogOut,
  updateForgotLoginHeader,
  updateForgotPassword,
  updateRedirectPageName,
  updateResetPassword,
  updateUserId,
  validateQRCodeData,
  clearValidateQRData,
} from "../actions";
import OtpVerification from "../../Accounts/components/OtpVerification";
import VirtualKeyIcon from "../../../assets/images/virtualKeyIcon.svg";
import * as controller from "./LoginController";
import "react-simple-keyboard/build/css/index.css";
import { cardPinBlk } from "../../../utils/encryption";
import mapStateToProps from "../selectors";
import "./styles.scss";
import { Config } from "../../../assets/config/Config";
import { setSideMenuActiveKey } from "../../../layouts/actions";
import {
  clearBannerInfos,
  clearJourneyError,
  journeyUpdate,
  loadComponent,
} from "../../../pages/actions";
import FailedIcon from "../../../assets/images/failedIcon.svg";
import QrStepPhoneIcon from "../../../assets/images/qrStepPhoneIcon.svg";
import QrStepTapIcon from "../../../assets/images/qrStepTapIcon.svg";
import QrStepScanIcon from "../../../assets/images/qrStepScanIcon.svg";
import SessionDeparted from "../../../components/SessionExpired";
import {
  configVals,
  CustomNavigation,
  encodeQRText,
  getStringUpdate,
  getBrowserInfo,
} from "../../../utils/common";
import { OTP_CONSTANTS } from "../../../components/Otp/constants";
import BannerPopup from "../components/BannerPopup";
import { enterKey, passwordFormat } from "../../../utils/constants";
import { eventConstants, eventTypes } from "../../../utils/eventConstants";
import GetEventAttributes from "../../../components/GetEventAttributes";
import { captchaErrorCodes } from "../constants";
import useConfig from "../../../components/UseConfig";
import { sendOtpRequest } from "../../../components/Otp/actions";
import { closeOtpPopupErrors } from "../../../errorCode/helper/helper";
import LocationRequiredPopup from "../../../components/MuiDialog/components/LocationRequiredPopup";

// Login form component
function LoginForm(props) {
  const {
    label1,
    label2,
    virtualKey,
    link1,
    link2,
    handleLinkClick,
    loginRegistrationData,
    errorData,
    active,
    activeKey,
    journey,
    deepLinkURL,
    otpData,
    countryCode,
    isQrCode,
  } = props;

  const intl = useIntl();
  const [isAllowedLocation, setIsAllowedLocation] = useState(false);
  const [iskeyboardvisibile, setIskeyboardvisibile] = useState(false);
  const [layout, setLayout] = useState("default");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [debitCardNumber, setDebitCardNumber] = useState("");
  const [atmPin, setAtmPin] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const keyboard = useRef();

  const [inputCaptcha, setInputCaptcha] = useState(null);

  const [focusUserfield, setfocusUserfield] = useState(false);
  const [focusPasswordfield, setfocusPasswordfield] = useState(false);
  const [loaclCapchaError, setloaclCapchaError] = useState(false);
  const [captchaImage, setCaptchaImage] = useState("");

  const [timer, setTimer] = useState(0);
  const [browserInfo, setBrowserInfo] = useState({browser: "",device: "",});
  const [isQrExpired, setIsQrExpired] = useState(false);
  const intervalRef = useRef(null);
  const qrAutoRefreshCountRef = useRef(0);
  const QR_AUTO_REFRESH_LIMIT = 10;

  const { data: qrResponse, failure: qrFailure } = get(
    loginRegistrationData,
    "getQRCodeData",
    {},
  );
  const { expireAt, qrText, refNum, sessionId } = get(qrResponse, "data", {});
  const isQrLoading = !qrText && !qrFailure && !isQrExpired;

  const showLocationPopup =
    (String(useConfig("ENABLE_LOCATION")) || Config.enableLocation) === "Y";

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsAllowedLocation(!position?.coords?.latitude);
        },
        // eslint-disable-next-line no-unused-vars
        (error) => {
          setIsAllowedLocation(!isAllowedLocation);
          // Error: ${error.message}`);
        },
      );
    } else {
      // Geolocation is not supported by this browser.
      setIsAllowedLocation(!isAllowedLocation);
    }
  };

  const maxPasswordLength = parseInt(useConfig("PasswordMaxLength"), 10);

  const showCarousel = get(
    loginRegistrationData,
    "loginData.response.otpDetails.preference",
    "",
  );

  const inputElement = useRef(null);
  const userIdElement = useRef(null);
  const journeyEnable = get(window.env, "activeJourny", []);
  const [triggerEventTagging] = GetEventAttributes();
  const {
    loginData,
    lastLoginDetails = {},
    forgotLoginHeader = "",
    redirectPageName = "",
    isSessionExpired = false,
  } = loginRegistrationData;
  const { lastLoginDaysCount } = lastLoginDetails;
  const encryptionKey = String(useConfig("CARD_VAL"));
  const cardpinkey = configVals(encryptionKey)?.toUpperCase();
  const gAppContext = {
    cardpinkey,
  };
  const firstLevelInactivity =
    parseInt(useConfig("FirstLevelInactivity"), 10) ||
    Config.firstLevelInactivity;
  const secondLevelInactivity =
    parseInt(useConfig("SecondLevelInactivity"), 10) ||
    Config.secondLevelInactivity;
  const thirdLevelInactivity =
    parseInt(useConfig("ThirdLevelInactivity"), 10) ||
    Config.thirdLevelInactivity;

  const haventSeenOverDays = getStringUpdate(
    intl.formatMessage({ id: "wehaventseenoverNumdays" }),
    {
      numdays: String(thirdLevelInactivity),
    },
  );

  const quickReAttemptError = get(errorData, "response.data.errorCode", "");

  const otpDialogOpen =
    get(loginData, "response.otpDetails", false) ||
    (lastLoginDaysCount > firstLevelInactivity &&
      lastLoginDaysCount < secondLevelInactivity + 1 &&
      get(otpData, "sendOtp.response.success", false));

  const CHALLENGE = "CHALLENGE";

  const isFrmChallenge = get(loginData, "response.frmStatus", "") === CHALLENGE;
  const getBannerInfos = get(journey, "bannerInfos", "");
  const getCsrfSuccess = get(journey, "getCsrfToken.data", false);
  const loginFailure = get(loginData, "response.code", "");
  const getErrorCode = get(journey, "journeyError.response.data.errorCode", "");
  const getErrorMessage =
    get(journey, "journeyError.response.data.error", "") ||
    "Incorrect Captcha" ||
    "";

  const handleInputCaptcha = useCallback((data) => {
    if (data) {
      setCaptchaError(!data.length);
    }
    setInputCaptcha(data);
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = loginRegistrationData;
  const { navigatePage } = CustomNavigation(redirectPageName);

  if (lastLoginDaysCount > thirdLevelInactivity && !forgotLoginHeader) {
    dispatch(updateForgotLoginHeader("90DaysAbove"));
  } else if (
    lastLoginDaysCount < thirdLevelInactivity + 1 &&
    lastLoginDaysCount > secondLevelInactivity &&
    !forgotLoginHeader
  ) {
    dispatch(updateForgotPassword(true));
    dispatch(updateForgotLoginHeader("45DaysAbove"));
    dispatch(journeyUpdate("Login"));
    dispatch(loadComponent("forgot-password-authentication"));
  }

  const detectAutofill = (element) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          window
            .getComputedStyle(element, null)
            .getPropertyValue("appearance") === "menulist-button",
        );
      }, 10);
    });

  const next = () => {
    navigatePage();
  };

  const { success: validateSuccess } = loginData;
  // const { success: validateSuccess, failure: validateFailure = true } = loginData;

  const clearQRdatas = () => {
    dispatch(clearGetQRData());
    dispatch(clearValidateQRData());
  };

  const loadQRCode = () => {
    clearQRdatas();
    dispatch(getQRCodeData());
  };

  const validateQRCode = () => {
    dispatch(clearValidateQRData());
    dispatch(
      validateQRCodeData({
        refNum: refNum || "",
        sessionId: sessionId || "",
      }),
    );
  };

  useEffect(() => {
    // LOAD QR CODE
    if (active === "qrcode") {
      clearQRdatas();
      loadQRCode();
    }
    return () => {
      setIsQrExpired(false);
      qrAutoRefreshCountRef.current = 0;
      clearQRdatas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    // HANDLE QR FETCH FAILURE
    if (active === "qrcode" && qrFailure) {
      setIsQrExpired(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrFailure]);

  useEffect(() => {
    // QR EXPIRY TIMER
    let interval;
    if (active === "qrcode" && expireAt) {
      const updateTimer = () => {
        const remaining = expireAt - Date.now();
        if (remaining <= 0) {
          setTimer(0);
          clearInterval(interval);
          if (qrAutoRefreshCountRef.current < QR_AUTO_REFRESH_LIMIT) {
            qrAutoRefreshCountRef.current += 1;
            setIsQrExpired(false);
            loadQRCode();
          } else {
            setIsQrExpired(true);
          }
        } else {
          setTimer(Math.floor(remaining / 1000));
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expireAt]);

  useEffect(() => {
    // VALIDATE QR POLLING
    let isCancelled = false;
    const pollQRCode = () => {
      if (
        isCancelled ||
        active !== "qrcode" ||
        isQrExpired ||
        !expireAt ||
        !qrText
      ) {
        return;
      }
      validateQRCode();

      if (!isCancelled && !isQrExpired) {
        intervalRef.current = setTimeout(pollQRCode, 2000);
      }
    };

    pollQRCode();

    return () => {
      isCancelled = true;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isQrExpired, expireAt, qrText]);

  useEffect(() => {
    if (active === "qrcode" && validateSuccess) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateSuccess]);



  useEffect(() => {
  const loadBrowserInfo = async () => {
    const { browser, device } = await getBrowserInfo();
    setBrowserInfo({ browser, device });
  };

  loadBrowserInfo();
}, []);

  const handleQrRefresh = () => {
    qrAutoRefreshCountRef.current = 0;
    clearQRdatas();
    setIsQrExpired(false);
    loadQRCode();
  };

  useEffect(() => {
    if (!focusUserfield && !focusPasswordfield) {
      (async () => {
        const autofill = await detectAutofill(inputElement.current);
        setfocusPasswordfield(autofill);
        if (!userId) setfocusUserfield(false);
        else setfocusUserfield(autofill);
      })();
    }
  }, [userIdElement, inputElement, focusPasswordfield, focusUserfield, userId]);

  useEffect(() => {
    if (!userId) setfocusUserfield(false);
    if (!password) setfocusPasswordfield(false);
  }, [userId, password]);

  useEffect(() => {
    if (users && users.accessToken && users.refreshToken) {
      const customerId = get(users, "customerId", "");
      const email = get(users, "email", "");
      const fullName = get(
        users,
        "loginData.response.customerDetails.fullName",
        "",
      );
      triggerEventTagging({
        action: eventTypes.identify,
        name: customerId,
      });
      triggerEventTagging({
        action: eventTypes.contact,
        name: 660,
        payload: {
          "pk^cust_id": customerId,
          email,
          FNAME: fullName,
        },
      });
      if (virtualKey && getCsrfSuccess) {
        navigatePage();
      }
    } else if (users && users.error) {
      dispatch({ type: "DEFAULT" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    users,
    dispatch,
    navigate,
    navigatePage,
    getCsrfSuccess,
    virtualKey,
    redirectPageName,
  ]);

  const onUseridChange = (event) => {
    if (virtualKey) {
      if (/^[a-zA-Z0-9]*$/.test(event)) setUserId(event);
    } else {
      setDebitCardNumber(event.trim());
    }
  };

  const directPage = (page) => {
    dispatch(updateRedirectPageName(redirectPageName === page ? !page : page));
  };

  const handleOTPClose = () => {
    navigate("/login");
    dispatch(onLogOut());
  };

  const onPasswordChange = (event) => {
    setShowPassword(false);
    if (virtualKey && (isValidPassword(event) || !event)) {
      setPassword(event);
      keyboard.current.setInput(event);
    } else {
      setAtmPin(setAtmPinNumber(event));
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === enterKey) {
      // Trigger login when Enter key is pressed
      submitLogin(event);
    }
  };

  const keyboardHandleClick = () => {
    setIskeyboardvisibile((prevState) => !prevState);
  };

  const keyboardHandleChange = (password) => {
    if (password.length > 32) {
      password = stringLength(password, 0, 32);
    }
    if (!password) {
      setfocusPasswordfield(false);
    } else {
      setfocusPasswordfield(true);
    }
    // setPassword(password);
    onPasswordChange(password);
  };

  const keyboardHandleShift = () => {
    const newLayoutName = layout === "default" ? "shift" : "default";
    setLayout(newLayoutName);
  };

  const keyboardHandlePress = (button) => {
    if (button === "{shift}" || button === "{lock}") keyboardHandleShift();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = () => {
    setShowPassword(!showPassword);
  };

  const resetErrorData = () => {
    setShowSnackBar(false);
    setSnackBarMessage("");
  };

  const clickLoginAction = () => {
    setTimeout(() => {
      userIdElement.current.focus();
    }, 100);
  };

  const submitLogin = (e) => {
    e.preventDefault();
    dispatch(clearJourneyError());
    dispatch(updateResetPassword(false));
    let errorStatus = true;
    if (virtualKey && (!userId || !password)) {
      setShowSnackBar(true);
      setSnackBarMessage("enterUserIdPassword");
      setloaclCapchaError(true);
      errorStatus = false;
    } else if (!virtualKey && (!atmPin || !debitCardNumber)) {
      setShowSnackBar(true);
      setSnackBarMessage("enterDebitcardPin");
      setloaclCapchaError(true);
      errorStatus = false;
    } else if (window.env.environment !== "sit2" && !inputCaptcha) {
      setShowSnackBar(true);
      setSnackBarMessage("enterTheCaptcha");
      errorStatus = false;
    } else if (inputCaptcha && inputCaptcha.length < 5) {
      setCaptchaError(true);
      setloaclCapchaError(true);
      errorStatus = false;
    } else if (virtualKey && controller.userIdValidation(userId)?.helperText) {
      setShowSnackBar(true);
      setSnackBarMessage("invalidUserPassword");
      setloaclCapchaError(true);
      errorStatus = false;
    } else if (!virtualKey && removeSpaceAll(debitCardNumber).length < 16) {
      setloaclCapchaError(true);
      setShowSnackBar(true);
      setSnackBarMessage("inValidDebitAtmpin");
      errorStatus = false;
    } else if (
      !virtualKey &&
      (controller.atmPinValidation(atmPin)?.helperText ||
        controller.debitCardValidation(removeSpaceAll(debitCardNumber))
          ?.helperText)
    ) {
      setloaclCapchaError(true);
      setShowSnackBar(true);
      setSnackBarMessage("inValidDebitAtmpin");
      errorStatus = false;
    }

    if (!errorStatus) {
      return errorStatus;
    }

    let debitCard = "";
    let encryptedData = {};
    if (debitCardNumber && atmPin) {
      debitCard = removeSpaceAll(debitCardNumber);
      encryptedData = cardPinBlk(4, atmPin, debitCard, gAppContext);
    }
    setCaptchaError(false);
    return !userId && virtualKey
      ? onUseridChange(userId)
      : !password && virtualKey
        ? onPasswordChange(password)
        : !debitCardNumber && !virtualKey
          ? onUseridChange(debitCardNumber)
          : !atmPin && !virtualKey
            ? onPasswordChange(atmPin)
            : userId && password && virtualKey
              ? dispatch(
                  loginRequest({
                    userName: userId,
                    password,
                    captcha:
                      window.env.environment === "sit2"
                        ? inputCaptcha || "12345"
                        : inputCaptcha,
                    countryCode,
                  }),
                )
              : debitCardNumber && atmPin && !virtualKey
                ? dispatch(
                    loginRequest({
                      debitCard,
                      atmPin: encryptedData?.pin || "",
                      captcha:
                        window.env.environment === "sit2"
                          ? inputCaptcha || "12345"
                          : inputCaptcha,
                      countryCode,
                    }),
                  )
                : "";
  };

  // Text according to Localization ID
  const journeys = [
    {
      url: "accounts",
      value: "accounts",
      id: 2,
      text: <TextFormatter id="accounts" />,
      eventName: eventConstants.deeplink_accounts_screen,
    },
    {
      url: "deposits",
      value: "deposits",
      id: 5,
      text: <TextFormatter id="deposits" />,
      eventName: eventConstants.deeplink_deposit,
    },
    {
      url: "cards",
      value: "cards",
      id: 4,
      text: <TextFormatter id="cards" />,
      eventName: eventConstants.deeplink_cards,
    },
    {
      url: "pay",
      value: "payments",
      id: 3,
      text: <TextFormatter id="payments" />,
      eventName: eventConstants.deeplink_payments,
    },
    {
      url: "loans",
      value: "loans",
      id: 7,
      text: <TextFormatter id="loans" />,
      eventName: eventConstants.deeplink_loans,
    },
    {
      url: "invest",
      value: "investments",
      id: 6,
      text: <TextFormatter id="investments" />,
      eventName: eventConstants.deeplink_invest,
    },
    {
      url: "profile",
      value: "myProfile",
      id: 1,
      text: <TextFormatter id="myProfile" />,
      eventName: eventConstants.deeplink_my_profile,
    },
    {
      url: "rewardsoffers",
      value: "rewards",
      id: 11,
      text: <TextFormatter id="rewards" />,
      eventName: eventConstants.deeplink_rewards,
    },
    {
      url: "requests",
      value: "requests",
      id: 9,
      text: <TextFormatter id="requests" />,
      eventName: eventConstants.deeplink_requests,
    },
    {
      url: "tax",
      value: "tax",
      id: 10,
      text: <TextFormatter id="tax" />,
      eventName: eventConstants.deeplink_tax,
    },
  ];

  const getCaptchaImageSuccess = get(
    loginRegistrationData,
    "getCaptchaData.data.success",
    false,
  );

  const onClickJourneyButton = (journeyList) => {
    dispatch(
      setSideMenuActiveKey(activeKey === journeyList.id ? 6 : journeyList.id),
    );
    directPage(journeyList.url);
    const getEventName = get(journeyList, "eventName", "");
    if (getEventName) {
      triggerEventTagging({
        type: eventTypes.screen,
        name: getEventName,
        payload: {
          screen_name: getEventName,
        },
      });
    }
  };

  const onClose = () => {
    dispatch(onLogOut());
  };

  const loadCaptcha = () => {
    setInputCaptcha("");
    dispatch(clearCaptchaData());
    dispatch(getCaptchaData());
  };

 const getEncodedText = useMemo(() => {
  const qrPayload = `${qrText};${JSON.stringify({
    browser: browserInfo.browser,
    device: browserInfo.device,
    requestTime: new Date().toISOString(),
  })}`;

  return encodeQRText(qrPayload) || "";
}, [qrText, browserInfo]);

  useEffect(() => {
    if (active !== "qrcode") {
      getLocation();
      loadCaptcha();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getCaptchaImageSuccess) {
      const getCapchaImage = get(
        loginRegistrationData,
        "getCaptchaData.data.data.captcha",
        "",
      );
      setCaptchaImage(getCapchaImage);
    }
  }, [getCaptchaImageSuccess, loginRegistrationData]);

  useEffect(() => {
    const deepLinkJourney = journeys?.filter(
      (item) => item.url === deepLinkURL,
    );
    const isValidDeepLink =
      deepLinkJourney.length > 0 && Object.keys(deepLinkJourney[0]).length > 0;
    if (isValidDeepLink) onClickJourneyButton(deepLinkJourney[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loginFailure) {
      if (getErrorCode === "LOG_VE_031") dispatch(updateUserId(userId));
      dispatch(clearLoginData());
      if (active !== "qrcode") {
        loadCaptcha();
        if (captchaErrorCodes.includes(getErrorCode)) {
          setCaptchaError(true);
          setloaclCapchaError(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginFailure, getErrorCode]);

  useEffect(() => {
    if (
      lastLoginDaysCount > firstLevelInactivity &&
      lastLoginDaysCount < secondLevelInactivity + 1
    ) {
      const payload = {
        type: OTP_CONSTANTS.Login,
        email: "",
        mobileNumber: `${removeSpaceandPlus(lastLoginDetails?.mobileNumber)}`,
        customerId: lastLoginDetails?.customerId,
        resendOtp: true,
      };
      dispatch(sendOtpRequest(payload));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastLoginDaysCount, loginData]);

  useEffect(() => {
    if (quickReAttemptError === closeOtpPopupErrors[0]) {
      dispatch(clearLastLoginDetails());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickReAttemptError]);

  const captchaErrorMessage = captchaError ? getErrorMessage : "";

  const onCloseBanner = () => {
    dispatch(clearBannerInfos());
  };

  return (
    <>
      {showLocationPopup && isAllowedLocation && (
        <LocationRequiredPopup journey={journey} />
      )}
      {isSessionExpired && <SessionDeparted clickAction={clickLoginAction} />}
      {getBannerInfos && getBannerInfos.length ? (
        <BannerPopup bannerInfo={getBannerInfos} onClosePopup={onCloseBanner} />
      ) : (
        ""
      )}
      {isQrCode ? (
        <Grid
          container
          columns={8}
          spacing={2}
          className="qr-container"
          alignItems="stretch"
        >
          <Grid item xs={8} sm={3} className="qr-login__left">
            <Box className="qr-login__leftsub">
              <Box className="qr-login__qr-box">
                <div className={`qr-wrapper ${(isQrExpired || isQrLoading) ? "expired" : ""}`}>
                  <QRCodeSVG value={getEncodedText || ""} size={260} />

                </div>

                {isQrExpired && (
                  <IconButton
                    className="qr-refresh-center"
                    onClick={handleQrRefresh}
                    aria-label="Refresh QR"
                  >
                    <RefreshIcon fontSize="large" />
                  </IconButton>
                )}
                {isQrLoading && (
                  <CircularProgress className="qr-refresh-loader" size={24} />
                )}
              </Box>
              <Typography color="neutral" className={`qr-expiry ${(isQrExpired || isQrLoading) ? "v-hidden" : ""}`}>
                <TextFormatter id="refreshIn" /> <b>{timer}s</b>
              </Typography>
              <div className="qr-security-badge">
                <VerifiedUserOutlinedIcon className="qr-security-badge__icon" />
                <span className="qr-security-badge__text">
                  {/* <TextFormatter id="qrSecuredLoginText" /> */}
                  256-Bit Encrypted & Secure Login
                </span>
              </div>
            </Box>
          </Grid>

          <Grid item xs={8} sm={5} className="qr-login__right">
            <Box className="qr-login__content-box">
              {/* <Typography color="primary" className="qr-login__title">
                 <TextFormatter id="qrLoginTitle" />
              </Typography> */}
              {/* <Typography color="primary" className="qr-login__desc">
                <TextFormatter id="qrLoginDesc" />
              </Typography> */}
              <ul className="qr-steps-visual">
                <li className="qr-step-item">
                  <span className="qr-step-icon">
                    <QrStepPhoneIcon />
                  </span>
                  <span className="qr-step-text">
                    <span className="qr-step-label"><TextFormatter id="qrLoginStep1.1" /></span>
                    <span className="qr-step-copy"> <TextFormatter id="qrLoginStep1.2" /></span>
                  </span>
                </li>
                <li className="qr-step-item">
                  <span className="qr-step-icon">
                    <QrStepTapIcon />
                  </span>
                  <span className="qr-step-text">
                    <span className="qr-step-label"> <TextFormatter id="qrLoginStep2.1" /></span>
                    <span className="qr-step-copy"> <TextFormatter id="qrLoginStep2.2" /></span>
                  </span>
                </li>
                <li className="qr-step-item">
                  <span className="qr-step-icon">
                    <QrStepScanIcon />
                  </span>
                  <span className="qr-step-text">
                    <span className="qr-step-label"><TextFormatter id="qrLoginStep3.1" /></span>
                    <span className="qr-step-copy"><TextFormatter id="qrLoginStep3.2" /></span>
                  </span>
                </li>
              </ul>
              <div className="qr-enable-hint">
                <InfoOutlinedIcon className="qr-enable-hint__icon" fontSize="small" />
                <p className="qr-enable-hint__text">
                  <span className="qr-enable-hint__lead"><TextFormatter id="qrEnableHintText" /></span>
                  <span className="qr-enable-hint__mid"><TextFormatter id="qrEnableHintSubText" /></span>
                  <b className="qr-enable-hint__path"> <TextFormatter id="qrEnableHintPath" /></b>
                </p>
              </div>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <>
          <Grid
            container
            columns={8}
            rowGap={1.5}
            className="login-page__tabpanel-container"
          >
            <MuiDialog
              className={"Login_Popup"}
              onDialogClose={onClose}
              open={forgotLoginHeader === "90DaysAbove"}
              type="message"
              message={
                <>
                  <Box>
                    <FailedIcon
                      preserveAspectRatio={"none"}
                      viewBox="0 0 190 191.32"
                      className="failureVector-icon"
                    />
                  </Box>
                  <Box className="userIdNotFound-dialogBox__content">
                    <Typography className="welcome-title">
                      <TextFormatter id="welcomeBack" />
                    </Typography>
                    <Typography className="bodyContentMessage">
                      <StringToJSX jsxString={haventSeenOverDays} />
                    </Typography>
                    <Typography className="bodyContentMessage">
                      <TextFormatter id="pleasecontactcustomercare" />
                    </Typography>
                  </Box>
                </>
              }
              actions={
                <Box>
                  <MuiButton
                    size="large"
                    color="primary"
                    text={<TextFormatter id="close" />}
                    disabled={false}
                    onClick={onClose}
                  />
                </Box>
              }
            />

            {showSnackBar && (
              <MuiSnackbars
                isOpen
                message={snackBarMessage}
                severity={"error"}
                autoHideDuration={5000}
                vertical={"top"}
                horizontal={"center"}
                resetErrorData={resetErrorData}
              />
            )}
            <OtpVerification
              dialog
              dialogOpen={otpDialogOpen}
              onDialogClose={handleOTPClose}
              data={next}
              type={
                active === "userid"
                  ? OTP_CONSTANTS.Login
                  : OTP_CONSTANTS.Debitcard
              }
              checkType={
                isFrmChallenge && otpDialogOpen
                  ? OTP_CONSTANTS.OARM
                  : OTP_CONSTANTS.Login
              }
              otpJourney={OTP_CONSTANTS.Login}
              showCarousel={showCarousel}
            />

            {virtualKey ? (
              <MuiTextField
                autoFocus
                id="login_userId_new"
                name="login_userId_new"
                inputRef={userIdElement}
                label={label1}
                value={userId}
                maxLength={Config.userIdLength}
                type="text"
                className="login-page__text-field__userField col-1"
                variant="filled"
                onChange={onUseridChange}
                onClick={() => setfocusUserfield(true)}
                onBlur={(e) => setfocusUserfield(e.target.value)}
                onKeyPress={handleKeyPress}
                InputLabelProps={{
                  shrink: userId?.length > 0,
                }}
              />
            ) : (
              <DebitCardComponent
                name="login_debitcard"
                id="login_debitcard"
                updateNumber={onUseridChange}
                value={debitCardNumber}
                className={"col-1"}
                onKeyPress={handleKeyPress}
                fromLogin
              />
            )}

            <MuiTextField
              id="login_password"
              name="login_password"
              inputRef={inputElement}
              label={label2}
              value={virtualKey ? password : atmPin}
              maxLength={
                virtualKey
                  ? maxPasswordLength || Config.userPswdLength
                  : Config.atmPinLength
              }
              type={showPassword ? "text" : "password"}
              className="login-page__text-field__passwordField col-2"
              variant="filled"
              onChange={onPasswordChange}
              onClick={() => setfocusPasswordfield(true)}
              onBlur={(e) => setfocusPasswordfield(e.target.value)}
              onKeyPress={handleKeyPress}
              InputLabelProps={{ shrink: focusPasswordfield }}
              InputProps={{
                readOnly: iskeyboardvisibile,
                endAdornment:
                  password && Config.showEyeIcon ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        className="password_eye_icon"
                      >
                        {showPassword ? (
                          <VisibilityOutlinedIcon className="equitas-blue" />
                        ) : (
                          <VisibilityOffOutlinedIcon className="equitas-blue" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ) : null,
              }}
            />
            {virtualKey && (
              <button
                tabIndex="-1"
                type="button"
                onClick={keyboardHandleClick}
                className="login-page__keyboard-button"
              >
                <VirtualKeyIcon
                  preserveAspectRatio={"none"}
                  viewBox="0 0 28 19.6"
                />
                <span className="keyboard-action">
                  {iskeyboardvisibile ? (
                    <TextFormatter id="hide" />
                  ) : (
                    <TextFormatter id="show" />
                  )}
                </span>
              </button>
            )}
            <Box
              sx={{
                display: iskeyboardvisibile ? "block" : "none",
              }}
              className="login-page__keyboard-container"
            >
              <Keyboard
                keyboardRef={(r) => {
                  keyboard.current = r;
                }}
                onChange={keyboardHandleChange}
                layoutName={layout}
                onKeyPress={keyboardHandlePress}
                inputPattern={passwordFormat}
              />
            </Box>
          </Grid>
          {link1 !== undefined && (
            <Box className="login-page__link-container">
              <MuiLink
                className="login-page__forgot-link"
                component="button"
                tabindex="-1"
                onClick={() => handleLinkClick({ link: link1 })}
              >
                <TextFormatter id={link1} />
              </MuiLink>
              <p className="login-page__option-link">|</p>
              <MuiLink
                className="login-page__forgot-link"
                tabindex="-1"
                onClick={() => handleLinkClick({ link: link2 })}
                component="button"
              >
                <TextFormatter id={link2} />
              </MuiLink>
            </Box>
          )}
          <Captcha
            onInputCaptcha={handleInputCaptcha}
            errorRefresh={errorData}
            loaclCapchaError={loaclCapchaError}
            onresetError={setloaclCapchaError}
            captchaErr={captchaErrorMessage}
            onKeyPress={handleKeyPress}
            captchaImage={captchaImage}
            reloadCaptcha={loadCaptcha}
          />
        </>
      )}

      <Typography color={"neutral"} className="login-page__select-paragraph">
        <TextFormatter id="selectYourJourney" />
      </Typography>
      <Box className={`login-page__journeys-list ${isQrCode && "qr-mb"}`}>
        {journeys.map(
          (journey, index) =>
            (includes(journeyEnable, journey.value) ||
              includes(journeyEnable, journey.url)) && (
              <MuiButton
                tabIndex="-1"
                key={index}
                size="small"
                color={
                  redirectPageName === journey.url ? "secondary" : "neutral"
                }
                className={
                  redirectPageName === journey.url ? "selected-journey" : ""
                }
                onClick={() => onClickJourneyButton(journey)}
                disabled={
                  !(
                    includes(journeyEnable, journey.value) ||
                    includes(journeyEnable, journey.url)
                  )
                }
                text={journey.text}
              />
            ),
        )}
      </Box>

      {!isQrCode && (
        <MuiButton
          size="small"
          color="secondary"
          onClick={submitLogin}
          disabled={false}
          text={<TextFormatter id="login" />}
          className="login-page__login-button"
        />
      )}
    </>
  );
}

export default connect(mapStateToProps)(LoginForm);

LoginForm.propTypes = {
  label1: PropTypes.any,
  label2: PropTypes.any,
  virtualKey: PropTypes.bool,
  link1: PropTypes.string,
  link2: PropTypes.string,
  handleLinkClick: PropTypes.func,
  loginRegistrationData: PropTypes.object,
  errorData: PropTypes.any,
  active: PropTypes.string,
  activeKey: PropTypes.number,
  journey: PropTypes.any,
  deepLinkURL: PropTypes.any,
  otpData: PropTypes.any,
  countryCode: PropTypes.any,
  isQrCode: PropTypes.any,
};
