import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const a = Promise.resolve('a');
	const b = Promise.resolve('b');
	let promise = a;

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`${$.escape(console.log('rendering pending block'))} <p>pending</p>`);
		},
		(value) => {
			$$renderer.push(`${$.escape(console.log('rendering then block'))} <p>then ${$.escape(value)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> <button>Show Promise A</button> <button>Show Promise B</button>`);
}