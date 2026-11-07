import * as $ from 'svelte/internal/server';

export default function Js_jsdoc_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {string} name - User name
		 * @property {number} age - User age
		 */
		const { $$slots, $$events, ...props } = $$props;

		// JSDoc is not checked, so no warning
		console.log(props.name);
	});
}