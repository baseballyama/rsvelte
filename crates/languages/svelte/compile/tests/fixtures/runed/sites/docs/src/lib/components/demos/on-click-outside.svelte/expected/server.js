import * as $ from 'svelte/internal/server';
import { Button, DemoContainer } from "@svecodocs/kit";
import { onClickOutside } from "runed";

export default function On_click_outside($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let containerText = "Has not clicked outside yet.";
		let container = void 0;
		const clickOutside = onClickOutside(() => container, () => containerText = "Clicked outside!");

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="border-foreground relative mb-4 rounded-lg border p-4"><span class="bg-foreground text-background absolute right-0 top-0 select-none rounded-bl-md rounded-tr-md px-2.5 py-1 font-mono text-xs">container</span> <p class="select-none pb-4">${$.escape(containerText)}</p> <p class="mb-3 font-mono">Status: <span${$.attr_class($.clsx(clickOutside.enabled ? "text-green-500" : "text-destructive"))}>${$.escape(clickOutside.enabled ? "Enabled" : "Disabled")}</span></p> <div class="flex items-center gap-3">`);

				Button($$renderer, {
					disabled: clickOutside.enabled,
					size: 'sm',
					onclick: clickOutside.start,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Start`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					disabled: !clickOutside.enabled,
					size: 'sm',
					onclick: clickOutside.stop,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Stop`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					onclick: () => containerText = "Has not clicked outside yet.",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Reset`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}