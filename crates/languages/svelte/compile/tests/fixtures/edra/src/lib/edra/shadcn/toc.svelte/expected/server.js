import * as $ from 'svelte/internal/server';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';

let tocItems = [];

export const setTocItems = (items) => {
	tocItems = items;
};

export default function Toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							delayDuration: 100,
							children: ($$renderer) => {
								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										class: 'fixed top-1/3 right-2 my-auto flex flex-col gap-2 print:hidden',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(tocItems);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let item = each_array[$$index];

												$$renderer.push(`<span${$.attr_class($.clsx(cn('block! h-0.5! w-4 rounded! bg-muted-foreground/50 dark:bg-muted', item.isActive && 'bg-primary!', item.level === 1 ? 'w-6' : 'w-4')))}></span>`);
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

								if (Tooltip.Content) {
									$$renderer.push('<!--[-->');

									Tooltip.Content($$renderer, {
										side: 'left',
										sideOffset: -24,
										align: 'start',
										class: 'flex max-h-120 min-h-8 max-w-56 flex-col items-start gap-1.5 overflow-auto border bg-popover duration-300 fade-in-50 data-[side=left]:slide-in-from-right-30',
										arrowClasses: 'hidden',
										strategy: 'absolute',
										children: ($$renderer) => {
											if (tocItems === undefined || tocItems.length === 0) {
												$$renderer.push(`<!--[0--><div>No contents</div>`);
											} else {
												$$renderer.push(`<!--[-1--><!--[-->`);

												const each_array_1 = $.ensure_array_like(tocItems);

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let item = each_array_1[$$index_1];

													$$renderer.push(`<a${$.attr('href', `#${item.id}`)}${$.attr_class($.clsx(cn('nodefault text-sm text-wrap text-foreground transition-all duration-500', item.isScrolledOver && 'text-muted-foreground italic')))}${$.attr_style(`padding-left: calc(1rem * ${item.level - 1});`)}>${$.escape(item.textContent)}</a>`);
												}

												$$renderer.push(`<!--]-->`);
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
							},
							$$slots: { default: true }
						});

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
	});
}