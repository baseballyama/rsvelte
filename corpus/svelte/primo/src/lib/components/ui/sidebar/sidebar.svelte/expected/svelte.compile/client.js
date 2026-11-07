import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from '$lib/components/ui/sheet/index.js';
import { cn } from '$lib/utils.ts';
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
var root_1 = $.from_html(`<div class="text-sidebar-foreground group peer hidden md:block"><div></div> <div><div data-sidebar="sidebar" class="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"><!></div></div></div>`);

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
				() => cn('bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col', $$props.class)
			]);

			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);
			$.bind_this(div, ($$value) => ref($$value), () => ref());
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();
			var div_2 = $.child(div_1);
			var div_3 = $.sibling(div_2, 2);

			$.attribute_effect(div_3, ($0) => ({ class: $0, ...restProps }), [
				() => cn(
					'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
					side() === 'left'
						? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
						: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
					variant() === 'floating' || variant() === 'inset'
						? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
						: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
					$$props.class
				)
			]);

			var div_4 = $.child(div_3);
			var node_2 = $.child(div_4);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(div_4);
			$.reset(div_3);
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => ref($$value), () => ref());

			$.template_effect(
				($0) => {
					$.set_attribute(div_1, 'data-state', sidebar.state);
					$.set_attribute(div_1, 'data-collapsible', sidebar.state === 'collapsed' ? collapsible() : '');
					$.set_attribute(div_1, 'data-variant', variant());
					$.set_attribute(div_1, 'data-side', side());
					$.set_class(div_2, 1, $0);
				},
				[
					() => $.clsx(cn('relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear', 'group-data-[collapsible=offcanvas]:w-0', 'group-data-[side=right]:rotate-180', variant() === 'floating' || variant() === 'inset'
						? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
						: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'))
				]
			);

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (collapsible() === 'none') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}