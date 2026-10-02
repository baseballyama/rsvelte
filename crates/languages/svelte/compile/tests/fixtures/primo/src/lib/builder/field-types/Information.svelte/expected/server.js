import * as $ from 'svelte/internal/server';
import { convert_markdown_to_html } from '../utils';

export default function Information($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field = { config: { info: '' } } } = $$props;
		let html = $.derived(() => convert_markdown_to_html(field.config?.info || ''));

		$$renderer.push(`<div class="main info-field svelte-1oatjoc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="svelte-1oatjoc"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg> ${$.html(html())}</div>`);
	});
}