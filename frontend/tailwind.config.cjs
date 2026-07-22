module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F9FA',
        slateDark: '#121214',
        borderSlate: '#E6EEF8', // border-slate-200-ish
        brand: {
          DEFAULT: '#4F46E5' // indigo-600
        }
      }
    }
  },
  plugins: []
};
