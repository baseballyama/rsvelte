import * as $ from 'svelte/internal/server';

export default function Customize($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<h2 class="demo-title-extra">Customize</h2> <div class="preview-options">`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}