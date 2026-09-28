import * as $ from 'svelte/internal/server';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";
import { themes } from "carbon-components-svelte/Theme/Theme.svelte";

export const lightThemes = Object.keys(themes).filter((theme) => ["white", "g10"].includes(theme));

export default function ThemeSelectExported($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Theme($$renderer, {
			render: 'select',
			select: { themes: lightThemes, labelText: "Light themes" }
		});
	});
}