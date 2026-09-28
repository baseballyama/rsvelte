import * as $ from 'svelte/internal/server';
import { ScrollArea } from "bits-ui";
import DemoContainer from "../demo-container.svelte";
import { cn } from "$lib/utils/styles.js";

function Scrollbar($$renderer, { orientation }) {
	if (orientation === "vertical") {
		$$renderer.push('<!--[0-->');

		if (ScrollArea.Scrollbar) {
			$$renderer.push('<!--[-->');

			ScrollArea.Scrollbar($$renderer, {
				orientation,
				class: 'bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all duration-200 hover:w-3',
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
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else {
		$$renderer.push('<!--[-1-->');

		if (ScrollArea.Scrollbar) {
			$$renderer.push('<!--[-->');

			ScrollArea.Scrollbar($$renderer, {
				orientation,
				class: 'bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex h-2.5 touch-none select-none rounded-full border-t border-t-transparent p-px transition-all duration-200 hover:h-3',
				children: ($$renderer) => {
					if (ScrollArea.Thumb) {
						$$renderer.push('<!--[-->');
						ScrollArea.Thumb($$renderer, { class: 'd bg-muted-foreground rounded-full' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`<!--]-->`);
}

export default function Scroll_area_demo_custom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			orientation = "vertical",
			viewportClasses,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				size: 'sm',
				children: ($$renderer) => {
					if (ScrollArea.Root) {
						$$renderer.push('<!--[-->');

						ScrollArea.Root($$renderer, $.spread_props([
							restProps,
							{
								class: 'border-dark-10 bg-background-alt shadow-card relative overflow-hidden rounded-[10px] border px-4 py-4',
								get ref() {
									return ref;
								},

								set ref($$value) {
									ref = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (ScrollArea.Viewport) {
										$$renderer.push('<!--[-->');

										ScrollArea.Viewport($$renderer, {
											class: cn("h-full max-h-[200px] w-full max-w-[200px]", viewportClasses),
											children: ($$renderer) => {
												if (children) {
													$$renderer.push('<!--[0-->');
													children?.($$renderer);
													$$renderer.push(`<!---->`);
												} else {
													$$renderer.push(`<!--[-1--><h4 class="text-foreground mb-4 mt-2 text-xl font-semibold leading-none tracking-[-0.01em]">Scroll Area</h4> <p class="text-foreground-alt text-wrap text-sm leading-5">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dignissimos impedit
					rem, repellat deserunt ducimus quasi nisi voluptatem cumque aliquid esse ea
					deleniti eveniet incidunt! Deserunt minus laborum accusamus iusto dolorum. Lorem
					ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis officiis error
					minima eos fugit voluptate excepturi eveniet dolore et, ratione impedit
					consequuntur dolorem hic quae corrupti autem? Dolorem, sit voluptatum.</p>`);
												}

												$$renderer.push(`<!--]-->`);
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
										Scrollbar($$renderer, { orientation: "vertical" });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (orientation === "horizontal" || orientation === "both") {
										$$renderer.push('<!--[0-->');
										Scrollbar($$renderer, { orientation: "horizontal" });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (ScrollArea.Corner) {
										$$renderer.push('<!--[-->');
										ScrollArea.Corner($$renderer, {});
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
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}