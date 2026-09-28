import * as $ from 'svelte/internal/server';
import Slotted from './Slotted.svelte';

export default function Main($$renderer) {
	let lotsOfNumbers = Array.from({ length: 50 }, () => 1);

	let [
		a,
		b,
		c,
		d,
		e,
		f,
		g,
		h,
		i,
		j,
		k,
		l,
		m,
		n,
		o,
		p,
		q,
		r,
		s,
		t,
		u,
		v,
		w,
		x,
		y,
		z,
		aa,
		ab,
		ac,
		ad,
		ae,
		af,
		ag,
		ah
	] = lotsOfNumbers;

	let last = 1;

	function toggle() {
		last = 2;
	}

	Slotted($$renderer, {
		$$slots: {
			target: ($$renderer) => {
				$$renderer.push(`<button slot="target">Toggle inside ${$.escape(last)}</button>`);
			},

			content: ($$renderer) => {
				$$renderer.push(`<div slot="content">Open</div>`);
			}
		}
	});

	$$renderer.push(`<!----> <button>Toggle outside</button>`);
}