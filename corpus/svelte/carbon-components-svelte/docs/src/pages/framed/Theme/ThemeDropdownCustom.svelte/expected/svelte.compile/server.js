import * as $ from 'svelte/internal/server';
import { Theme } from "carbon-components-svelte";

export default function ThemeDropdownCustom($$renderer) {
	Theme($$renderer, {
		render: 'dropdown',
		dropdown: {
			themes: ["white", "g90", "g100"],
			labelText: "Select a theme",
			type: "inline"
		}
	});
}