import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

export default function ThemeSelectCustom_test($$anchor) {
	Theme($$anchor, {
		render: 'select',
		select: {
			themes: ["white", "g90", "g100"],
			labelText: "Select a theme",
			inline: true
		},
		$$events: {
			update: ({ detail }) => {
				console.log("update", detail);
			}
		}
	});
}