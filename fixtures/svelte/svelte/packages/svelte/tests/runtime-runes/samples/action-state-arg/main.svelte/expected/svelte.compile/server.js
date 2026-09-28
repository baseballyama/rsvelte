import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = { count: 0 };
	let count = 0;

	function action() {
		return {
			update(foo) {
				count = foo.count;
			}
		};
	}

	$$renderer.push(`<button>mutate</button> <button>reassign</button> <div>${$.escape(count)}</div>`);
}