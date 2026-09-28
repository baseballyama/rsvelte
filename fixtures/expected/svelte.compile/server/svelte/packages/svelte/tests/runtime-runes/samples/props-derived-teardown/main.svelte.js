import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';
import Teardown from './Teardown.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Test {
			originalIds = [1, 2, 3];
			#ids = $.derived(() => new SvelteSet(this.originalIds));

			get ids() {
				return this.#ids();
			}

			set ids($$value) {
				return this.#ids($$value);
			}
		}

		let show = true;
		const test = new Test();

		function callback() {
			test.ids.delete(2);
		}

		$$renderer.push(`<button>click</button> `);

		if (show) {
			$$renderer.push('<!--[0-->');
			Teardown($$renderer, { callback });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(test.ids);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let id = each_array[$$index];

			$$renderer.push(`<div>${$.escape(id)}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}