/** Tokens derived from the three references:
 *  cream canvas + white sheet (ref 1), paper/soft-grey catalogue cards + serif display (ref 2),
 *  orange-active sidebar admin shell (ref 3). One accent (orange), one contrast (ink). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FEF3EA', peach: '#FDE8D6', paper: '#F8F6F0', soft: '#EFEDE7',
        ink: '#0A0A0A', brand: { DEFAULT: '#F57C1F', dark: '#D9650D', light: '#FFE3CC' },
        mute: '#6F6A63', line: '#ECE5DB',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: { tile: '28px', sheet: '40px' },
      boxShadow: { tile: '0 1px 0 rgba(20,10,0,.03), 0 12px 32px -18px rgba(120,60,10,.18)' },
    },
  },
  plugins: [],
};
