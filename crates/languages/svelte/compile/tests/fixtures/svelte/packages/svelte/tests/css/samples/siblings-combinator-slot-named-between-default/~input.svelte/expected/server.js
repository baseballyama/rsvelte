import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Input($$renderer) {
	Child($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="a svelte-na6urp">a</div> <div class="c svelte-na6urp">c</div>`);
		},

		$$slots: {
			default: true,
			wut: ($$renderer) => {
				$$renderer.push(`<div class="b" slot="wut">b</div>`);
			}
		}
	});
}