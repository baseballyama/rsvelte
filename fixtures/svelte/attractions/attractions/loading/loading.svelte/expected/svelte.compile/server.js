import * as $ from 'svelte/internal/server';
import classes from '../utils/classes.js';

export default function Loading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let _class = null;

		$$renderer.push(`<div${$.attr_class($.clsx(
			/** @type {string | false | null} */ (
			classes('spinner', _class))
		))}><div class="bounce1"></div> <div class="bounce2"></div> <div class="bounce3"></div></div>`);

		$.bind_props($$props, { class: _class });
	});
}