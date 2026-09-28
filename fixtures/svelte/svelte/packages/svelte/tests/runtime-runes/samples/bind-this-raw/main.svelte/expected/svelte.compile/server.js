import * as $ from 'svelte/internal/server';
import ComponentA from './ComponentA.svelte';
import ComponentB from './ComponentB.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let type = ComponentA;
		let elem = void 0;

		$$renderer.push(`<button>a</button> <button>b</button> `);

		if (type) {
			$$renderer.push('<!--[-->');

			type($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Content`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}