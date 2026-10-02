import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let eid = 1;
	let foo;
	let employees = [{ id: eid = foo = 2, name: 'xxx' }];

	$$renderer.push(`<h1>${$.escape(foo)} ${$.escape(eid)}</h1>`);
}