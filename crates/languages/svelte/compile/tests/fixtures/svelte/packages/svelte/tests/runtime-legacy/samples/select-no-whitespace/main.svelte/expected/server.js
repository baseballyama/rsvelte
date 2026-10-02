import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<select>`);

	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`a`);
	});

	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`b`);
	});

	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`c`);
	});

	$$renderer.push(`</select>`);
}