import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { themeOptions } from "./typography";

const baseOptions = {
  palette: {
    primary: {
      main: "#fff", // Customize this color as needed
    },
    secondary: {
      main: "rgba(255, 255, 255, 0.60)", // Customize this color as needed
    },
    background: {
      main: "#080031", // Customize this color as needed
    },
    text: {
      primary: "#fff",
      secondary: "rgba(255, 255, 255, 0.60)",
    },
    // Add more color definitions as needed
  },
  components: {
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(122, 105, 254, 0.25)",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: "230px",
          backgroundColor: "#251327",
        },
        paperAnchorDockedLeft: {
          borderRight: "0",
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Satoshi-Medium' !important",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          fontSize: "20px",
          color: "#FFFFFF !important",
          padding: "12px",
        },
      },
    },

    MuiSlider: {
      styleOverrides: {
        track: {
          color: "#DE14FF",
          border: "2px solid #DE14FF",
        },
        rail: {
          color: "#FFFFFF",
          boxShadow: "0px 2.307px 2.307px 0px rgba(0, 0, 0, 0.25)",
          border: "2px solid #FFFFFF",
        },
        thumb: {
          width: "25px",
          height: "25px",
          boxShadow: "none",
          color: "#FFFFFF",
          "&:hover, &.Mui-focusVisible": {
            boxShadow: "none",
          },
        },
        markLabel: {
          color: "rgba(255, 255, 255, 0.60)",
          fontWeight: 500,
          fontSize: "14px",
          left: "2%",
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: "#DE14FF",
          },
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          border: "1px solid rgba(131, 131, 131, 0.25)",
          color: "rgba(255, 255, 255, 1)",
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: 400,
          background: "rgba(25, 5, 28, 1)",

          "&.Mui-disabled": {
            color: "rgba(255, 255, 255, 1)",
          },
          "&.Mui-selected": {
            background: "rgba(255, 255, 255, 1)",
            border: "1px solid rgba(131, 131, 131, 0.25)",
            color: "rgba(38, 38, 38, 1)",
            borderRadius: "10px",
            "&:hover": {
              background: "rgba(255, 255, 255, 1)",
              border: "1px solid rgba(131, 131, 131, 0.25)",
              color: "rgba(38, 38, 38, 1)",
              borderRadius: "10px",
            },
          },
        },
      },
    },
    MuiTableHead: {
      root: {
        background: "rgba(255, 255, 255, 0.01)",
        borderTop: "1px solid #636262",
        "&:hover": {
          backgroundColor: "none",
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {},
    },
    MuiTable: {
      styleOverrides: {},
    },
    MuiTableRow: {
      root: {
        "&:last-child": {
          borderBottom: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          padding: "8px 14px",
          fontWeight: "300",
          color: "#fff",
          whiteSpace: "pre",
        },
        body: {
          color: "#fff",
          whiteSpace: "pre",
          fontSize: "12px",
        },
        root: {
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "12px !important",
          color: "#fff",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          padding: "0px",
          border: "none",
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: { color: "#222" },
        colorSecondary: {
          "&.Mui-focused": {
            color: "#222",
          },
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: "#000000",
          fontSize: "22px",
          fontWeight: "600",
          lineHeight: "33px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        inputMultiline: {
          padding: "1px !important",
        },
        root: {
          borderBottom: "none !important",
          borderRadius: "100px",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
            boxShadow: "none",
          },
          "& .Mui-disabled": {
            color: "#ffffff73 !important",
            "-webkit-text-fill-color": "#ffffff73 !important",
          },
        },
        notchedOutline: {
          background: "#19051C",
        },
        input: {
          position: "relative",
          zIndex: "9",
          color: "rgba(255, 255, 255, 0.60)",
          padding: "14px 14px",
          fontSize: "12px",
          "&:-webkit-autofill": {
            "-webkit-background-clip": "text !important",
            "caret-color": "transparent",
            "-webkit-box-shadow": "0 0 0 100px transparent inset",
            "-webkit-text-fill-color": "#fff",
          },
          "&:-internal-autofill-selected": {
            color: "#fff",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          padding: "20px",
          width: "100%",
        },
        elevation1: {
          background: "#FFF",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "none",
          border: "0.5px solid rgba(0, 0, 0, 0.25)",
        },
        elevation2: {
          position: "relative",
          zIndex: "999",
          padding: "20px",
          borderRadius: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          "@media(max-width:767px)": {
            padding: "15px !important",
          },
        },
        elevation3: {
          padding: "20px",
          background: "rgba(40, 25, 43, 1)",
          borderRadius: "20px",
          position: "relative",
          boxShadow: "0px 4px 4px 0px rgba(222, 20, 255, 0.5)",

          "@media(max-width:768px)": {
            padding: "15px",
          },
        },
        root: {
          boxShadow: "none",
          color: "#fff",

          "&.MuiAccordion-root": {
            backgroundColor: "none !important",
            background: "none !important",
          },
          "&.MuiAccordion-root.Mui-expanded:last-of-type": {
            background: "none !important",
            backgroundColor: "none !important",
          },
        },
      },
    },

    MuiPopover: {
      styleOverrides: {
        root: {
          zIndex: 99999,
        },
        paper: {
          background: "rgba(255, 255, 255, 0.03)",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          alignItems: "self-start",
        },
        gutters: {
          paddingLeft: 0,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255, 255, 255, 0.40)",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "4px",
          fontSize: "12px",
        },
        colorSecondary: {
          "&.Mui-checked": { color: "#000" },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          paddingBottom: "0",
          marginLeft: "0px",
        },
      },
    },
    MuiListItemSecondaryAction: {
      styleOverrides: {
        root: {
          right: 0,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "0px",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paperScrollPaper: {
          Width: 450,
          maxWidth: "100%",
        },
        paper: {
          borderRadius: "0px",
          background: "#28192B",
          filter: "none",
          border: "solid 3px transparent",
          backgroundImage:
            "linear-gradient(#3f2045, #3f2045), linear-gradient(rgb(222, 20, 255) 0%, rgba(52, 88, 141, 0.79) 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "content-box, border-box",
          // cursor: "pointer",
          borderRadius: "7px",
        },
        paperWidthSm: {
          maxWidth: "522px !important",
        },
        paperWidthXs: {
          maxWidth: "522px !important",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          position: "relative",
          borderBottom: "1px solid rgb(255 255 255 / 42%)",
          "&::after": {
            borderBottom: "1px solid rgb(255 255 255 / 42%)",
            left: "0",
            bottom: "0",
            content: '""',
            position: "absolute",
            right: "0",
            WebkitTransform: "scaleX(0)",
            MozTransform: "scaleX(0)",
            MsTransform: "scaleX(0)",
            transform: "scaleX(0)",
            WebkitTransition:
              "-webkit-transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
            transition: "transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
            pointerEvents: "none",
          },
        },
        input: {
          fontSize: 13,
          color: "#fff",
          padding: "7px 0",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          padding: "0px !important",
          backgroundColor: "#000", // Change the background color here
        },
        inputRoot: {
          height: "46px",
          padding: "5px",
        },
        option: {
          color: "#fff",
          fontSize: "14px !important",
          fontWeight: "400",
          lineHeight: "18px",
          letterSpacing: "0px",
          textAlign: "left",
        },
        input: {
          width: "0",
          color: "#fff",
          fontSize: "13px !important",
          fontWeight: "400",
        },
      },
    },
    MuiButton: {
      root: {
        background: "red",
        textTransform: "capitalize",
        "& .Mui-disabled": {
          color: "#fff6",
        },
      },
      "& .Mui-disabled": {
        color: "#fff6 !important",
      },
      styleOverrides: {
        containedSecondary: {
          color: "#262626",
          padding: "10px 35px",
          textTransform: "capitalize",
          fontSize: "14px",
          fontWeight: "500",
          borderRadius: "100px",
          background: "#fff",
          border: "1px solid #310438",
          whiteSpace: "pre",
          boxShadow: "none",
          fontFamily: "'Satoshi-Medium' !important",
          "&:hover": {
            color: "#fff",
            background: "rgba(255, 255, 255, 0.20)",
            border: "1px solid rgba(255, 255, 255, 0.20)",
          },
          "@media (max-width: 780px)": {
            padding: "10px 20px",
          },
        },
        containedPrimary: {
          color: "rgba(38, 38, 38, 1)",
          padding: "10px 35px",
          textTransform: "capitalize",
          fontSize: "15px",
          boxShadow: "none",
          borderRadius: "100px",
          background: "#d2d2d2",
          border: "1px solid #d2d2d2",
          whiteSpace: "pre",
          fontFamily: "'Satoshi-Medium' !important",
          "@media (max-width: 780px)": {
            padding: "7px 30px",
          },
          "&:hover": {
            boxShadow: "none",
            color: "rgba(255, 255, 255, 0.6)",
            background: "rgba(222, 20, 255, 0.17)",
            opacity: "1",
            border: "1px solid rgba(222, 20, 255, 1)",
          },
        },
        outlinedPrimary: {
          color: "rgba(255, 255, 255, 0.6)",
          padding: "10px 35px",
          textTransform: "capitalize",
          border: "1px solid rgba(222, 20, 255, 1)",
          fontSize: "15px",
          fontFamily: "'Satoshi-Medium' !important",
          boxShadow: "none",
          borderRadius: "50px",
          background: "rgba(222, 20, 255, 0.17)",
          whiteSpace: "pre",
          "&:hover": {
            boxShadow: "none",
            color: "rgba(38, 38, 38, 1)",
            background: "#d2d2d2",
            border: "1px solid #d2d2d2",

          },
        },
        outlinedSecondary: {
          color: "#161E29",
          display: "flex",
          padding: "10px 35px",
          fontSize: "14px",
          borderRadius: "50px",
          border: "1px solid #161E2926",
          background: "#fff",
          whiteSpace: "pre",
          textTransform: "capitalize",
          "&:hover": {
            color: "#fff",
            background: "#161E29",
            border: "1px solid #161E2926",
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#fff",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        list: {
          outline: "0",
          background: "rgba(255, 255, 255, 0.03)",
          boxShadow: "0px 0px 53px rgba(0, 0, 0, 0.25)",
          borderRadius: "8px",
          backdropFilter: "blur(40px)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { paddingLeft: "20px" },
      },
    },
    MuiModal: {
      styleOverrides: {
        backdrop: {
          background: "transparent !important",
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          "@media (max-width: 798px)": {
            padding: "0px !important",
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none !important",
          cursor: "pointer",
        },
      },
    },
  },
};

export const createCustomTheme = (config = {}) => {
  let theme = createTheme({ ...baseOptions, ...themeOptions });

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};
