import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "carbon-components-svelte/css/white.css";
import { Button } from "carbon-components-svelte";

export default function App($$anchor) {
	Button($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}