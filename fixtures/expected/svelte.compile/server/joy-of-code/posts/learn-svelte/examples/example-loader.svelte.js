import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Example_loader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name } = $$props;
		let status = 'load';
		let Component = null;

		// @ts-ignore
		const modules = import.meta.glob('./*.svelte');

		async function load() {
			const module = modules[`./${name}.svelte`];

			if (module) {
				Component = (await module()).default;
				status = 'loaded';
			} else {
				console.error(`${name}.svelte not found`);
			}
		}

		$.head('14xmduv', $$renderer, ($$renderer) => {
			$$renderer.push(`<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>`);
			$$renderer.push(` `);
			$$renderer.push(`<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js"></script>`);
		});

		$$renderer.push(`<div class="example svelte-14xmduv">`);

		if (status === 'load') {
			$$renderer.push(`<!--[0--><div class="container"><button>Show example</button></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="content svelte-14xmduv">`);

			if (Component) {
				$$renderer.push('<!--[-->');
				Component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}