/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ThemeContext: () => (/* binding */ ThemeContext),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n// Create a theme context\nconst ThemeContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({\n    theme: \"system\",\n    setTheme: ()=>{},\n    toggleTheme: ()=>{}\n});\nfunction MyApp({ Component, pageProps }) {\n    const [theme, setTheme] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"system\");\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Check if there's a saved theme preference\n        const savedTheme = localStorage.getItem(\"theme\") || \"system\";\n        setTheme(savedTheme);\n        // Apply the theme to the document\n        applyTheme(savedTheme);\n        // Listen for system preference changes\n        const mediaQuery = window.matchMedia(\"(prefers-color-scheme: dark)\");\n        const handleChange = ()=>{\n            if (theme === \"system\") {\n                applyTheme(\"system\");\n            }\n        };\n        mediaQuery.addEventListener(\"change\", handleChange);\n        return ()=>mediaQuery.removeEventListener(\"change\", handleChange);\n    }, [\n        theme\n    ]);\n    const applyTheme = (currentTheme)=>{\n        const isDark = currentTheme === \"dark\" || currentTheme === \"system\" && window.matchMedia(\"(prefers-color-scheme: dark)\").matches;\n        document.documentElement.classList.toggle(\"dark-theme\", isDark);\n    };\n    const handleThemeChange = (newTheme)=>{\n        setTheme(newTheme);\n        localStorage.setItem(\"theme\", newTheme);\n        applyTheme(newTheme);\n    };\n    // Function to toggle between themes (light -> dark -> light)\n    const toggleTheme = ()=>{\n        // Only toggle between light and dark\n        const themeOrder = [\n            \"light\",\n            \"dark\"\n        ];\n        // If current theme is system, default to light when toggling\n        const effectiveTheme = theme === \"system\" ? \"light\" : theme;\n        const currentIndex = themeOrder.indexOf(effectiveTheme);\n        const nextIndex = (currentIndex + 1) % themeOrder.length;\n        const nextTheme = themeOrder[nextIndex];\n        handleThemeChange(nextTheme);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(ThemeContext.Provider, {\n        value: {\n            theme,\n            setTheme: handleThemeChange,\n            toggleTheme\n        },\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/var/www/web/Basics/pages/_app.js\",\n            lineNumber: 64,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/var/www/web/Basics/pages/_app.js\",\n        lineNumber: 63,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUEyRDtBQUM1QjtBQUUvQix5QkFBeUI7QUFDbEIsTUFBTUcsNkJBQWVELG9EQUFhQSxDQUFDO0lBQ3hDRSxPQUFPO0lBQ1BDLFVBQVUsS0FBTztJQUNqQkMsYUFBYSxLQUFPO0FBQ3RCLEdBQUc7QUFFSCxTQUFTQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ3JDLE1BQU0sQ0FBQ0wsT0FBT0MsU0FBUyxHQUFHTCwrQ0FBUUEsQ0FBQztJQUVuQ0MsZ0RBQVNBLENBQUM7UUFDUiw0Q0FBNEM7UUFDNUMsTUFBTVMsYUFBYUMsYUFBYUMsT0FBTyxDQUFDLFlBQVk7UUFDcERQLFNBQVNLO1FBRVQsa0NBQWtDO1FBQ2xDRyxXQUFXSDtRQUVYLHVDQUF1QztRQUN2QyxNQUFNSSxhQUFhQyxPQUFPQyxVQUFVLENBQUM7UUFDckMsTUFBTUMsZUFBZTtZQUNuQixJQUFJYixVQUFVLFVBQVU7Z0JBQ3RCUyxXQUFXO1lBQ2I7UUFDRjtRQUVBQyxXQUFXSSxnQkFBZ0IsQ0FBQyxVQUFVRDtRQUN0QyxPQUFPLElBQU1ILFdBQVdLLG1CQUFtQixDQUFDLFVBQVVGO0lBQ3hELEdBQUc7UUFBQ2I7S0FBTTtJQUVWLE1BQU1TLGFBQWEsQ0FBQ087UUFDbEIsTUFBTUMsU0FDSkQsaUJBQWlCLFVBQ2hCQSxpQkFBaUIsWUFBWUwsT0FBT0MsVUFBVSxDQUFDLGdDQUFnQ00sT0FBTztRQUV6RkMsU0FBU0MsZUFBZSxDQUFDQyxTQUFTLENBQUNDLE1BQU0sQ0FBQyxjQUFjTDtJQUMxRDtJQUVBLE1BQU1NLG9CQUFvQixDQUFDQztRQUN6QnZCLFNBQVN1QjtRQUNUakIsYUFBYWtCLE9BQU8sQ0FBQyxTQUFTRDtRQUM5QmYsV0FBV2U7SUFDYjtJQUVBLDZEQUE2RDtJQUM3RCxNQUFNdEIsY0FBYztRQUNsQixxQ0FBcUM7UUFDckMsTUFBTXdCLGFBQWE7WUFBQztZQUFTO1NBQU87UUFFcEMsNkRBQTZEO1FBQzdELE1BQU1DLGlCQUFpQjNCLFVBQVUsV0FBVyxVQUFVQTtRQUN0RCxNQUFNNEIsZUFBZUYsV0FBV0csT0FBTyxDQUFDRjtRQUN4QyxNQUFNRyxZQUFZLENBQUNGLGVBQWUsS0FBS0YsV0FBV0ssTUFBTTtRQUN4RCxNQUFNQyxZQUFZTixVQUFVLENBQUNJLFVBQVU7UUFFdkNQLGtCQUFrQlM7SUFDcEI7SUFFQSxxQkFDRSw4REFBQ2pDLGFBQWFrQyxRQUFRO1FBQUNDLE9BQU87WUFBRWxDO1lBQU9DLFVBQVVzQjtZQUFtQnJCO1FBQVk7a0JBQzlFLDRFQUFDRTtZQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7O0FBRzlCO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yc3MtZmVlZC12aWV3ZXIvLi9wYWdlcy9fYXBwLmpzP2UwYWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgY3JlYXRlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJztcblxuLy8gQ3JlYXRlIGEgdGhlbWUgY29udGV4dFxuZXhwb3J0IGNvbnN0IFRoZW1lQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQoe1xuICB0aGVtZTogJ3N5c3RlbScsXG4gIHNldFRoZW1lOiAoKSA9PiB7fSxcbiAgdG9nZ2xlVGhlbWU6ICgpID0+IHt9LFxufSk7XG5cbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xuICBjb25zdCBbdGhlbWUsIHNldFRoZW1lXSA9IHVzZVN0YXRlKCdzeXN0ZW0nKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgYSBzYXZlZCB0aGVtZSBwcmVmZXJlbmNlXG4gICAgY29uc3Qgc2F2ZWRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aGVtZScpIHx8ICdzeXN0ZW0nO1xuICAgIHNldFRoZW1lKHNhdmVkVGhlbWUpO1xuXG4gICAgLy8gQXBwbHkgdGhlIHRoZW1lIHRvIHRoZSBkb2N1bWVudFxuICAgIGFwcGx5VGhlbWUoc2F2ZWRUaGVtZSk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHN5c3RlbSBwcmVmZXJlbmNlIGNoYW5nZXNcbiAgICBjb25zdCBtZWRpYVF1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKTtcbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICBpZiAodGhlbWUgPT09ICdzeXN0ZW0nKSB7XG4gICAgICAgIGFwcGx5VGhlbWUoJ3N5c3RlbScpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBtZWRpYVF1ZXJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUNoYW5nZSk7XG4gICAgcmV0dXJuICgpID0+IG1lZGlhUXVlcnkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlQ2hhbmdlKTtcbiAgfSwgW3RoZW1lXSk7XG5cbiAgY29uc3QgYXBwbHlUaGVtZSA9IChjdXJyZW50VGhlbWUpID0+IHtcbiAgICBjb25zdCBpc0RhcmsgPSBcbiAgICAgIGN1cnJlbnRUaGVtZSA9PT0gJ2RhcmsnIHx8IFxuICAgICAgKGN1cnJlbnRUaGVtZSA9PT0gJ3N5c3RlbScgJiYgd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknKS5tYXRjaGVzKTtcblxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdkYXJrLXRoZW1lJywgaXNEYXJrKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVUaGVtZUNoYW5nZSA9IChuZXdUaGVtZSkgPT4ge1xuICAgIHNldFRoZW1lKG5ld1RoZW1lKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGhlbWUnLCBuZXdUaGVtZSk7XG4gICAgYXBwbHlUaGVtZShuZXdUaGVtZSk7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gdG8gdG9nZ2xlIGJldHdlZW4gdGhlbWVzIChsaWdodCAtPiBkYXJrIC0+IGxpZ2h0KVxuICBjb25zdCB0b2dnbGVUaGVtZSA9ICgpID0+IHtcbiAgICAvLyBPbmx5IHRvZ2dsZSBiZXR3ZWVuIGxpZ2h0IGFuZCBkYXJrXG4gICAgY29uc3QgdGhlbWVPcmRlciA9IFsnbGlnaHQnLCAnZGFyayddO1xuXG4gICAgLy8gSWYgY3VycmVudCB0aGVtZSBpcyBzeXN0ZW0sIGRlZmF1bHQgdG8gbGlnaHQgd2hlbiB0b2dnbGluZ1xuICAgIGNvbnN0IGVmZmVjdGl2ZVRoZW1lID0gdGhlbWUgPT09ICdzeXN0ZW0nID8gJ2xpZ2h0JyA6IHRoZW1lO1xuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHRoZW1lT3JkZXIuaW5kZXhPZihlZmZlY3RpdmVUaGVtZSk7XG4gICAgY29uc3QgbmV4dEluZGV4ID0gKGN1cnJlbnRJbmRleCArIDEpICUgdGhlbWVPcmRlci5sZW5ndGg7XG4gICAgY29uc3QgbmV4dFRoZW1lID0gdGhlbWVPcmRlcltuZXh0SW5kZXhdO1xuXG4gICAgaGFuZGxlVGhlbWVDaGFuZ2UobmV4dFRoZW1lKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxUaGVtZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgdGhlbWUsIHNldFRoZW1lOiBoYW5kbGVUaGVtZUNoYW5nZSwgdG9nZ2xlVGhlbWUgfX0+XG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgPC9UaGVtZUNvbnRleHQuUHJvdmlkZXI+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IE15QXBwO1xuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlRWZmZWN0IiwiY3JlYXRlQ29udGV4dCIsIlRoZW1lQ29udGV4dCIsInRoZW1lIiwic2V0VGhlbWUiLCJ0b2dnbGVUaGVtZSIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwic2F2ZWRUaGVtZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJhcHBseVRoZW1lIiwibWVkaWFRdWVyeSIsIndpbmRvdyIsIm1hdGNoTWVkaWEiLCJoYW5kbGVDaGFuZ2UiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImN1cnJlbnRUaGVtZSIsImlzRGFyayIsIm1hdGNoZXMiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImNsYXNzTGlzdCIsInRvZ2dsZSIsImhhbmRsZVRoZW1lQ2hhbmdlIiwibmV3VGhlbWUiLCJzZXRJdGVtIiwidGhlbWVPcmRlciIsImVmZmVjdGl2ZVRoZW1lIiwiY3VycmVudEluZGV4IiwiaW5kZXhPZiIsIm5leHRJbmRleCIsImxlbmd0aCIsIm5leHRUaGVtZSIsIlByb3ZpZGVyIiwidmFsdWUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.js"));
module.exports = __webpack_exports__;

})();