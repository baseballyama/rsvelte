import * as $ from 'svelte/internal/server';

export default function CloseCircleButton($$renderer, $$props) {
	let { onclick } = $$props;

	$$renderer.push(`<svg id="close" viewBox="0 0 12 12" class="svelte-cugtz2"><circle cx="6" cy="6" r="6"></circle><line x1="3" y1="3" x2="9" y2="9" class="svelte-cugtz2"></line><line x1="9" y1="3" x2="3" y2="9" class="svelte-cugtz2"></line></svg>`);
}