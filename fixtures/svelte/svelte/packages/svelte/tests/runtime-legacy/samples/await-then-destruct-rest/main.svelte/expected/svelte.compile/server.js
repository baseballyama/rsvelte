import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let object = Promise.resolve({ a: 1, b: 2, c: 3 });
	let array = Promise.resolve([1, 2, 3, 4, 5, 6]);
	let objectReject = Promise.reject({ a: 1, b: 2, c: 3 });
	let arrayReject = Promise.reject([1, 2, 3, 4, 5, 6]);

	$.await($$renderer, object, () => {}, ({ a, ...rest }) => {
		$$renderer.push(`<p>a: ${$.escape(a)}</p> <p>rest: ${$.escape(JSON.stringify(rest))}</p>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, array, () => {}, ([a, b, ...rest]) => {
		$$renderer.push(`<p>a: ${$.escape(a)}</p> <p>b: ${$.escape(b)}</p> <p>rest: ${$.escape(JSON.stringify(rest))}</p>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, objectReject, () => {}, (value) => {
		$$renderer.push(`resolved`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, arrayReject, () => {}, (value) => {
		$$renderer.push(`resolved`);
	});

	$$renderer.push(`<!--]-->`);
}