import * as $ from 'svelte/internal/server';
import { Slider as SliderPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			orientation = "horizontal",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { thumbItems }) {
					$$renderer.push(`<span data-slot="slider-track"${$.attr('data-orientation', orientation)}${$.attr_class($.clsx(cn("cn-slider-track relative grow overflow-hidden bg-muted data-horizontal:w-full data-vertical:h-full")))}>`);

					if (SliderPrimitive.Range) {
						$$renderer.push('<!--[-->');

						SliderPrimitive.Range($$renderer, {
							'data-slot': 'slider-range',
							class: cn("cn-slider-range absolute select-none data-horizontal:h-full data-vertical:w-full")
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</span> <!--[-->`);

					const each_array = $.ensure_array_like(thumbItems);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let thumb = each_array[$$index];

						if (SliderPrimitive.Thumb) {
							$$renderer.push('<!--[-->');

							SliderPrimitive.Thumb($$renderer, {
								'data-slot': 'slider-thumb',
								index: thumb.index,
								class: 'cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				if (SliderPrimitive.Root) {
					$$renderer.push('<!--[-->');

					SliderPrimitive.Root($$renderer, $.spread_props([
						{
							'data-slot': 'slider',
							orientation,
							class: cn("cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col", className)
						},
						restProps,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},
							children,
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
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