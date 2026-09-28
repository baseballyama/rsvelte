import * as $ from 'svelte/internal/server';
import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import { getContext, setContext } from "svelte";

export function setToggleGroupCtx(props) {
	setContext("toggleGroup", props);
}

export function getToggleGroupCtx() {
	return getContext("toggleGroup");
}

export default function Toggle_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			size = "default",
			variant = "default",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		setToggleGroupCtx({ variant, size });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ToggleGroupPrimitive.Root) {
				$$renderer.push('<!--[-->');

				ToggleGroupPrimitive.Root($$renderer, $.spread_props([
					{
						class: cn("flex items-center justify-center gap-1", className)
					},
					restProps,
					{
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, value });
	});
}