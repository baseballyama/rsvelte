import * as $ from 'svelte/internal/server';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { error } = $$props;

		$$renderer.push(`<p id="layout-throws-error-message">Sibling error page (should not render): ${$.escape(error.message)}</p>`);
	});
}