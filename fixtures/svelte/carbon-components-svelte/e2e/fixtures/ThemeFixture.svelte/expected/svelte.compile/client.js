import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Theme } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="theme-display"> </div> <button type="button" data-testid="set-g100">Set g100</button> <button type="button" data-testid="set-white">Set white</button>`, 1);

export default function ThemeFixture($$anchor) {
	let theme = "white";

	Theme($$anchor, {
		persist: true,
		persistKey: 'e2e-theme-key',
		get theme() {
			return theme;
		},

		set theme($$value) {
			theme = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var text = $.only_child(div, true);
			var button = $.sibling(div, 2);
			var button_1 = $.sibling(button, 2);

			$.template_effect(() => $.set_text(text, theme));
			$.event('click', button, () => theme = "g100");
			$.event('click', button_1, () => theme = "white");
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}