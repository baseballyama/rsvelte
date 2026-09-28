import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function fade(_) {
			return { duration: 500, css: (t) => `opacity: ${t}` };
		}

		let toggle = true;
		let items = [1, 2, 3];

		const handle_toggle = async () => {
			toggle = false;
			await Promise.resolve();
			items = [3, 4];
			toggle = true;
		};

		$$renderer.push(`<button>Toggle</button> `);

		if (toggle) {
			$$renderer.push(`<!--[0--><div><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<!---->${$.escape((() => {})())} <div>${$.escape(item)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}