import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { spread } = $$props;
	let value = ['Hello', 'World'];

	$$renderer.select({ multiple: true, value, ...spread }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`Hello`);
		});

		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`World`);
		});
	});

	$$renderer.push(` <input type="checkbox" value="Hello"${$.attr('checked', value.includes('Hello'), true)}/> <input type="checkbox" value="World"${$.attr('checked', value.includes('World'), true)}/>`);
}