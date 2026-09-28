import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from '$lib/components/ui/sheet/index.js';
import { cn } from '$lib/core/utils/index.js';
import { SIDEBAR_WIDTH_MOBILE } from './constants.js';
import { useSidebar } from './context.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'side',
	'variant',
	'collapsible',
	'class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="flex h-full w-full flex-col"><!></div>`);
var root_2 = $.from_html(`<div class="group peer hidden text-sidebar-foreground md:block"><div></div> <div><div data-sidebar="sidebar" class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"><!></div></div></div>`);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		side = $.prop($$props, 'side', 3, 'left'),
		variant = $.prop($$props, 'variant', 3, 'sidebar'),
		collapsible = $.prop($$props, 'collapsible', 3, 'offcanvas'),
		restProps = $.rest_props($$props, rest_excludes);

	const sidebar = useSidebar();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
				() => cn('flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground', $$props.class)
			]);

			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);
			$.bind_this(div, ($$value) => ref($$value), () => ref());
			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => Sheet.Root, ($$anchor, Sheet_Root) => {
				Sheet_Root($$anchor, $.spread_props(
					{
						get open() {
							return sidebar.openMobile;
						},

						get onOpenChange() {
							return sidebar.setOpenMobile;
						}
					},
					() => restProps,
					{
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Sheet.Content, ($$anchor, Sheet_Content) => {
								Sheet_Content($$anchor, {
									'data-sidebar': 'sidebar',
									'data-mobile': 'true',
									class: 'w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden',
									get style() {
										return `--sidebar-width: ${SIDEBAR_WIDTH_MOBILE ?? ''};`;
									},

									get side() {
										return side();
									},

									children: ($$anchor, $$slotProps) => {
										var div_1 = root_1();
										var node_4 = $.child(div_1);

										$.snippet(node_4, () => $$props.children ?? $.noop);
										$.reset(div_1);
										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}
				));
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_2();
			var div_3 = $.child(div_2);
			var div_4 = $.sibling(div_3, 2);

			$.attribute_effect(div_4, ($0) => ({ class: $0, ...restProps }), [
				() => cn(
					'fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex',
					side() === 'left'
						? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
						: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
					variant() === 'floating' || variant() === 'inset'
						? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
						: 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
					$$props.class
				)
			]);

			var div_5 = $.child(div_4);
			var node_5 = $.child(div_5);

			$.snippet(node_5, () => $$props.children ?? $.noop);
			$.reset(div_5);
			$.reset(div_4);
			$.reset(div_2);
			$.bind_this(div_2, ($$value) => ref($$value), () => ref());

			$.template_effect(
				($0) => {
					$.set_attribute(div_2, 'data-state', sidebar.state);
					$.set_attribute(div_2, 'data-collapsible', sidebar.state === 'collapsed' ? collapsible() : '');
					$.set_attribute(div_2, 'data-variant', variant());
					$.set_attribute(div_2, 'data-side', side());
					$.set_class(div_3, 1, $0);
				},
				[
					() => $.clsx(cn('relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear', 'group-data-[collapsible=offcanvas]:w-0', 'group-data-[side=right]:rotate-180', variant() === 'floating' || variant() === 'inset'
						? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
						: 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]'))
				]
			);

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (collapsible() === 'none') $$render(consequent); else if (sidebar.isMobile) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}