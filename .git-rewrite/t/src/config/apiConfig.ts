import Constants from "expo-constants";

export const NHTSA_API = {
  BASE_URL: "https://vpic.nhtsa.dot.gov/api/vehicles",
  ALL_MAKES: "/GetAllMakes?format=json",
  MAKES_BY_MANUFACTURER: (manufacturer: string) =>
    `/GetMakeForManufacturer/${manufacturer}?format=json`,
  MODELS_BY_MAKE: (make: string) => `/GetModelsForMake/${make}?format=json`,
  MODELS_BY_MAKE_AND_YEAR: (make: string, year: number) =>
    `/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`,
  MODELS_BY_MAKE_AND_TYPE: (make: string, type: string) =>
    `/getmodelsformakeyear/make/${make}/vehicleType/${type}?format=json`,
  MANUFACTURER_DETAILS: (manufacturer: string) =>
    `/GetManufacturerDetails/${manufacturer}?format=json`,
  DECODE_VIN: (vin: string) => `/decodevinvalues/${vin}?format=json`,
  VEHICLE_TYPES: "/GetMakesForVehicleType/car?format=json",
};

export const CAR_LOGO_API = {
  BASE_URL:
    "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/data.json",
};

export const GOOGLE_TRANSLATE_API = {
  BASE_URL: "https://translate.googleapis.com/translate_a/single",
  QUERY_PARAMS: (sourceLang: string, targetLang: string, text: string) =>
    `?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`,
};

export const QUIZ_API = {
  BASE_URL: "https://opentdb.com/api.php",
  DEFAULT_PARAMS: "?amount=10&category=28&type=multiple",
};

export const WIKIPEDIA_API = {
  BASE_URL: "https://wikipedia.org/w/api.php",
  IMAGE_QUERY: (query: string) =>
    `?action=query&format=json&prop=pageimages&titles=${query}&pithumbsize=600&origin=*`,
  DETAILS_QUERY: (query: string, language: string = "en") =>
    `https://${language}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${query}&exintro=true&explaintext=true&origin=*`,
};

export const NEWS_API = {
  BASE_URL: "https://newsapi.org/v2/everything",
  API_KEY: Constants.expoConfig?.extra?.NEWS_API_KEY,
  SUPPORTED_LANGUAGES: [
    "ar",
    "de",
    "en",
    "es",
    "fr",
    "he",
    "it",
    "nl",
    "no",
    "pt",
    "ru",
    "sv",
    "zh",
  ],
};

export const APP_CONFIG = {
  VERSION: Constants.expoConfig?.version || "1.0.0",
  DEVELOPER: "Rafał Ciesielski",
  PORTFOLIO_URL: "https://rciesielski3.github.io/portfolio/#/contact",
  COPYRIGHT: `© ${new Date().getFullYear()} Adateo. All rights reserved.`,
};
