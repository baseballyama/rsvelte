import * as $ from 'svelte/internal/server';
import { getAbortSignal } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const callbacks = new Map();

		// similar semantics to setInterval, but simpler to test
		function add(fn) {
			const id = crypto.randomUUID();

			callbacks.set(id, fn);

			return id;
		}

		function remove(id) {
			callbacks.delete(id);
		}

		function run() {
			for (const fn of callbacks.values()) {
				fn();
			}
		}

		class Timer {
			#text;

			get text() {
				return this.#text();
			}

			set text($$value) {
				return this.#text($$value);
			}

			constructor(text) {
				this.elapsed = 0;
				this.#text = $.derived(() => text + ': ' + this.elapsed);
			}
		}

		let timer = $.derived(() => new Timer('hello'));
		let visible = true;

		$$renderer.push(`<button>toggle</button> <button>run</button> `);

		if (visible) {
			$$renderer.push(`<!--[0--><p>${$.escape(timer().text)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}