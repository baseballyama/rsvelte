import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class A {
		constructor() {
			this.a = this;
		}
	}

	const state = $.proxy(new A());

	;;

	class B {
		constructor() {
			this.a = { b: this };
		}
	}

	const state2 = $.proxy(new B());

	;;
	$.pop();
}