import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Foo {
			a = 0;
			#c = $.derived(() => this.b * 2);

			get c() {
				return this.#c();
			}

			set c($$value) {
				return this.#c($$value);
			}

			#b = $.derived(() => this.a * 2);

			get b() {
				return this.#b();
			}

			set b($$value) {
				return this.#b($$value);
			}

			constructor(a) {
				this.a = a;
			}
		}

		const foo = new Foo(1);

		$$renderer.push(`<p>a ${$.escape(foo.a)}</p> <p>b ${$.escape(foo.b)}</p> <p>c ${$.escape(foo.c)}</p>`);
	});
}