import * as $ from 'svelte/internal/server';
import A from './A.svelte';

export default function Main($$renderer, $$props) {
	let a;
	let b;

	function getA() {
		return a.getData();
	}

	function getB() {
		return b.getData();
	}

	A($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span>bye</span> <span>world</span>`);
		},

		$$slots: {
			default: true,
			a: ($$renderer) => {
				$$renderer.push(`<span slot="a">hello world</span>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	A($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span>bye world</span>`);
		},

		$$slots: {
			default: true,
			a: ($$renderer) => {
				$$renderer.push(`<span slot="a">hello world</span>`);
			},

			b: ($$renderer) => {
				$$renderer.push(`<span slot="b">hello world</span>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
	$.bind_props($$props, { getA, getB });
}