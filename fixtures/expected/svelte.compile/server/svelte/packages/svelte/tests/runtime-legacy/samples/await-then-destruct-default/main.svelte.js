import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let object = Promise.resolve({ b: 2, c: 3 });
	let array = Promise.resolve([1, 2]);
	let objectReject = Promise.reject({ b: 2, c: 3 });
	let arrayReject = Promise.reject([1, 2]);

	$.await($$renderer, object, () => {}, ({ a = 3, b = 4, c }) => {
		$$renderer.push(`<p>a: ${$.escape(a)}</p> <p>b: ${$.escape(b)}</p> <p>c: ${$.escape(c)}</p>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, array, () => {}, ([a, b, c = 3]) => {
		$$renderer.push(`<p>a: ${$.escape(a)}</p> <p>b: ${$.escape(b)}</p> <p>c: ${$.escape(c)}</p>`);
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