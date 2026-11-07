import * as $ from 'svelte/internal/server';
import { Theme } from "carbon-components-svelte";

export default function ThemeSelectCustom($$renderer) {
	Theme($$renderer, {
		render: 'select',
		select: {
			themes: ["white", "g90", "g100"],
			labelText: "Select a theme",
			inline: true
		}
	});
}