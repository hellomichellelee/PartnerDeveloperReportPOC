import {
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
} from "@fluentui/react-components";

const brandColors: BrandVariants = {
  10: '#001F3F',
  20: '#002E5C',
  30: '#003D7A',
  40: '#004C99',
  50: '#005BB8',
  60: '#006AD6',
  70: '#0078D4',
  80: '#2899F5',
  90: '#5CB1F7',
  100: '#8FC9F9',
  110: '#B4DBFB',
  120: '#D4EBFD',
  130: '#E8F4FE',
  140: '#F5FAFF',
  150: '#FAFCFF',
  160: '#FFFFFF',
};

export const lightTheme = createLightTheme(brandColors);
export const darkTheme = createDarkTheme(brandColors);
