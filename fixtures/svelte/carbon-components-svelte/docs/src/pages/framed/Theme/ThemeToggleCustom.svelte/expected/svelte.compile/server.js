import * as $ from 'svelte/internal/server';
import { Theme } from "carbon-components-svelte";

export default function ThemeToggleCustom($$renderer) {
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