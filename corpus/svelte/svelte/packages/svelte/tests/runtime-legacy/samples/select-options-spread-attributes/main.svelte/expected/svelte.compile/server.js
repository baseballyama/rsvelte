import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<select>`);

	$$renderer.option({ ...{ value: 'value', class: 'option' } }, ($$renderer) => {
		$$renderer.push(`Label`);
	});

	$$renderer.push(`</select>`);
}