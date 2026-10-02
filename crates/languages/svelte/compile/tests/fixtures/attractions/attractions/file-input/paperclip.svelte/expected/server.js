import * as $ from 'svelte/internal/server';
import classes from '../utils/classes.js';

export default function Paperclip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let _class = null;

		$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${$.attr_class($.clsx(
			/** @type {string | false | null} */ (
			classes(_class))
		))}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`);

		$.bind_props($$props, { class: _class });
	});
}