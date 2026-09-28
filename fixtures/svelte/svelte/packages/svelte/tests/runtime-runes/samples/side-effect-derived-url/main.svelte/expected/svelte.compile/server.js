import * as $ from 'svelte/internal/server';
import { SvelteURL } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let visibleExternal = false;
		let external = new SvelteURL('https://svelte.dev');

		const throws = $.derived(() => {
			external.host = 'kit.svelte.dev';

			return external;
		});

		let visibleInternal = false;

		const works = $.derived(() => {
			let internal = new SvelteURL('https://svelte.dev');

			internal.host = 'kit.svelte.dev';

			return internal;
		});

		$$renderer.push(`<button>external</button> `);

		if (visibleExternal) {
			$$renderer.push(`<!--[0-->${$.escape(throws())}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button>internal</button> `);

		if (visibleInternal) {
			$$renderer.push(`<!--[0-->${$.escape(works())}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}