import * as $ from 'svelte/internal/server';

export default function Performance($$renderer, $$props) {
	function aFunction(param) {
		param += 1; // should error

		const foo = subFunction();

		function subFunction() {
			return param ? 1 : 2;
		}
	}

	function handleClick(e) {
		aFunction(true); // should error

		const foo = 'bar';
	}

	$$renderer.push(`<div><p>lorem ipsum</p> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div> `);

	NonExistentComponent($$renderer, {
		propA: 1,
		children: ($$renderer) => {
			$$renderer.push(`<p>Inner Content</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}