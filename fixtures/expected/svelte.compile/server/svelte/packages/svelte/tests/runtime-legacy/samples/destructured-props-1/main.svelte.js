import * as $ from 'svelte/internal/server';
import A from './A.svelte';

export default function Main($$renderer) {
	A($$renderer, {});
	$$renderer.push(`<!----> <br/> `);

	A($$renderer, {
		a: 'a',
		d_one: 'd_one',
		list_one: 'list_one',
		f: 'f',
		list_two_b: 'list_two_b',
		g: 'g',
		A: 'A',
		C: 'C'
	});

	$$renderer.push(`<!---->`);
}