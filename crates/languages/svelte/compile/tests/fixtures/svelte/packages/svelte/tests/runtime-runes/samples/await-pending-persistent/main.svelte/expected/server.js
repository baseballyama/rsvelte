import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const a = new Promise(() => {});
		const b = new Promise(() => {});
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
	});
}