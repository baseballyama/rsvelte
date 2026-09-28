import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Foo {
			value = 0;
			#double = $.derived(() => this.value * 2);

			get double() {
				return this.#double();
			}

			set double($$value) {
				return this.#double($$value);
			}

			constructor() {
				console.log(this.value, this.double);
			}

			increment() {
				this.value++;
			}
		}

		let foo = void 0;
		let bar = $.derived(() => new Foo());

		$$renderer.push(`<button>increment</button> `);

		if (foo) {
			$$renderer.push(`<!--[0--><p>${$.escape(foo.value)}/${$.escape(foo.double)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <p>${$.escape(bar().value)}/${$.escape(bar().double)}</p>`);
	});
}