import * as $ from 'svelte/internal/server';
import { C } from 'blubb';
import { B } from 'bla';
import { A } from 'bla';
import { D } from 'd';

export default function Codeactions($$renderer) {
	let a = true;

	A;
	C;

	let b = Math.random() > 0.5 ? true : false;

	abc();
	$$renderer.push(`<!---->${$.escape(abc())} `);
	Empty($$renderer, {});
	$$renderer.push(`<!----> <button></button>`);
}