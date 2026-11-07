import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let App;

	$$renderer.push(`<div class="a svelte-jiw1g0"></div> `);

	App($$renderer, {
		$$slots: {
			a: ($$renderer) => {
				$$renderer.push(`<div class="b svelte-jiw1g0" slot="a"></div>`);
			},

			b: ($$renderer) => {
				$$renderer.push(`<div class="c svelte-jiw1g0" slot="b"><div class="d svelte-jiw1g0"></div> <div class="e svelte-jiw1g0"></div></div>`);
			}
		}
	});

	$$renderer.push(`<!----> <div class="f svelte-jiw1g0"></div>`);
}