import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Theme } from "carbon-components-svelte";

export default function ThemeDropdownCustom($$anchor) {
	Theme($$anchor, {
		render: 'dropdown',
		dropdown: {
			themes: ["white", "g90", "g100"],
			labelText: "Select a theme",
			type: "inline"
		}
	});
}