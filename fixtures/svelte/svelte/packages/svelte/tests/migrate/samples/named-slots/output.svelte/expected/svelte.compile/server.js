import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Output($$renderer, $$props) {
	let { children } = $$props;

	{
		function msg($$renderer) {
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		Component($$renderer, { msg, $$slots: { msg: true } });
	}
}