import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { cn } from "$lib/utils.js";
import { SIDEBAR_WIDTH_MOBILE } from "./constants.js";
import { useSidebar } from "./context.svelte.js";

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
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="flex h-full w-full flex-col"><!></div>`, 1);
var root_3 = $.from_html(`<div class="group peer hidden text-sidebar-foreground md:block" data-slot="sidebar"><div data-slot="sidebar-gap"></div> <div><div data-sidebar="sidebar" data-slot="sidebar-inner" class="cn-sidebar-inner flex size-full flex-col"><!></div></div></div>`);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		side = $.prop($$props, 'side', 3, "left"),
		variant = $.prop($$props, 'variant', 3, "sidebar"),
		collapsible = $.prop($$props, 'collapsible', 3, "offcanvas"),
		restProps = $.rest_props($$props, rest_excludes);

	const sidebar = useSidebar();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
				() => cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", $$props.class)
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
			var bind_get = () => sidebar.openMobile;
			var bind_set = (v) => sidebar.setOpenMobile(v);

			$.component(node_2, () => Sheet.Root, ($$anchor, Sheet_Root) => {
				Sheet_Root($$anchor, $.spread_props(
					{
						get open() {
							return bind_get();
						},

						set open($$value) {
							bind_set($$value);
						}
					},
					() => restProps,
					{
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => cn("w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden", $$props.class));

								$.component(node_3, () => Sheet.Content, ($$anchor, Sheet_Content) => {
									Sheet_Content($$anchor, {
										'data-sidebar': 'sidebar',
										'data-slot': 'sidebar',
										'data-mobile': 'true',
										get class() {
											return $.get($0);
										},

										get style() {
											return `--sidebar-width: ${SIDEBAR_WIDTH_MOBILE ?? ''};`;
										},

										get side() {
											return side();
										},

										get ref() {
											return ref();
										},

										set ref($$value) {
											ref($$value);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_2();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Sheet.Header, ($$anchor, Sheet_Header) => {
												Sheet_Header($$anchor, {
													class: 'sr-only',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_1();
														var node_5 = $.first_child(fragment_4);

														$.component(node_5, () => Sheet.Title, ($$anchor, Sheet_Title) => {
															Sheet_Title($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text('Sidebar');

																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														});

														var node_6 = $.sibling(node_5, 2);

														$.component(node_6, () => Sheet.Description, ($$anchor, Sheet_Description) => {
															Sheet_Description($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Displays the mobile sidebar.');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var div_1 = $.sibling(node_4, 2);
											var node_7 = $.child(div_1);

											$.snippet(node_7, () => $$props.children ?? $.noop);
											$.reset(div_1);
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}
				));
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_3();
			var div_3 = $.child(div_2);
			var div_4 = $.sibling(div_3, 2);

			$.attribute_effect(div_4, ($0) => ({ 'data-slot': 'sidebar-container', class: $0, ...restProps }), [
				() => cn(
					"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
					side() === "left"
						? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]"
						: "end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]",
					variant() === "floating" || variant() === "inset"
						? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
						: "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-e group-data-[side=right]:border-s",
					$$props.class
				)
			]);

			var div_5 = $.child(div_4);
			var node_8 = $.child(div_5);

			$.snippet(node_8, () => $$props.children ?? $.noop);
			$.reset(div_5);
			$.reset(div_4);
			$.reset(div_2);
			$.bind_this(div_2, ($$value) => ref($$value), () => ref());

			$.template_effect(
				($0) => {
					$.set_attribute(div_2, 'data-state', sidebar.state);
					$.set_attribute(div_2, 'data-collapsible', sidebar.state === "collapsed" ? collapsible() : "");
					$.set_attribute(div_2, 'data-variant', variant());
					$.set_attribute(div_2, 'data-side', side());
					$.set_class(div_3, 1, $0);
				},
				[
					() => $.clsx(cn("cn-sidebar-gap relative w-(--sidebar-width) bg-transparent", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant() === "floating" || variant() === "inset"
						? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
						: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"))
				]
			);

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (collapsible() === "none") $$render(consequent); else if (sidebar.isMobile) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}