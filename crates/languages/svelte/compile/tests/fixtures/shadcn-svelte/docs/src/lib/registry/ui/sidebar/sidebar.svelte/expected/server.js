import * as $ from 'svelte/internal/server';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { cn } from "$lib/utils.js";
import { SIDEBAR_WIDTH_MOBILE } from "./constants.js";
import { useSidebar } from "./context.svelte.js";

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			side = "left",
			variant = "sidebar",
			collapsible = "offcanvas",
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const sidebar = useSidebar();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (collapsible === "none") {
				$$renderer.push(`<!--[0--><div${$.attributes({
					class: $.clsx(cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className)),
					...restProps
				})}>`);

				children?.($$renderer);
				$$renderer.push(`<!----></div>`);
			} else if (sidebar.isMobile) {
				$$renderer.push('<!--[1-->');

				var bind_get = () => sidebar.openMobile;
				var bind_set = (v) => sidebar.setOpenMobile(v);

				if (Sheet.Root) {
					$$renderer.push('<!--[-->');

					Sheet.Root($$renderer, $.spread_props([
						{
							get open() {
								return bind_get();
							},

							set open($$value) {
								bind_set($$value);
							}
						},
						restProps,
						{
							children: ($$renderer) => {
								if (Sheet.Content) {
									$$renderer.push('<!--[-->');

									Sheet.Content($$renderer, {
										'data-sidebar': 'sidebar',
										'data-slot': 'sidebar',
										'data-mobile': 'true',
										class: cn("w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden", className),
										style: `--sidebar-width: ${$.stringify(SIDEBAR_WIDTH_MOBILE)};`,
										side,
										get ref() {
											return ref;
										},

										set ref($$value) {
											ref = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Sheet.Header) {
												$$renderer.push('<!--[-->');

												Sheet.Header($$renderer, {
													class: 'sr-only',
													children: ($$renderer) => {
														if (Sheet.Title) {
															$$renderer.push('<!--[-->');

															Sheet.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Sidebar`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Sheet.Description) {
															$$renderer.push('<!--[-->');

															Sheet.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Displays the mobile sidebar.`);
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

											$$renderer.push(` <div class="flex h-full w-full flex-col">`);
											children?.($$renderer);
											$$renderer.push(`<!----></div>`);
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
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push(`<!--[-1--><div class="group peer hidden text-sidebar-foreground md:block"${$.attr('data-state', sidebar.state)}${$.attr('data-collapsible', sidebar.state === "collapsed" ? collapsible : "")}${$.attr('data-variant', variant)}${$.attr('data-side', side)} data-slot="sidebar"><div data-slot="sidebar-gap"${$.attr_class($.clsx(cn("cn-sidebar-gap relative w-(--sidebar-width) bg-transparent", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset"
					? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
					: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)")))}></div> <div${$.attributes({
					'data-slot': 'sidebar-container',
					class: $.clsx(cn(
						"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
						side === "left"
							? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]"
							: "end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]",
						variant === "floating" || variant === "inset"
							? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
							: "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-e group-data-[side=right]:border-s",
						className
					)),
					...restProps
				})}><div data-sidebar="sidebar" data-slot="sidebar-inner" class="cn-sidebar-inner flex size-full flex-col">`);

				children?.($$renderer);
				$$renderer.push(`<!----></div></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
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