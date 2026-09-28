import * as $ from 'svelte/internal/server';
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { cn } from "$lib/utils.js";
import { mergeProps } from "bits-ui";
import { useSidebar } from "./context.svelte.js";
import { tv } from "tailwind-variants";

export const sidebarMenuButtonVariants = tv({
	base: "peer/menu-button ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_var(--sidebar-border)] hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
		},
		size: {
			default: "h-8 text-sm",
			sm: "h-7 text-xs",
			lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
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