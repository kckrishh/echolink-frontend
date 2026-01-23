/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0D0F12", // app background
          panel: "#14171C", // cards/sidebars
          hover: "#1A1E24", // hover surface
          overlay: "#1F242B", // popovers/menus/modals
        },

        // ===== TYPOGRAPHY =====
        text: {
          heading: "#F5F7FA", // titles/strong content
          body: "#F5F7FA", // default chat/message text
          secondary: "#A5ACB8", // subtext / meta
          muted: "#6E7685", // placeholders / timestamps
          danger: "#FF5E5E", // error text
          onAccent: "#FFFFFF", // text over brand/danger BG
        },

        // ===== BORDERS & DIVIDERS =====
        border: {
          base: "#2B3038", // default hairline
          focus: "#3D77FF", // focus/active ring
          disabled: "#20252C", // disabled outlines
        },

        // ===== BRAND / ECHO MOTIF =====
        brand: {
          DEFAULT: "#3D77FF", // primary accent
          hover: "#558AFF", // hover state
          active: "#2E63E8", // pressed state
          glow: "rgba(61,119,255,0.30)", // for shadows/effects
          light: "#5B9BFF", // gradient edge / alt link
        },

        // ===== STATE COLORS =====
        state: {
          success: "#3CCF91",
          warning: "#F5B841",
          error: "#FF5E5E",
          info: "#4AB9F2",
        },

        // ===== BUTTON TOKENS (semantic) =====
        button: {
          primary: {
            bg: "#3D77FF",
            hover: "#558AFF",
            active: "#2E63E8",
            text: "#FFFFFF",
          },
          secondary: {
            text: "#F5F7FA",
            border: "#3D77FF",
            hoverBg: "#1A1E24",
            activeBg: "#1F242B",
          },
          ghost: {
            text: "#A5ACB8",
            hoverText: "#F5F7FA",
            hoverBg: "#1A1E24",
          },
          danger: {
            bg: "#FF5E5E",
            hover: "#FF7878",
            active: "#E44A4A",
            text: "#FFFFFF",
          },
          disabled: {
            bg: "#1A1E24",
            text: "#6E7685",
            border: "#20252C",
          },
        },

        // ===== INPUTS / FORMS =====
        input: {
          bg: "#14171C",
          text: "#F5F7FA",
          placeholder: "#6E7685",
          border: "#2B3038",
          hoverBorder: "#3D77FF",
          focusBorder: "#3D77FF",
          errorBorder: "#FF5E5E",
        },

        // ===== LINKS / BADGES / PRESENCE =====
        link: {
          DEFAULT: "#5B9BFF",
          hover: "#558AFF",
        },
        badge: {
          bg: "#3D77FF",
          text: "#FFFFFF",
          unreadFrom: "#3D77FF", // optional gradient start
          unreadTo: "#5B9BFF", // optional gradient end
        },
        presence: {
          online: "#3D77FF", // pulsing dot
          offline: "#6E7685",
        },
      },
      // Optional: shadows used for "echo" glow
      boxShadow: {
        echo: "0 0 8px rgba(61,119,255,0.30)",
        "echo-md": "0 0 12px rgba(61,119,255,0.30)",
      },
      borderRadius: {
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
      },

      keyframes: {
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
      },
      animation: {
        "loading-bar": "loading-bar 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
