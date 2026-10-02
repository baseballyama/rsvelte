import * as $ from 'svelte/internal/server';
import Nested from "./Nested.svelte";

export default function Main($$renderer) {
	let c = 0;
	let d = 0;
	let e = 0;

	$$renderer.push(`<div>`);

	Nested($$renderer, {
		props: ['hello', 'world'],
		$$slots: {
			main: ($$renderer, { value: pair, data: foo }) => {
				{
					$$renderer.push(`${$.escape(pair[0])} ${$.escape(pair[1])} ${$.escape(c)} ${$.escape(foo)}`);
				}
			}
		}
	});

	$$renderer.push(`<!----> <button>Increment</button></div> <div>`);

	Nested($$renderer, {
		props: ['hello', 'world'],
		$$slots: {
			main: ($$renderer, { value: [a, b], data: foo }) => {
				{
					$$renderer.push(`${$.escape(a)} ${$.escape(b)} ${$.escape(d)} ${$.escape(foo)}`);
				}
			}
		}
	});

	$$renderer.push(`<!----> <button>Increment</button></div> <div>`);

	Nested($$renderer, {
		props: { a: 'hello', b: 'world' },
		$$slots: {
			main: ($$renderer, { value: { a, b }, data: foo }) => {
				{
					$$renderer.push(`${$.escape(a)} ${$.escape(b)} ${$.escape(e)} ${$.escape(foo)}`);
				}
			}
		}
	});

	$$renderer.push(`<!----> <button>Increment</button></div>`);
}