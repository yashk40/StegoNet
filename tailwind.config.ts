import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// StegoNet Cyber Colors
				cyber: {
					primary: 'hsl(var(--cyber-primary))',
					secondary: 'hsl(var(--cyber-secondary))',
					warning: 'hsl(var(--cyber-warning))',
					danger: 'hsl(var(--cyber-danger))',
					glow: 'hsl(var(--cyber-glow))',
				},
				matrix: {
					bg: 'hsl(var(--matrix-bg))',
					card: 'hsl(var(--matrix-card))',
					surface: 'hsl(var(--matrix-surface))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(var(--cyber-primary) / 0.4)'
					},
					'50%': { 
						boxShadow: '0 0 40px hsl(var(--cyber-primary) / 0.8)'
					}
				},
				'crypto-process': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'matrix-rain': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100vh)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'crypto-process': 'crypto-process 2s infinite',
				'matrix-rain': 'matrix-rain 3s linear infinite'
			},
			backgroundImage: {
				'gradient-cyber': 'var(--gradient-cyber)',
				'gradient-glow': 'var(--gradient-glow)',
				'gradient-primary': 'var(--gradient-primary)'
			},
			boxShadow: {
				'cyber': 'var(--shadow-cyber)',
				'glow': 'var(--shadow-glow)',
				'matrix': 'var(--shadow-matrix)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
