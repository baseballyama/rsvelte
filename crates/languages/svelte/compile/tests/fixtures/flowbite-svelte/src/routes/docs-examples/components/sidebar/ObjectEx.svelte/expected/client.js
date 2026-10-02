import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Sidebar, SidebarGroup, SidebarItem, SidebarButton, uiHelpers } from "flowbite-svelte";
import { page } from "$app/state";
import { ChartOutline, GridSolid, MailBoxSolid, UserSolid } from "flowbite-svelte-icons";
import PlusPlaceholder from "$utils/PlusPlaceholder.svelte";

var root = $.from_html(`<span class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"> </span>`);
var root_1 = $.from_html(`<!> <div class="relative"><!> <div class="h-96 overflow-auto px-4 md:ml-64"><div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700"><!> <!> <!> <!> <!></div></div></div>`, 1);

export default function ObjectEx($$anchor, $$props) {
	$.push($$props, true);

	let activeUrl = $.state($.proxy(page.url.pathname));
	const spanClass = "flex-1 ms-3 whitespace-nowrap";

	const sidebarEx1 = [
		{ label: "Dashboard", href: "/", icon: ChartOutline },
		{
			label: "Kanban",
			href: "/",
			icon: GridSolid,
			subContent: "Pro"
		},

		{
			label: "Inbox",
			href: "/",
			icon: MailBoxSolid,
			subContent: "3"
		},

		{
			label: "Sidebar",
			href: "/components/sidebar",
			icon: UserSolid
		}
	];

	const demoSidebarUi = uiHelpers();
	let isDemoOpen = $.state(false);
	const closeDemoSidebar = demoSidebarUi.close;

	$.user_effect(() => {
		$.set(isDemoOpen, demoSidebarUi.isOpen, true);
		$.set(activeUrl, page.url.pathname, true);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	SidebarButton(node, {
		get onclick() {
			return demoSidebarUi.toggle;
		},
		class: 'mb-2'
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Sidebar(node_1, {
		get activeUrl() {
			return $.get(activeUrl);
		},
		backdrop: false,
		get isOpen() {
			return $.get(isDemoOpen);
		},

		get closeSidebar() {
			return closeDemoSidebar;
		},
		params: { x: -50, duration: 50 },
		class: 'z-50 h-full',
		position: 'absolute',
		classes: { nonactive: "p-2", active: "p-2" },
		children: ($$anchor, $$slotProps) => {
			SidebarGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.each(node_2, 17, () => sidebarEx1, $.index, ($$anchor, $$item) => {
						let label = () => $.get($$item).label;
						let href = () => $.get($$item).href;
						let Icon = () => $.get($$item).icon;
						let subContent = () => $.get($$item).subContent;

						{
							const icon = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, Icon, ($$anchor, Icon_1) => {
									Icon_1($$anchor, {
										class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white'
									});
								});

								$.append($$anchor, fragment_4);
							};

							const subtext = ($$anchor) => {
								var span = root();
								var text = $.only_child(span, true);

								$.template_effect(() => $.set_text(text, subContent()));
								$.append($$anchor, span);
							};

							SidebarItem($$anchor, {
								get label() {
									return label();
								},

								get href() {
									return href();
								},
								spanClass,
								icon,
								subtext,
								$$slots: { icon: true, subtext: true }
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_1, 2);
	var div_2 = $.child(div_1);
	var node_4 = $.child(div_2);

	PlusPlaceholder(node_4, { colnum: 3, rownum: 1 });

	var node_5 = $.sibling(node_4, 2);

	PlusPlaceholder(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	PlusPlaceholder(node_6, { colnum: 2, rownum: 2 });

	var node_7 = $.sibling(node_6, 2);

	PlusPlaceholder(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	PlusPlaceholder(node_8, { colnum: 2, rownum: 2 });
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}