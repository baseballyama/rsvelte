import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function fly(node, params) {
		return {};
	}

	let show = false;
	let sidebar = void 0;

	$$renderer.push(`<button>toggle</button> `);

	if (show) {
		$$renderer.push(`<!--[0--><nav>hello</nav>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}