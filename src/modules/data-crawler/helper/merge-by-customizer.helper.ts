import {
  isArray,
  isNumber,
  isObject,
  merge,
  mergeWith,
  MergeWithCustomizer,
  uniq,
  uniqBy,
} from 'lodash';
import {
  HotelAmenities,
  HotelImages,
  HotelLocation,
  HotelModel,
} from '../model/hotel.model';

/**
 * Appends all images by types and eliminate duplication by URL.
 *
 * @param imageBucket
 * @param imagesEntries
 */
const _mergeImageEntries = (
  imageBucket: HotelImages,
  imagesEntries: HotelImages,
) => {
  for (const imageType in imagesEntries) {
    imageBucket[imageType] = imageBucket[imageType] || [];
    imageBucket[imageType].push(...(imagesEntries[imageType] || []));

    // Unique Image
    imageBucket[imageType] = uniqBy(
      imageBucket[imageType],
      (image) => image.link,
    );
  }
};

/**
 * Merge images list
 */
const mergeImages = (value: HotelImages, source: HotelImages) => {
  const allImages = { rooms: undefined, site: undefined, amenities: undefined };

  // This step make sure image seq rooms => site => amenities
  _mergeImageEntries(allImages, value);
  _mergeImageEntries(allImages, source);

  return allImages;
};

const mergeBookingConditions = (value: string[], srcValue: string[]) => {
  return value?.length > srcValue?.length ? value : srcValue;
};

const _mergeAmenityEntry = (dest: object, src: object) => {
  for (const roomType in src) {
    dest[roomType] = dest[roomType] || [];
    dest[roomType].push(...(src[roomType] || []));

    // Unique Image
    dest[roomType] = uniqBy(dest[roomType], (text: string) =>
      text.toLowerCase(),
    );
  }
};
const mergeAmenities = (value: HotelAmenities, srcValue: HotelAmenities) => {
  const result: HotelAmenities = {
    general: undefined,
    room: undefined,
    site: undefined,
  };

  _mergeAmenityEntry(result, value);
  _mergeAmenityEntry(result, srcValue);
  return result;
};

const mergeLocation = (value: HotelLocation, srcValue: HotelLocation) => {
  const locationObj: Partial<HotelLocation> = {};
  locationObj.city = value.city || srcValue.city;
  locationObj.country = value.country || srcValue.country;
  locationObj.address =
    (value.address || '').length > (srcValue.address || '').length
      ? value.address
      : srcValue.address;

  if (srcValue.lat && srcValue.lng) {
    locationObj.lat = srcValue.lat;
    locationObj.lng = srcValue.lng;
  } else if (value.lat && value.lng) {
    locationObj.lat = value.lat;
    locationObj.lng = value.lng;
  } else {
    return merge(locationObj, {
      lat: value.lat || srcValue.lat,
      lng: value.lng || srcValue.lng,
    });
  }
  return locationObj;
};

const specialMergers = new Map<keyof HotelModel, any>([
  ['images', mergeImages],
  ['booking_conditions', mergeBookingConditions],
  ['amenities', mergeAmenities],
  ['location', mergeLocation],
]);

const mergePrimaryArray = (value: any[], srcValue: any[]) => {
  value.push(...srcValue);
  return uniq(value);
};

export const mergeByCustomizerHelper: MergeWithCustomizer = (
  value: any,
  srcValue: any,
  key: keyof HotelModel,
) => {
  if (specialMergers.has(key)) {
    return specialMergers.get(key)(value, srcValue);
  }

  if (isArray(value) || isArray(srcValue)) {
    return mergePrimaryArray(value || [], srcValue || []);
  }

  if (isObject(value) || isObject(srcValue)) {
    return mergeWith(value, srcValue, mergeByCustomizerHelper);
  }

  // If value was number, choose either A if exist else B
  if (isNumber(value) || isNumber(srcValue)) {
    return value || srcValue;
  }

  // String & Bool
  return value > srcValue ? value : srcValue;
};
