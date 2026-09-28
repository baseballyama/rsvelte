import * as $ from 'svelte/internal/server';

export default function HintBadge($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="hint-badge svelte-mt12lf">`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}