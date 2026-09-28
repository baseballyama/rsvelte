import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let visible = false;

	function foo() {
		return {
			duration: 100,
			css: (t) => {
				return `scale: ${t}`;
			},

			tick: (t) => {
				console.log(`tick: ${t}`);
			}
		};
	}

	$$renderer.push(`<button>toggle</button> `);

	if (visible) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}