import * as $ from 'svelte/internal/server';
import * as _ from 'lodash-es';

export default function LinkModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = {}, onsave } = $$props;

		$$renderer.push(`<div class="link"><div class="message">Enter URL</div> <form><input type="url"${$.attr('value', value)} autofocus=""/></form></div>`);
	});
}