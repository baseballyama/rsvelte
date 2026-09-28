import * as $ from 'svelte/internal/server';
import "carbon-components-svelte/css/white.css";
import { Button } from "carbon-components-svelte";

export default function App($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Primary button`);
		},
		$$slots: { default: true }
	});
}