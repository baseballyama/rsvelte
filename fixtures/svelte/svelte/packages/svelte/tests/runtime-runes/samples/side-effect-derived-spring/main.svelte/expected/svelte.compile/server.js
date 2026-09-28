import * as $ from 'svelte/internal/server';
import { Spring } from 'svelte/motion';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let outside_basic = false;
		let outside_basic_spring = new Spring(0);

		const throws_basic = $.derived(() => {
			outside_basic_spring.set(1);

			return outside_basic_spring;
		});

		let inside_basic = false;

		const works_basic = $.derived(() => {
			let internal = new Spring(0);

			internal.set(1);

			return internal;
		});

		$$renderer.push(`<button>external</button> `);

		if (outside_basic) {
			$$renderer.push(`<!--[0-->${$.escape(throws_basic())}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button>internal</button> `);

		if (inside_basic) {
			$$renderer.push(`<!--[0-->${$.escape(works_basic())}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}