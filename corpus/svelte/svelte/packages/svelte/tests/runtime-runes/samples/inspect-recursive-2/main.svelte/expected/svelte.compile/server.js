import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class A {
			constructor() {
				this.a = this;
			}
		}

		const state = new A();

		;;

		class B {
			constructor() {
				this.a = { b: this };
			}
		}

		const state2 = new B();

		;;
	});
}