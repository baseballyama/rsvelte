import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

export default function ThemeToggleCustom_test($$anchor) {
	Theme($$anchor, {
		render: 'toggle',
		toggle: {
			themes: ["g10", "g80"],
			labelA: "Enable dark mode",
			labelB: "Enable dark mode",
			hideLabel: true,
			size: "sm"
		},
		$$events: {
			update: ({ detail }) => {
				console.log("update", detail);
			}
		}
	});
}