const autoprefixer = require('autoprefixer');
const postcssNesting = require('postcss-nesting');
const postcssNormalize = require('postcss-normalize')
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');
const postcssImport = require("postcss-import");
const colorFunction = require("postcss-color-function")
const flexbugs = require('postcss-flexbugs-fixes');
const easingGadients = require('postcss-easing-gradients');
// const colorguard = require('colorguard');

const config = {
	plugins: [
		postcssImport,

		postcssNesting,

		// Apply modern CSS features with fallbacks
		postcssPresetEnv,

		// Normalize CSS
		postcssNormalize,

		colorFunction,

		easingGadients,

		// Flexbox bug fixes
		flexbugs,

		// Add vendor prefixes
		autoprefixer,

		// Check for color clashes. To use colorguard: run "npx colorguard styles.css". This will output a report showing any color clashes and suggestions for alternative colors.
		// usage as postcss plugin has inferior reporting. That's why we disable it by default:
		// colorguard,

		// minimize css
		// @CSS BUGs: in case of unexpected CSS behaviour disable this.
		cssnano({
			preset: ['default', {
				discardComments: { removeAll: true },
			}]
		}),
	]
};

module.exports = config;
