import * as $ from 'svelte/internal/server';
import { SvelteURLSearchParams } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let visibleExternal = false;
		let external = new SvelteURLSearchParams();

		const throws = $.derived(() => {
			external.append('foo', 'bar');

			return external;
		});

		let visibleInternal = false;

		const works = $.derived(() => {
			let internal = new SvelteURLSearchParams();

			internal.append('foo', 'bar');

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