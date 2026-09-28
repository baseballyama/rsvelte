import * as $ from 'svelte/internal/server';
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

export default function Navbar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import '../../app.css';
		let { drawerHidden = false, list = false } = $$props;

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

		Navbar($$renderer, {
			class: 'mx-10 sm:mx-0',
			children: ($$renderer) => {
				NavBrand($$renderer, {
					href: '/',
					class: 'mx-10',
					children: ($$renderer) => {
						$$renderer.push(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-2.5 h-6 sm:h-8" alt="Flowbite Logo"/> <span class="ml-px self-center text-xl font-semibold whitespace-nowrap sm:text-2xl dark:text-white">Flowbite</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="hidden lg:block lg:ps-3">`);

				if (list) {
					$$renderer.push('<!--[0-->');

					NavUl($$renderer, {
						class: 'ml-2',
						activeUrl: '/',
						activeClass: 'text-primary-600 dark:text-primary-500',
						children: ($$renderer) => {
							NavLi($$renderer, {
								href: '/',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Home`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								href: '#top',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Messages`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								href: '#top',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Profile`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								href: '#top',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Settings`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								class: 'cursor-pointer',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Dropdown `);
									ChevronDownOutline($$renderer, { class: 'ms-0 inline' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dropdown($$renderer, {
								class: 'z-20 w-44',
								children: ($$renderer) => {
									DropdownItem($$renderer, {
										href: '#top',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Item 1`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										href: '#top',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Item 2`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownItem($$renderer, {
										href: '#top',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Item 3`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push(`<!--[-1--><form>`);
					Search($$renderer, { size: 'md', class: 'mt-1 w-96 focus:outline-none' });
					$$renderer.push(`<!----></form>`);
				}

				$$renderer.push(`<!--]--></div> <div class="ms-auto flex items-center text-gray-500 sm:order-2 dark:text-gray-300">`);
				NotificationList($$renderer, { notifications });
				$$renderer.push(`<!----> `);
				AppsMenu($$renderer, { menu });
				$$renderer.push(`<!----> `);
				DarkMode($$renderer, {});
				$$renderer.push(`<!----> `);

				UserMenu($$renderer, $.spread_props([
					users[4],
					{
						menuItems,
						children: ($$renderer) => {
							DropdownDivider($$renderer, {});
							$$renderer.push(`<!----> `);

							DropdownItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Sign out`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { drawerHidden });
	});
}