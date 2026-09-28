import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let nonreactive = undefined;
	let reactive = void 0;
	let nonreactive_spread = { value: undefined };
	let reactive_spread = { value: undefined };

	$$renderer.push(`<select>`);

	$$renderer.option({ value: undefined }, ($$renderer) => {
		$$renderer.push(`Default`);
	});

	$$renderer.push(`</select> <select>`);

	$$renderer.option({ value: nonreactive }, ($$renderer) => {
		$$renderer.push(`Default`);
	});

	$$renderer.push(`</select> <select>`);

	$$renderer.option({ value: reactive }, ($$renderer) => {
		$$renderer.push(`Default`);
	});

	$$renderer.push(`</select> <select>`);

	$$renderer.option({ ...nonreactive_spread }, ($$renderer) => {
		$$renderer.push(`Default`);
	});

	$$renderer.push(`</select> <select>`);

	$$renderer.option({ ...reactive_spread }, ($$renderer) => {
		$$renderer.push(`Default`);
	});

	$$renderer.push(`</select>`);
}