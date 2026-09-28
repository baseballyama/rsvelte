import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import * as Command from "$lib/registry/ui/command/index.js";
import { cn } from "$lib/utils.js";

export default function Model_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			model,
			isSelected,
			onSelect,
			onPeek,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function mutationObserverAction(node) {
			const observer = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					if (mutation.type !== "attributes" || mutation.attributeName !== "aria-selected") continue;

					if (node.getAttribute("aria-selected") === "true") {
						onPeek(model);
					}
				}
			});

			observer.observe(node, { attributes: true });

			return {
				destroy() {
					observer.disconnect();
				}
			};
		}

		{
			function child($$renderer, { props }) {
				$$renderer.push(`<div${$.attributes({
					...props,
					class: 'relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none aria-selected:bg-primary aria-selected:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
				})}>${$.escape(model.name)} `);

				if (isSelected) {
					$$renderer.push('<!--[0-->');
					CheckIcon($$renderer, { class: cn("ms-auto size-4") });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			if (Command.Item) {
				$$renderer.push('<!--[-->');

				Command.Item($$renderer, $.spread_props([
					{ value: model.name, onSelect },
					restProps,
					{ child, $$slots: { child: true } }
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	});
}