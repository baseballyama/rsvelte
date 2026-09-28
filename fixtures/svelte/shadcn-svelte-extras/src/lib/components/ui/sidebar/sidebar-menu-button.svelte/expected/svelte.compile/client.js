import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import * as Tooltip from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import { mergeProps } from 'bits-ui';
import { useSidebar } from './context.svelte.js';

export const sidebarMenuButtonVariants = tv({
	base: 'ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:font-medium [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate',
	variants: {
		variant: {
			default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
			outline: 'bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]'
		},
		size: {
			default: 'h-8 text-sm',
			sm: 'h-7 text-xs',
			lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!'
		}
	},
	defaultVariants: { variant: 'default', size: 'default' }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'child',
	'variant',
	'size',
	'isActive',
	'tooltipContent',
	'tooltipContentProps'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Sidebar_menu_button($$anchor, $$props) {
	$.push($$props, true);

	const Button = ($$anchor, $$arg0) => {
		let props = () => ($$arg0?.()).props;
		const mergedProps = $.derived(() => mergeProps($.get(buttonProps), props()));
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var button = root();

				$.attribute_effect(button, () => ({ ...$.get(mergedProps) }));

				var node_2 = $.child(button);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.reset(button);
				$.bind_this(button, ($$value) => ref($$value), () => ref());
				$.append($$anchor, button);
			};

			$.if(node, ($$render) => {
				if ($$props.child) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'default'),
		size = $.prop($$props, 'size', 3, 'default'),
		isActive = $.prop($$props, 'isActive', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const sidebar = useSidebar();

	const buttonProps = $.derived(() => ({
		class: cn(sidebarMenuButtonVariants({ variant: variant(), size: size() }), $$props.class),
		'data-slot': 'sidebar-menu-button',
		'data-sidebar': 'menu-button',
		'data-size': size(),
		'data-active': isActive(),
		...restProps
	}));

	var fragment_2 = $.comment();
	var node_3 = $.first_child(fragment_2);

	{
		var consequent_1 = ($$anchor) => {
			Button($$anchor, () => ({}));
		};

		var alternate_1 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_4 = $.first_child(fragment_4);

			$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
				Tooltip_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_5 = $.first_child(fragment_5);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, () => ({ props: props() }));
							};

							$.component(node_5, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_6 = $.sibling(node_5, 2);

						{
							let $0 = $.derived(() => sidebar.state !== 'collapsed' || sidebar.isMobile);

							$.component(node_6, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, $.spread_props(
									{
										side: 'right',
										align: 'center',
										get hidden() {
											return $.get($0);
										}
									},
									() => $$props.tooltipContentProps,
									{
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = $.comment();
											var node_7 = $.first_child(fragment_7);

											{
												var consequent_2 = ($$anchor) => {
													var text = $.text();

													$.template_effect(() => $.set_text(text, $$props.tooltipContent));
													$.append($$anchor, text);
												};

												var consequent_3 = ($$anchor) => {
													var fragment_9 = $.comment();
													var node_8 = $.first_child(fragment_9);

													$.snippet(node_8, () => $$props.tooltipContent);
													$.append($$anchor, fragment_9);
												};

												$.if(node_7, ($$render) => {
													if (typeof $$props.tooltipContent === 'string') $$render(consequent_2); else if ($$props.tooltipContent) $$render(consequent_3, 1);
												});
											}

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									}
								));
							});
						}

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_3, ($$render) => {
			if (!$$props.tooltipContent) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}