import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const { handler } = $$props;
	let show = true;

	$$renderer.push(`<button>show/hide</button> `);

	if (show) {
		$$renderer.push(`<!--[0--><video></video>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}