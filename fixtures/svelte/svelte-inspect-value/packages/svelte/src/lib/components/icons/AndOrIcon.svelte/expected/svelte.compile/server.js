import * as $ from 'svelte/internal/server';

export default function AndOrIcon($$renderer, $$props) {
	let { mode = 'and' } = $$props;

	$$renderer.push(`<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><g fill="currentColor" stroke-width="2.5" stroke="currentColor"${$.attr_style('transform-box: fill-box', { rotate: mode === 'or' ? '180deg' : '0deg' })} transform-origin="center"><path d="M 12 8 l -4 7"></path><path d="M 12 8 l 4 7"></path></g></svg>`);
}