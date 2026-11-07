import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function listen(node) {
		function handler() {
			count++;
		}

		node.addEventListener("click", handler);

		return {
			destroy() {
				node.removeEventListener("click", handler);
			}
		};
	}

	$$renderer.push(`<button></button> `);

	$.await($$renderer, Promise.resolve(), () => {}, () => {
		$$renderer.push(`${$.escape(err.or)}`);
	});

	$$renderer.push(`<!--]-->`);
}