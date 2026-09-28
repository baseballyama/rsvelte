import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Input($$renderer) {
	$$renderer.push(`<div><x class="svelte-1rwx1av"></x> `);

	{
		function foo($$renderer) {
			$$renderer.push(`<v class="svelte-1rwx1av"></v>`);
		}

		Child($$renderer, {
			foo,
			children: ($$renderer) => {
				$$renderer.push(`<y class="svelte-1rwx1av"></y>`);
			},
			$$slots: { foo: true, default: true }
		});
	}

	$$renderer.push(`<!----> <z class="svelte-1rwx1av"></z> `);

	{
		function foo($$renderer) {
			$$renderer.push(`<span><n></n></span>`);
		}

		Child($$renderer, {
			foo,
			children: ($$renderer) => {
				$$renderer.push(`<span><n></n></span>`);
			},
			$$slots: { foo: true, default: true }
		});
	}

	$$renderer.push(`<!----> <m></m></div>`);
}