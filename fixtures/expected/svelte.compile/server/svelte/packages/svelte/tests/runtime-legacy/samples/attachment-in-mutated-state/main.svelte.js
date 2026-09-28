import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let state = {
		count: 0,
		attachment() {
			console.log('up');

			return () => console.log('down');
		}
	};

	$$renderer.push(`<button>${$.escape(state.count)}</button> `);

	if (state.count < 2) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}