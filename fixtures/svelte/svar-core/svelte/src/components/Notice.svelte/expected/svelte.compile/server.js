import * as $ from 'svelte/internal/server';
import { fade } from "svelte/transition";

export default function Notice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { notice = {} } = $$props;

		function onRemove() {
			if (notice.remove) notice.remove();
		}

		$$renderer.push(`<div${$.attr_class(`wx-notice wx-${$.stringify(notice.type ? notice.type : '')}`, 'svelte-1y31rgg')} role="status" aria-live="polite"><div class="wx-text svelte-1y31rgg">${$.escape(notice.text)}</div> <div class="wx-button svelte-1y31rgg"><i class="wxi-close svelte-1y31rgg"></i></div></div>`);
	});
}