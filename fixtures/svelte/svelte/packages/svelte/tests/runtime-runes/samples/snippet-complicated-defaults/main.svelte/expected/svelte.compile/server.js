import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function box(value) {
		let state = value;

		return {
			get value() {
				return state;
			},

			set value(v) {
				state = v;
			}
		};
	}

	let count = box(0);
	let fallback_count = box(0);
	let toggle_state = false;

	function counter($$renderer, c = count) {
		$$renderer.push(`<p id="count">Count: ${$.escape(count.value)}</p> <p id="fallback-count">Fallback count: ${$.escape(fallback_count.value)}</p> <button id="increment">Click to change referenced state value</button> <button id="change-ref">Click to change state reference</button>`);
	}

	counter($$renderer, toggle_state ? fallback_count : undefined);
}