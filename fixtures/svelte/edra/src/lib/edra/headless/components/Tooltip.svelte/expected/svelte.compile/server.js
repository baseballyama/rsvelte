import * as $ from 'svelte/internal/server';

export default function Tooltip($$renderer, $$props) {
	const { tooltip, children, shortCut } = $$props;

	$$renderer.push(`<span${$.attr('data-tooltip', shortCut ? `${tooltip} (${shortCut})` : tooltip)} class="relative inline-block">`);
	children($$renderer);
	$$renderer.push(`<!----></span>`);
}