import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import Code from '../Code.svelte';

export default function MultiCode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { examples } = $$props;

		// svelte-ignore state_referenced_locally
		let currentLabel = examples[0].label;

		let currentExample = $.derived(() => examples.find((ex) => ex.label === currentLabel));

		setContext('multi', true);
		$$renderer.push(`<div class="examples"><div class="tabs svelte-1gkbb0f"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { label } = each_array[$$index];

			$$renderer.push(`<button${$.attr_class('svelte-1gkbb0f', void 0, { 'active': currentLabel === label })}>${$.escape(label)}</button>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (currentExample()) {
			$$renderer.push('<!--[0-->');
			Code($$renderer, $.spread_props([currentExample()]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}