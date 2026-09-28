import 'svelte/internal/disclose-version';
import { themes } from "carbon-components-svelte/Theme/Theme.svelte";
import * as $ from 'svelte/internal/client';
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

export const lightThemes = Object.keys(themes).filter((theme) => ["white", "g10"].includes(theme));

export default function ThemeSelectExported($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => ({ themes: lightThemes, labelText: "Light themes" }));

		Theme($$anchor, {
			render: 'select',
			get select() {
				return $.get($0);
			},

			$$events: {
				update: ({ detail }) => {
					console.log("update", detail);
				}
			}
		});
	}

	$.pop();
}