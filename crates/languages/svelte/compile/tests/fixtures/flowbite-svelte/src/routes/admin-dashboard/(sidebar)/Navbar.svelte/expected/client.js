import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AppsMenu, UserMenu, NotificationList, mapUsersWithAvatars } from "flowbite-svelte-admin-dashboard";

import {
	DarkMode,
	Dropdown,
	DropdownItem,
	NavBrand,
	NavLi,
	NavUl,
	Navbar,
	Search,
	DropdownDivider
} from "flowbite-svelte";

import {
	ArchiveSolid,
	ArrowRightToBracketOutline,
	CogOutline,
	DollarOutline,
	InboxOutline,
	ProfileCardOutline,
	SalePercentOutline,
	ShoppingBagSolid,
	UsersGroupSolid,
	AnnotationSolid,
	CameraPhotoOutline,
	DownloadSolid,
	HeartSolid,
	ChevronDownOutline
} from "flowbite-svelte-icons";

import Users from "../data/users.json";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-2.5 h-6 sm:h-8" alt="Flowbite Logo"/> <span class="ml-px self-center text-xl font-semibold whitespace-nowrap sm:text-2xl dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`Dropdown <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<form><!></form>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <div class="hidden lg:block lg:ps-3"><!></div> <div class="ms-auto flex items-center text-gray-500 sm:order-2 dark:text-gray-300"><!> <!> <!> <!></div>`, 1);

export default function Navbar_1($$anchor, $$props) {
	$.push($$props, true);

	// import '../../app.css';
	let drawerHidden = $.prop($$props, 'drawerHidden', 11, false),
		list = $.prop($$props, 'list', 3, false);

	const menu = [
		{ name: "Sales", href: "/", icon: ShoppingBagSolid },
		{ name: "Users", href: "/", icon: UsersGroupSolid },
		{ name: "Inbox", href: "/", icon: InboxOutline },
		{ name: "Profile", href: "/", icon: ProfileCardOutline },
		{ name: "Settings", href: "/settings", icon: CogOutline },
		{ name: "Prouducts", href: "/", icon: ArchiveSolid },
		{ name: "Pricing", href: "/pages/pricing", icon: DollarOutline },
		{ name: "Billing", href: "/", icon: SalePercentOutline },
		{ name: "Logout", href: "/", icon: ArrowRightToBracketOutline }
	];

	const menuItems = ["Dashboard", "Settings", "Earnings"];

	// for avatar
	const users = mapUsersWithAvatars(Users);

	const notifications = [
		{
			src: users[0].avatar,
			Icon: DownloadSolid,
			when: "a few moments ago",
			color: "purple",
			content: `New message from <span class="font-semibold text-gray-900 dark:text-white">Bonnie Green</span>: "Hey, what's up? All set for the presentation?"`
		},

		{
			src: users[1].avatar,
			Icon: UsersGroupSolid,
			when: "10 minutes ago",
			color: "gray",
			content: `<span class="font-semibold text-gray-900 dark:text-white">Jese leos</span> and <span class="font-medium text-gray-900 dark:text-white">5 others</span> started following you.`
		},

		{
			src: users[3].avatar,
			Icon: HeartSolid,
			when: "44 minutes ago",
			color: "red",
			content: `<span class="font-semibold text-gray-900 dark:text-white">Joseph Mcfall</span> and <span class="font-medium text-gray-900 dark:text-white">141 others</span> love your story. See it and view more stories.`
		},

		{
			src: users[4].avatar,
			Icon: AnnotationSolid,
			when: "1 hour ago",
			color: "green",
			content: `<span class="font-semibold text-gray-900 dark:text-white">Leslie Livingston</span> mentioned you in a comment: <span class="text-primary-700 dark:text-primary-500 font-medium">@bonnie.green</span> what do you say?`
		},

		{
			src: users[5].avatar,
			Icon: CameraPhotoOutline,
			when: "3 hours ago",
			color: "purple",
			content: `<span class="font-semibold text-gray-900 dark:text-white">Robert Brown</span> posted a new video: Glassmorphism - learn how to implement the new design trend.`
		}
	];

	Navbar($$anchor, {
		class: 'mx-10 sm:mx-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			NavBrand(node, {
				href: '/',
				class: 'mx-10',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					NavUl($$anchor, {
						class: 'ml-2',
						activeUrl: '/',
						activeClass: 'text-primary-600 dark:text-primary-500',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_3();
							var node_2 = $.first_child(fragment_4);

							NavLi(node_2, {
								href: '/',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Home');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							NavLi(node_3, {
								href: '#top',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Messages');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							NavLi(node_4, {
								href: '#top',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Profile');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							NavLi(node_5, {
								href: '#top',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Settings');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							NavLi(node_6, {
								class: 'cursor-pointer',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_5 = root_1();
									var node_7 = $.sibling($.first_child(fragment_5));

									ChevronDownOutline(node_7, { class: 'ms-0 inline' });
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_6, 2);

							Dropdown(node_8, {
								class: 'z-20 w-44',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_9 = $.first_child(fragment_6);

									DropdownItem(node_9, {
										href: '#top',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Item 1');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									DropdownItem(node_10, {
										href: '#top',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Item 2');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_10, 2);

									DropdownItem(node_11, {
										href: '#top',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Item 3');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					var form = root_4();
					var node_12 = $.child(form);

					Search(node_12, { size: 'md', class: 'mt-1 w-96 focus:outline-none' });
					$.reset(form);
					$.append($$anchor, form);
				};

				$.if(node_1, ($$render) => {
					if (list()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_13 = $.child(div_1);

			NotificationList(node_13, {
				get notifications() {
					return notifications;
				}
			});

			var node_14 = $.sibling(node_13, 2);

			AppsMenu(node_14, {
				get menu() {
					return menu;
				}
			});

			var node_15 = $.sibling(node_14, 2);

			DarkMode(node_15, {});

			var node_16 = $.sibling(node_15, 2);

			UserMenu(node_16, $.spread_props(() => users[4], {
				get menuItems() {
					return menuItems;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_5();
					var node_17 = $.first_child(fragment_7);

					DropdownDivider(node_17, {});

					var node_18 = $.sibling(node_17, 2);

					DropdownItem(node_18, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Sign out');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			}));

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}