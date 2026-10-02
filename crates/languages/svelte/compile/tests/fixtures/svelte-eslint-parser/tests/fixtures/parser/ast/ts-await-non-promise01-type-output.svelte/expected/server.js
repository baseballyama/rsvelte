import * as $ from 'svelte/internal/server';

export default function Ts_await_non_promise01_type_output($$renderer) {
	const str = 'abc'; // str: "abc", const: /*unresolved*/ any

	$.await($$renderer, 1234, () => {}, (number) => {
		$$renderer.push(`<p>The number is ${$.escape(number)}</p>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, str, () => {}, (s) => {
		$$renderer.push(`<p>The string is ${$.escape(s)}</p>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, str.slice(0), () => {}, (s) => {
		$$renderer.push(`<p>The string is ${$.escape(s)}</p>`);
	});

	$$renderer.push(`<!--]-->`);
}