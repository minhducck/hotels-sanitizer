import {
  isArray,
  isObject,
  mergeWith,
  MergeWithCustomizer,
  uniq,
  uniqBy,
} from 'lodash';
import { HotelImages, HotelModel } from '../model/hotel.model';

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

const mergeImages = (destImages: HotelImages, sourceImages: HotelImages) => {
  const allImages = { rooms: undefined, site: undefined, amenities: undefined };

  // This step make sure image seq rooms => site => amenities
  _mergeImageEntries(allImages, destImages);
  _mergeImageEntries(allImages, sourceImages);

  return allImages;
};

const mergePrimaryArray = (value: any[], srcValue: any[]) => {
  value.push(...srcValue);
  return uniq(value);
};

export const mergeByCustomizerHelper: MergeWithCustomizer = (
  value: any,
  srcValue: any,
  key: keyof HotelModel,
) => {
  if (key === 'images') {
    return mergeImages(value, srcValue);
  }

  if (key === 'booking_conditions') {
    return value?.length > srcValue?.length ? value : srcValue;
  }

  if (isArray(value) || isArray(srcValue)) {
    return mergePrimaryArray(value || [], srcValue || []);
  }

  if (isObject(value) || isObject(srcValue)) {
    return mergeWith(value, srcValue, mergeByCustomizerHelper);
  }

  return value > srcValue ? value : srcValue;
};
