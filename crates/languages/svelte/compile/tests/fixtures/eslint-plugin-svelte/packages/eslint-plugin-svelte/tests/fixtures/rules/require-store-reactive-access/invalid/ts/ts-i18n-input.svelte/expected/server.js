import * as $ from 'svelte/internal/server';
import { _ } from 'svelte-i18n';

export default function Ts_i18n_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${$.escape(_('page.home.title'))}</h1>`);
	});
}