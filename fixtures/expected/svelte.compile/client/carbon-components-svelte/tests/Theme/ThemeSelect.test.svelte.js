import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

export default function ThemeSelect_test($$anchor) {
	Theme($$anchor, {
		render: 'select',
		$$events: {
			update: ({ detail }) => {
				console.log("update", detail);
			}
		}
	});
}