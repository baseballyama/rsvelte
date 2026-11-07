import * as $ from 'svelte/internal/server';
import { mergeProps } from "bits-ui";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { cn } from "$lib/utils.js";
import { useSidebar } from "./context.svelte.js";
import { tv } from "tailwind-variants";

export const sidebarMenuButtonVariants = tv({
	base: "cn-sidebar-menu-button peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
	variants: {
		variant: {
			default: "cn-sidebar-menu-button-variant-default",
			outline: "cn-sidebar-menu-button-variant-outline"
		},
		size: {
			default: "cn-sidebar-menu-button-size-default",
			sm: "cn-sidebar-menu-button-size-sm",
			lg: "cn-sidebar-menu-button-size-lg"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

export default function Sidebar_menu_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			child,
			variant = "default",
			size = "default",
			isActive = false,
			tooltipContent,
			tooltipContentProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const sidebar = useSidebar();

		const buttonProps = $.derived(() => ({
			class: cn(sidebarMenuButtonVariants({ variant, size }), className),
			"data-slot": "sidebar-menu-button",
			"data-sidebar": "menu-button",
			"data-size": size,
			"data-active": isActive,
			...restProps
		}));

		function Button($$renderer, { props }) {
			const mergedProps = mergeProps(buttonProps(), props);

			if (child) {
				$$renderer.push('<!--[0-->');
				child($$renderer, { props: mergedProps });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps })}>`);
				children?.($$renderer);
				$$renderer.push(`<!----></button>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (!tooltipContent) {
			$$renderer.push('<!--[0-->');
			Button($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');

			if (Tooltip.Root) {
				$$renderer.push('<!--[-->');

				Tooltip.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, { props });
							}

							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');
								Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Tooltip.Content) {
							$$renderer.push('<!--[-->');

							Tooltip.Content($$renderer, $.spread_props([
								{
									side: 'right',
									align: 'center',
									hidden: sidebar.state !== "collapsed" || sidebar.isMobile
								},
								tooltipContentProps,
								{
									children: ($$renderer) => {
										if (typeof tooltipContent === "string") {
											$$renderer.push(`<!--[0-->${$.escape(tooltipContent)}`);
										} else if (tooltipContent) {
											$$renderer.push('<!--[1-->');
											tooltipContent($$renderer);
											$$renderer.push(`<!---->`);
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
		$.bind_props($$props, { ref });
	});
}