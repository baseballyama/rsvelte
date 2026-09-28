import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class X {
		#y = $.state(1);

		get y() {
			return $.get(this.#y);
		}

		set y(value) {
			$.set(this.#y, value, true);
		}
	}

	const klass = new X();
	let y = $.state(1);

	const getter_setter = {
		get y() {
			return $.get(y);
		},

		set y(value) {
			$.set(y, value, true);
		}
	};

	Child($$anchor, {
		get klass() {
			return klass;
		},

		get getter_setter() {
			return getter_setter;
		}
	});

	$.pop();
}