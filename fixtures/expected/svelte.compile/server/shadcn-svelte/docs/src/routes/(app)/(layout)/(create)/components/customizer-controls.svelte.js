import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import RandomButton from "./random-button.svelte";
import ResetButton from "./reset-button.svelte";

export default function Customizer_controls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, submenu = false } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn("items-center gap-0", className)))}>`);
		RandomButton($$renderer, { submenu });
		$$renderer.push(`<!----> `);
		ResetButton($$renderer, { submenu });
		$$renderer.push(`<!----></div>`);
	});
}