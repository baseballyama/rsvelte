import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let structured = {
		handler() {
			console.log('works!');
		}
	};

	if (structured) {
		$$renderer.push('<!--[0-->');

		const { handler } = structured;

		$$renderer.push(`<button>click me</button>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}