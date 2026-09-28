import * as $ from 'svelte/internal/server';

export default function ReplayButton($$renderer, $$props) {
	let { onClick, label = 'Replay animation' } = $$props;

	$$renderer.push(`<button type="button" class="replay-button svelte-9y2dqi"${$.attr('aria-label', label)}${$.attr('title', label)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg></button>`);
}