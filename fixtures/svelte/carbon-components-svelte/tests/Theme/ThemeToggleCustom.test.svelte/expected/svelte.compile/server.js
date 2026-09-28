import * as $ from 'svelte/internal/server';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

export default function ThemeToggleCustom_test($$renderer) {
	Theme($$renderer, {
		render: 'toggle',
		toggle: {
			themes: ["g10", "g80"],
			labelA: "Enable dark mode",
			labelB: "Enable dark mode",
			hideLabel: true,
			size: "sm"
		}
	});
}