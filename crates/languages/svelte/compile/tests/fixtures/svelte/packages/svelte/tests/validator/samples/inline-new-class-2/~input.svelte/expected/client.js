import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	function bar() {
		class Foo {
			#foo = $.state(0);

			get foo() {
				return $.get(this.#foo);
			}

			set foo(value) {
				$.set(this.#foo, value, true);
			}
		}

		const a = new Foo();
	}

	$.pop();
}