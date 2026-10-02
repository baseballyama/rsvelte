import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Button($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled`);
		},
		$$slots: { default: true }
	});
}