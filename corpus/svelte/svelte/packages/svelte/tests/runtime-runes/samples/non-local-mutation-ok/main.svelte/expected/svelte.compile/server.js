import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class X {
			y = 1;
		}

		const klass = new X();
		let y = 1;

		const getter_setter = {
			get y() {
				return y;
			},

			set y(value) {
				y = value;
			}
		};

		Child($$renderer, { klass, getter_setter });
	});
}