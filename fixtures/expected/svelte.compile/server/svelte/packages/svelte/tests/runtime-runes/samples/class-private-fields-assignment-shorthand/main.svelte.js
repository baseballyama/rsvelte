import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			#a;
			#b = { val: -1 };
			#c;

			constructor() {
				this.#a ||= { val: 0 };
				this.#b &&= { val: 0 };
				this.#c ??= { val: 0 };
			}

			inc() {
				this.#a.val += 1;
				this.#b.val += 2;
				this.#c.val += 3;
			}

			get a() {
				return this.#a?.val;
			}

			get b() {
				return this.#b?.val;
			}

			get c() {
				return this.#c?.val;
			}
		}

		let counter = new Counter();

		$$renderer.push(`<button>inc</button> <!---->`);

		{
			$$renderer.push(`<p>a:${$.escape(counter.a)}</p>`);
		}

		$$renderer.push(`<!----> <!---->`);

		{
			$$renderer.push(`<p>b:${$.escape(counter.b)}</p>`);
		}

		$$renderer.push(`<!----> <!---->`);

		{
			$$renderer.push(`<p>c:${$.escape(counter.c)}</p>`);
		}

		$$renderer.push(`<!---->`);
	});
}