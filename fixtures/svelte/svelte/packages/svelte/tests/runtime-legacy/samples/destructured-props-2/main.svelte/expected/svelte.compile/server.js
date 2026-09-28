import * as $ from 'svelte/internal/server';
import A from './A.svelte';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let x = 'x';
		let list_two_a = 'list_two_a';
		let list_two_b = 'list_two_b';
		let y = writable('y');
		let m = 'm';
		let n = 'n';
		let o = 'o';
		let p = 'p';
		let q = writable('q');

		function update() {
			x = 'XX';
			list_two_a = 'LIST_TWO_A';
			list_two_b = 'LIST_TWO_B';
			y = writable('YY');
			m = 'MM';
			n = 'NN';
			o = 'OO';
			p = 'PP';
			q = writable('QQ');
		}

		A($$renderer, {});
		$$renderer.push(`<!----> <br/> `);
		A($$renderer, { x, list_two_a, list_two_b, y, m, n, o, p, q });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { update });
	});
}