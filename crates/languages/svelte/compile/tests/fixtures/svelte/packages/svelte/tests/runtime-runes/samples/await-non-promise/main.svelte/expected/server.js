import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = void 0;

	$$renderer.push(`<button>number</button> <button>nullify</button> <p>`);

	$.await(
		$$renderer,
		count,
		() => {
			$$renderer.push(`loading`);
		},
		(count) => {
			$$renderer.push(`${$.escape(count)}`);
		}
	);

	$$renderer.push(`<!--]--></p>`);
}