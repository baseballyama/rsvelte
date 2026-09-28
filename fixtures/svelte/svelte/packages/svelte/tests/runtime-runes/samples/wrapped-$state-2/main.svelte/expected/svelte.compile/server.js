import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function createReactive(obj) {
		const reactive = {};

		for (const key of Object.keys(obj)) {
			let inner = obj[key];

			Object.defineProperty(reactive, key, {
				get() {
					return inner;
				},

				set(update) {
					inner = update;
				},
				enumerable: true
			});
		}

		return reactive;
	}

	const a = createReactive({ x: 'foo' });

	$$renderer.push(`<button>${$.escape(a.x)}</button>`);
}