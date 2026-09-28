import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let test = { a: new Date() };
		let test2 = test;
		let test3 = { a: new Date() };
		let test4 = structuredClone(test3);

		$$renderer.push(`<!---->${$.escape(test.a instanceof Date)}
${$.escape(test2.a instanceof Date)}
${$.escape(test3.a instanceof Date)}
${$.escape(test4.a instanceof Date)}`);
	});
}