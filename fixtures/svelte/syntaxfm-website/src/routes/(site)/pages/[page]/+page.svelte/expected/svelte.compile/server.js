import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {any} data
		 */
		/** @type {Props} */
		let { data } = $$props;

		$$renderer.push(`<div>${$.html(data.props.html)}</div>`);
	});
}