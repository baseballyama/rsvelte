import * as $ from 'svelte/internal/server';
import { Theme } from "carbon-components-svelte";

export default function ThemeFixture($$renderer) {
	let theme = "white";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Theme($$renderer, {
			persist: true,
			persistKey: 'e2e-theme-key',
			get theme() {
				return theme;
			},

			set theme($$value) {
				theme = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div data-testid="theme-display">${$.escape(theme)}</div> <button type="button" data-testid="set-g100">Set g100</button> <button type="button" data-testid="set-white">Set white</button>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}