import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";
import { ScrollArea } from "bits-ui";

export default function Scroll_area($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			children,
			scrollbarXProps,
			scrollbarYProps,
			orientation = "both",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (ScrollArea.Root) {
			$$renderer.push('<!--[-->');

			ScrollArea.Root($$renderer, $.spread_props([
				restProps,
				{
					children: ($$renderer) => {
						if (ScrollArea.Viewport) {
							$$renderer.push('<!--[-->');

							ScrollArea.Viewport($$renderer, {
								class: cn("max-h-[400px] max-w-[800px] py-3.5 pr-3.5", className),
								children: ($$renderer) => {
									children?.($$renderer);
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (orientation === "vertical" || orientation === "both") {
							$$renderer.push('<!--[0-->');

							if (ScrollArea.Scrollbar) {
								$$renderer.push('<!--[-->');

								ScrollArea.Scrollbar($$renderer, $.spread_props([
									{ orientation: 'vertical' },
									scrollbarYProps,
									{
										class: cn("hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 bg-background before:bg-background relative flex w-2.5 touch-none select-none rounded-full p-px transition-all duration-150 before:absolute before:inset-0 hover:w-3", scrollbarYProps?.class),
										children: ($$renderer) => {
											if (ScrollArea.Thumb) {
												$$renderer.push('<!--[-->');
												ScrollArea.Thumb($$renderer, { class: 'bg-muted-foreground flex-1 rounded-full' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (orientation === "horizontal" || orientation === "both") {
							$$renderer.push('<!--[0-->');

							if (ScrollArea.Scrollbar) {
								$$renderer.push('<!--[-->');

								ScrollArea.Scrollbar($$renderer, $.spread_props([
									{ orientation: 'horizontal' },
									scrollbarXProps,
									{
										class: cn("hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 bg-background before:bg-background relative flex h-2.5 touch-none select-none rounded-full p-px transition-all duration-150 before:absolute before:inset-0 hover:h-3", scrollbarXProps?.class),
										children: ($$renderer) => {
											if (ScrollArea.Thumb) {
												$$renderer.push('<!--[-->');
												ScrollArea.Thumb($$renderer, { class: 'bg-muted-foreground rounded-full' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (orientation === "both") {
							$$renderer.push('<!--[0-->');

							if (ScrollArea.Corner) {
								$$renderer.push('<!--[-->');
								ScrollArea.Corner($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}