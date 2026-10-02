import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let App;

	$$renderer.push(`<div class="a svelte-611nr7"></div> `);

	App($$renderer, {
		$$slots: {
			a: ($$renderer) => {
				$$renderer.push(`<div class="b svelte-611nr7" slot="a"></div>`);
			},

			b: ($$renderer) => {
				$$renderer.push(`<div class="c" slot="b"><div class="d svelte-611nr7"></div> <div class="e svelte-611nr7"></div></div>`);
			},

			c: ($$renderer) => {
				$$renderer.push(`<div class="f svelte-611nr7" slot="c"></div>`);
			}
		}
	});

	$$renderer.push(`<!----> <div class="g svelte-611nr7"></div>`);
}