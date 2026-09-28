import * as $ from 'svelte/internal/server';
import A from './A.svelte';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let i = 'i';
		let k = writable('k');
		let l = 'l';
		let n = writable('n');
		let a = 'a';
		let c = writable('c');
		let d = 'd';
		let f = writable('f');

		function update() {
			i = 'ii';
			k = writable('kk');
			l = 'll';
			n = writable('nn');
			a = 'aa';
			c = writable('cc');
			d = 'dd';
			f = writable('ff');
		}

		A($$renderer, {});
		$$renderer.push(`<!----> <br/> `);
		A($$renderer, { i, k, l, n, a, c, d, f });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { update });
	});
}