import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip';
import { Slider as SliderPrimitive } from 'bits-ui';
import { on } from 'svelte/events';

function thumb($$renderer, props) {
	if (SliderPrimitive.Thumb) {
		$$renderer.push('<!--[-->');

		SliderPrimitive.Thumb($$renderer, $.spread_props([
			{
				class: 'border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-xs outline-hidden transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50'
			},
			props
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			orientation = 'horizontal',
			ref = null,
			showTooltip = false,
			tooltipContent,
			value = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let tooltipOpen = false;

		function handlePointerUp() {
			tooltipOpen = false;
		}

		function handlePointerDown() {
			tooltipOpen = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { thumbItems }) {
					$$renderer.push(`<span${$.attr('data-orientation', orientation)} class="bg-secondary relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2">`);

					if (SliderPrimitive.Range) {
						$$renderer.push('<!--[-->');

						SliderPrimitive.Range($$renderer, {
							'data-orientation': orientation,
							class: 'bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</span> <!--[-->`);

					const each_array = $.ensure_array_like(thumbItems);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let thumbItem = each_array[$$index];

						if (!showTooltip) {
							$$renderer.push('<!--[0-->');
							thumb($$renderer, { index: thumbItem.index });
						} else {
							$$renderer.push('<!--[-1-->');

							TooltipProvider($$renderer, {
								children: ($$renderer) => {
									Tooltip($$renderer, {
										get open() {
											return tooltipOpen;
										},

										set open($$value) {
											tooltipOpen = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											{
												function child($$renderer, { props }) {
													thumb($$renderer, {
														index: thumbItem.index,
														...props,
														onpointerdown: handlePointerDown
													});
												}

												TooltipTrigger($$renderer, { child, $$slots: { child: true } });
											}

											$$renderer.push(`<!----> `);

											TooltipContent($$renderer, {
												side: orientation === 'vertical' ? 'right' : 'top',
												sideOffset: 8,
												class: 'border-input bg-popover text-muted-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-2 py-1 text-xs outline-hidden',
												children: ($$renderer) => {
													if (Array.isArray(value)) {
														$$renderer.push(`<!--[0-->${$.escape(tooltipContent
															? tooltipContent(value[thumbItem.index])
															: value[thumbItem.index])}`);
													} else {
														$$renderer.push(`<!--[-1-->${$.escape(tooltipContent ? tooltipContent(value) : value)}`);
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				}

				if (SliderPrimitive.Root) {
					$$renderer.push('<!--[-->');

					SliderPrimitive.Root($$renderer, $.spread_props([
						{
							orientation,
							class: cn('relative flex w-full touch-none items-center select-none disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col', className)
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