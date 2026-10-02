import * as $ from 'svelte/internal/server';

export default function CounterLabel($$renderer, $$props) {
	let { label = '' } = $$props;
	let count = 0;
	const text = $.derived(() => `${label} - ${count}`);

	$$renderer.push(`<button class="svelte-1yt84dg">${$.escape(text())}</button>`);
}