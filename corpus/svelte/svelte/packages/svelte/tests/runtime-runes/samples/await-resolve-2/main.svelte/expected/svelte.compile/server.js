import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const promise_a = Promise.resolve('a');
		const promise_b = Promise.resolve('b');
		const promise_c = Promise.resolve('c');
		const promise_d = new Promise(() => {});
		let current_promise = promise_a;

		$.await(
			$$renderer,
			current_promise,
			() => {
				$$renderer.push(`${$.escape(console.log('pending'))}`);
			},
			(value) => {
				$$renderer.push(`${$.escape(console.log(value))}`);
			}
		);

		$$renderer.push(`<!--]--> <button>Show Promise A</button> <button>Show Promise B</button> <button>Show Promise C</button> <button>Show Promise D</button>`);
	});
}