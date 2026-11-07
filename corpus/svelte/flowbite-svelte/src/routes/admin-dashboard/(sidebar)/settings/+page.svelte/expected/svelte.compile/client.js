import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DesktopPcOutline, MobilePhoneOutline } from "flowbite-svelte-icons";
import PasswordInfo from "../../utils/settings/PasswordInfo.svelte";
import SocialAccounts from "../../utils/settings/SocialAccounts.svelte";
import { Breadcrumb, BreadcrumbItem, Heading, Button } from "flowbite-svelte";

import {
	NotificationCard,
	GeneralInfo,
	LanguageTime,
	Sessions,
	UserProfile,
	Accounts,
	mapUsersWithAvatars
} from "flowbite-svelte-admin-dashboard";

import Footer from "../Footer.svelte";
import Users from "../../data/users.json";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <main class="p-4"><div class="grid grid-cols-1 space-y-2 xl:grid-cols-3 xl:gap-3.5 dark:bg-gray-900"><div class="col-span-full xl:mb-0"><!> <!></div> <div class="col-span-full space-y-4 xl:col-auto"><!> <!> <!> <!></div> <div class="col-span-2 space-y-4"><!> <!> <!></div></div> <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-4"><!> <!></div></main> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const users = mapUsersWithAvatars(Users);

	const items = [
		{
			title: "Rating reminders",
			subtitle: "Send an email reminding me to rate an item a week after purchase",
			active: true
		},

		{
			title: "Item update notifications",
			subtitle: "Send user and product notifications for you",
			active: false
		},

		{
			title: "Item comment notifications",
			subtitle: "Send me an email when someone comments on one of my items",
			active: true
		},

		{
			title: "Buyer review notifications",
			subtitle: "Send me an email when someone leaves a review with their rating",
			active: false
		}
	];

	const alertItems = [
		{
			title: "Company News",
			subtitle: "Get Themesberg news, announcements, and product updates",
			active: false
		},

		{
			title: "Account Activity",
			subtitle: "Get important notifications about you or activity you've missed",
			active: true
		},

		{
			title: "Meetups Near You",
			subtitle: "Get an email when a Dribbble Meetup is posted close to my location",
			active: true
		},

		{
			title: "New Messages",
			subtitle: "Get Themsberg news, announcements, and product updates",
			active: false
		}
	];

	const inputs = [
		{ label: "First Name", type: "text", placeholder: "Bonnie" },
		{ label: "Last Name", type: "text", placeholder: "Green" },
		{ label: "Country", type: "text", placeholder: "United States" },
		{
			label: "City",
			type: "text",
			placeholder: "e.g. San Francisco"
		},

		{
			label: "Address",
			type: "text",
			placeholder: "e.g. California"
		},

		{
			label: "Email",
			type: "text",
			placeholder: "example@company.com"
		},

		{
			label: "Phone Number",
			type: "text",
			placeholder: "e.g. +(12)3456 789"
		},
		{ label: "Birthday", type: "text", placeholder: "15/08/1980" },
		{
			label: "Organization",
			type: "text",
			placeholder: "Company Name"
		},
		{ label: "Role", type: "text", placeholder: "Svelte Developer" },
		{
			label: "Department",
			type: "text",
			placeholder: "Development"
		},

		{
			label: "Zip/postal code",
			type: "text",
			placeholder: "123456"
		}
	];

	const languages = [
		{ name: "English (US)", value: "en" },
		{ name: "Italiano", value: "it" },
		{ name: "Français (France)", value: "fr" },
		{ name: "正體字", value: "ch" },
		{ name: "Español (España)", value: "es" },
		{ name: "Deutsch", value: "de" },
		{ name: "Português (Brasil)", value: "pt" }
	];

	const timezones = [
		{ name: "GMT+0 Greenwich Mean Time (GMT)", value: "0" },
		{ name: "GMT+1 Central European Time (CET)", value: "1" },
		{ name: "GMT+2 Eastern European Time (EET)", value: "2" },
		{ name: "GMT+3 Moscow Time (MSK)", value: "3" },
		{ name: "GMT+5 Pakistan Standard Time (PKT)", value: "4" },
		{ name: "GMT+8 China Standard Time (CST)", value: "5" },
		{
			name: "GMT+10 Eastern Australia Standard Time (AEST)",
			value: "6"
		}
	];

	const path = "/settings";
	const description = "Settings examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - Settings";
	const subtitle = "Settings";

	// seeMorehref,sessions
	const sessionOptions = {
		seeMorehref: "/",
		sessions: [
			{
				ipaddress: "California 123.123.123.123",
				device: "Chrome on macOS",
				href: "/",
				btnName: "Revoke",
				IconOption: { icon: DesktopPcOutline }
			},

			{
				ipaddress: "Rome 24.456.355.98",
				device: "Safari on iPhone",
				href: "/",
				btnName: "Revoke",
				IconOption: { icon: MobilePhoneOutline }
			}
		]
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title, subtitle });

	var main = $.sibling(node, 2);
	var div = $.child(main);
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	Breadcrumb(node_1, {
		class: 'mb-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			BreadcrumbItem(node_2, {
				home: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			BreadcrumbItem(node_3, {
				class: 'hover:text-primary-600 inline-flex items-center text-gray-700 dark:text-gray-300 dark:hover:text-white',
				href: '/crud/users',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Users');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			BreadcrumbItem(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Settings');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	Heading(node_5, {
		tag: 'h1',
		class: 'text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('User settings');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_6 = $.child(div_2);

	UserProfile(node_6, {
		get src() {
			return users[4].avatar;
		}
	});

	var node_7 = $.sibling(node_6, 2);

	LanguageTime(node_7, {
		get languages() {
			return languages;
		},

		get timezones() {
			return timezones;
		}
	});

	var node_8 = $.sibling(node_7, 2);

	SocialAccounts(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => users.slice(0, 4));

		Accounts(node_9, {
			get users() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					class: 'mt-2 w-fit',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Save all');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_10 = $.child(div_3);

	GeneralInfo(node_10, {
		get inputs() {
			return inputs;
		}
	});

	var node_11 = $.sibling(node_10, 2);

	PasswordInfo(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	Sessions(node_12, $.spread_props(() => sessionOptions));
	$.reset(div_3);
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var node_13 = $.child(div_4);

	NotificationCard(node_13, {
		get items() {
			return alertItems;
		}
	});

	var node_14 = $.sibling(node_13, 2);

	NotificationCard(node_14, {
		get items() {
			return items;
		}
	});

	$.reset(div_4);
	$.reset(main);

	var node_15 = $.sibling(main, 2);

	Footer(node_15, {});
	$.append($$anchor, fragment);
	$.pop();
}