import { getInitialListings } from './carData';

// 從統一數據源導入
export const INITIAL_LISTINGS = getInitialListings();

export const EMPTY_FORM_STATE = {
  title: '',
  brand: '',
  city: '',
  year: '',
  mileage: '',
  fuel: '汽油',
  transmission: '自排',
  price: '',
  seller: '',
  phone: '',
  image: '',
  type: '轎車',
};
