// Font Family Helper
// Untuk sementara menggunakan default system font sampai font Outfit diintegrasikan

export const FontFamily = {
  // Outfit font variants
  outfit_thin: 'Outfit-Thin',
  outfit_extralight: 'Outfit-ExtraLight',
  outfit_light: 'Outfit-Light',
  outfit_regular: 'Outfit-Regular',
  outfit_medium: 'Outfit-Medium',
  outfit_semibold: 'Outfit-SemiBold',
  outfit_bold: 'Outfit-Bold',
  outfit_extrabold: 'Outfit-ExtraBold',
  outfit_black: 'Outfit-Black',

  // Fallback untuk development (bisa diganti dengan Outfit nanti)
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
  bold: 'Outfit-Bold',
  semibold: 'Outfit-SemiBold',
};

// Font Weight Helper
export const FontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Text Styles dengan Outfit font
export const TextStyles = {
  // Headings
  heading1: {
    fontFamily: FontFamily.outfit_bold,
    fontWeight: FontWeight.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  heading2: {
    fontFamily: FontFamily.outfit_bold,
    fontWeight: FontWeight.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  heading3: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    fontSize: 24,
    lineHeight: 32,
  },
  heading4: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 20,
    lineHeight: 28,
  },


  // Body Text
  bodyLarge: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 18,
    lineHeight: 26,
  },
  bodyMedium: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  onboardTitle: {
    // fontFamily: FontFamily.outfit_black,
    // fontWeight: FontWeight.black,
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#112D4E',
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 0.2,
    paddingTop: 78,
  },

  // Labels & Buttons
  button: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonSmall: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 12,
    lineHeight: 16,
  },

  // Caption & Small Text
  caption: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  overline: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};
