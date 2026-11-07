import * as $ from 'svelte/internal/server';
import Item from './Item.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { n = 0 } = $$props;

		function logRender() {
			console.log(`parent: render ${n}`);

			return 'parent';
		}

		$$renderer.push(`<!---->${$.escape(logRender())} <ul><!--[-->`);

		const each_array = $.ensure_array_like([1, 2, 3]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let index = each_array[$$index];

			Item($$renderer, { index, n });
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}