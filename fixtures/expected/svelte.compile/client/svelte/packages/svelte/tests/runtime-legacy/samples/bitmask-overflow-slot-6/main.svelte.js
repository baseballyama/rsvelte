import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slotted from './Slotted.svelte';

var root = $.from_html(`<button slot="target"> </button>`);
var root_1 = $.from_html(`<div slot="content">Open</div>`);
var root_2 = $.from_html(`<!> <button>Toggle outside</button>`, 1);

export default function Main($$anchor) {
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

	var fragment = root_2();
	var node = $.first_child(fragment);

	Slotted(node, {
		$$slots: {
			target: ($$anchor, $$slotProps) => {
				var button = root();
				var text = $.only_child(button);

				$.template_effect(() => $.set_text(text, `Toggle inside ${last ?? ''}`));
				$.append($$anchor, button);
			},

			content: ($$anchor, $$slotProps) => {
				var div = root_1();

				$.append($$anchor, div);
			}
		}
	});

	var button_1 = $.sibling(node, 2);

	$.event('click', button_1, toggle);
	$.append($$anchor, fragment);
}