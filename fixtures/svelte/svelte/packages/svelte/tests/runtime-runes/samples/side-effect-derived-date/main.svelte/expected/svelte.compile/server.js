import * as $ from 'svelte/internal/server';
import { SvelteDate } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let visibleExternal = false;
		let external = new SvelteDate();

		const throws = $.derived(() => {
			external.setTime(12345);

			return external;
		});

		let visibleInternal = false;

		const works = $.derived(() => {
			let internal = new SvelteDate();

			internal.setTime(12345);

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