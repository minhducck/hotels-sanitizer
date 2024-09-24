import { mergeByCustomizerHelper } from './merge-by-customizer.helper';
import { mergeWith } from 'lodash';
import { HotelModel } from '../model/hotel.model';

describe('merge-by-length-customizer.helper', () => {
  const merge = mergeByCustomizerHelper;

  describe('root', () => {
    it('should return "Beach Villas Singapore"', () => {
      expect(
        mergeWith(
          { name: 'Beach Villas Singapore' },
          { name: 'Beach Villas' },
          merge,
        ),
      ).toStrictEqual({ name: 'Beach Villas Singapore' });
    });

    it('Pick available mame', () => {
      expect(
        mergeWith({ name: undefined }, { name: 'Beach Villas' }, merge),
      ).toStrictEqual({ name: 'Beach Villas' });
    });

    it('Merge logcation object', () => {
      expect(
        mergeWith({ location: { lat: 1 } }, { location: { lng: 123 } }, merge),
      ).toMatchObject({
        location: {
          lat: 1,
          lng: 123,
        },
      });
    });

    it('Merge with nested object', () => {
      expect(
        mergeWith(
          {
            location: {
              lat: 1,
              lng: null,
              address: 'Singapore',
              city: 'Singapore',
            },
          },
          { location: { lat: 5, lng: 6 } },
          merge,
        ),
      ).toMatchObject({
        location: { lat: 5, lng: 6, address: 'Singapore', city: 'Singapore' },
      });
    });

    it('Merge with arrays', () => {
      expect(
        mergeWith({ arr: [1, 2, 3] }, { arr: [3, 4, 5] }, merge),
      ).toStrictEqual({
        arr: [1, 2, 3, 4, 5],
      });
    });

    it('Merge sample mock obs=js', () => {
      const srcObj: Partial<HotelModel> = {
        amenities: {
          general: ['indoor pool', 'PS5'],
          room: ['tv', 'aircon'],
        },
        booking_conditions: ['Chilli Crabs'],
        images: {
          rooms: [{ link: 'YYY', description: 'Double room' }],
          site: [{ link: 'ZZZ', description: 'Bar' }],
        },
      };
      const destObj = {
        amenities: {
          general: ['indoor pool', 'rest', 'room', 'wifi'],
          room: ['tv'],
        },
        booking_conditions: [
          "All children are welcome. One child under 12 years stays free of charge when using existing beds. One child under 2 years stays free of charge in a child's cot/crib. One child under 4 years stays free of charge when using existing beds. One older child or adult is charged SGD 82.39 per person per night in an extra bed. The maximum number of children's cots/cribs in a room is 1. There is no capacity for extra beds in the room.",
          'Pets are not allowed.',
        ],
        images: {
          rooms: [{ link: 'XXX', description: 'Double room' }],
          amenities: [{ link: 'WWW', description: 'Bar' }],
        },
      };

      expect(mergeWith(destObj, srcObj, merge)).toMatchObject({
        amenities: {
          room: ['tv', 'aircon'],
          general: ['indoor pool', 'rest', 'room', 'wifi', 'PS5'],
        },

        booking_conditions: [
          "All children are welcome. One child under 12 years stays free of charge when using existing beds. One child under 2 years stays free of charge in a child's cot/crib. One child under 4 years stays free of charge when using existing beds. One older child or adult is charged SGD 82.39 per person per night in an extra bed. The maximum number of children's cots/cribs in a room is 1. There is no capacity for extra beds in the room.",
          'Pets are not allowed.',
        ],
        images: {
          site: [{ link: 'ZZZ', description: 'Bar' }],
          amenities: [{ link: 'WWW', description: 'Bar' }],
          rooms: [
            { link: 'XXX', description: 'Double room' },
            { link: 'YYY', description: 'Double room' },
          ],
        },
      });
    });
  });
});
