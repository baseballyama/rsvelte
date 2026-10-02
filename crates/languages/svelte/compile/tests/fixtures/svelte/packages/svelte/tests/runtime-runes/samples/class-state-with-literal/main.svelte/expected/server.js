import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Toggle {
			"aria-pressed" = false;

			toggle() {
				this["aria-pressed"] = !this["aria-pressed"];
			}
		}

		const toggle = new Toggle();

		$$renderer.push(`<button>${$.escape(toggle["aria-pressed"])}</button>`);
	});
}