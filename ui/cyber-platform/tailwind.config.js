/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0A0F1E',
          darker: '#050A14',
          navy: '#1A1F2E',
          blue: '#00AFFF',
          cyan: '#00FFC6',
          pink: '#FF00A8',
          purple: '#6366F1',
          gray: '#8B8E98'
        }
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'inter': ['Inter', 'sans-serif']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-glow': 'border-glow 2s ease-in-out infinite alternate',
        'matrix': 'matrix 20s linear infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'ripple': 'ripple 0.6s linear'
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px theme(colors.cyber.cyan), 0 0 10px theme(colors.cyber.cyan), 0 0 15px theme(colors.cyber.cyan)' 
          },
          '100%': { 
            boxShadow: '0 0 10px theme(colors.cyber.cyan), 0 0 20px theme(colors.cyber.cyan), 0 0 30px theme(colors.cyber.cyan)' 
          }
        },
        'border-glow': {
          '0%': { 
            borderColor: 'theme(colors.cyber.cyan)',
            boxShadow: '0 0 5px theme(colors.cyber.cyan)'
          },
          '100%': { 
            borderColor: 'theme(colors.cyber.blue)',
            boxShadow: '0 0 15px theme(colors.cyber.blue)'
          }
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' }
        }
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(45deg, theme(colors.cyber.dark), theme(colors.cyber.navy))',
        'gradient-glow': 'linear-gradient(45deg, theme(colors.cyber.cyan), theme(colors.cyber.blue), theme(colors.cyber.pink))'
      }
    },
  },
  plugins: [],
}
