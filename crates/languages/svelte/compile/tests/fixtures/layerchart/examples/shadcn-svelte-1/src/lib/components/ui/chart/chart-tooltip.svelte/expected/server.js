import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { getPayloadConfigFromPayload, useChart } from "./chart-utils.js";
import { getChartContext, Tooltip as TooltipPrimitive } from 'layerchart';

export default function Chart_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function defaultFormatter(value, _payload) {
			return `${value}`;
		}

		let {
			ref = null,
			class: className,
			hideLabel = false,
			indicator = "dot",
			hideIndicator = false,
			labelKey,
			label,
			labelFormatter = defaultFormatter,
			labelClassName,
			formatter,
			nameKey,
			color,
			$$slots,
			$$events,
			...restProps

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} = $$props;

		const chart = useChart();
		const ctx = getChartContext();

		const formattedLabel = $.derived(() => {
			if (hideLabel || !ctx.tooltip.payload?.length) return null;

			const [item] = ctx.tooltip.payload;
			const key = labelKey ?? item?.label ?? item?.name ?? "value";
			const itemConfig = getPayloadConfigFromPayload(chart.config, item, key);

			const value = !labelKey && typeof label === "string"
				? chart.config[label]?.label ?? label
				: itemConfig?.label ?? item.label;

			if (value === undefined) return null;
			if (!labelFormatter) return value;

			return labelFormatter(value, ctx.tooltip.payload);
		});

		const nestLabel = $.derived(() => ctx.tooltip.payload.length === 1 && indicator !== "dot");

		function TooltipLabel($$renderer) {
			if (formattedLabel()) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn("font-medium", labelClassName)))}>`);

				if (typeof formattedLabel() === "function") {
					$$renderer.push('<!--[0-->');
					formattedLabel()($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(formattedLabel())}`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		if (TooltipPrimitive.Root) {
			$$renderer.push('<!--[-->');

			TooltipPrimitive.Root($$renderer, {
				variant: 'none',
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attributes({
						class: $.clsx(cn("border-border/50 bg-background grid min-w-36 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl", className)),
						...restProps
					})}>`);

					if (!nestLabel()) {
						$$renderer.push('<!--[0-->');
						TooltipLabel($$renderer);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="grid gap-1.5"><!--[-->`);

					const each_array = $.ensure_array_like(ctx.tooltip.payload);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let item = each_array[i];
						const key = `${nameKey || item.key || item.name || "value"}`;
						const itemConfig = getPayloadConfigFromPayload(chart.config, item, key);
						const indicatorColor = color || item.payload?.color || item.color;

						$$renderer.push(`<div${$.attr_class($.clsx(cn("[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5", indicator === "dot" && "items-center")))}>`);

						if (formatter && item.value !== undefined && item.name) {
							$$renderer.push('<!--[0-->');

							formatter($$renderer, {
								value: item.value,
								name: item.name,
								item,
								index: i,
								payload: ctx.tooltip.payload
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (itemConfig?.icon) {
								$$renderer.push('<!--[0-->');

								if (itemConfig.icon) {
									$$renderer.push('<!--[-->');
									itemConfig.icon($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else if (!hideIndicator) {
								$$renderer.push(`<!--[1--><div${$.attr_style(`--color-bg: ${$.stringify(indicatorColor)}; --color-border: ${$.stringify(indicatorColor)};`)}${$.attr_class($.clsx(cn("border-(--color-border) bg-(--color-bg) shrink-0 rounded-[2px]", {
									"size-2.5": indicator === "dot",
									"h-full w-1": indicator === "line",
									"w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
									"my-0.5": nestLabel() && indicator === "dashed"
								})))}></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(cn("flex flex-1 shrink-0 justify-between leading-none", nestLabel() ? "items-end" : "items-center")))}><div class="grid gap-1.5">`);

							if (nestLabel()) {
								$$renderer.push('<!--[0-->');
								TooltipLabel($$renderer);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <span class="text-muted-foreground">${$.escape(itemConfig?.label || item.name)}</span></div> `);

							if (item.value !== undefined) {
								$$renderer.push(`<!--[0--><span class="text-foreground font-mono font-medium tabular-nums">${$.escape(item.value.toLocaleString())}</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref });
	});
}