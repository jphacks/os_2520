/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LINEのブランドカラーをベースにしたカラーパレット
        'line-green': {
          DEFAULT: '#06C755',
          50: '#E8FCF1',
          100: '#C3F7D9',
          200: '#9EF2C1',
          300: '#79EDA9',
          400: '#54E891',
          500: '#06C755', // メインカラー
          600: '#05A546',
          700: '#048237',
          800: '#035F28',
          900: '#023C19',
        },
        'line-bg': {
          DEFAULT: '#F7F7F7',
          dark: '#E8E8E8',
        },
      },
      fontSize: {
        // 高齢者にも見やすい大きめのフォントサイズ
        'xs-readable': ['0.875rem', { lineHeight: '1.5' }],
        'sm-readable': ['1rem', { lineHeight: '1.6' }],
        'base-readable': ['1.125rem', { lineHeight: '1.7' }],
        'lg-readable': ['1.25rem', { lineHeight: '1.75' }],
        'xl-readable': ['1.5rem', { lineHeight: '1.8' }],
      },
      spacing: {
        // タップしやすいサイズのスペーシング
        'tap': '3rem', // 48px - 指でタップしやすいサイズ
      },
      borderRadius: {
        'soft': '0.75rem', // 柔らかい印象の角丸
      },
    },
  },
  plugins: [],
}
