import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	let { double } = $$props;

	double; // derived is first read outside an active_reaction
	$$renderer.push(`<p>${$.escape(double)}</p>`);
}