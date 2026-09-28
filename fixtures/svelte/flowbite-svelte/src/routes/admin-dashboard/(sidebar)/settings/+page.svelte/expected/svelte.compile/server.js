import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		MetaTag($$renderer, { path, description, title, subtitle });
		$$renderer.push(`<!----> <main class="p-4"><div class="grid grid-cols-1 space-y-2 xl:grid-cols-3 xl:gap-3.5 dark:bg-gray-900"><div class="col-span-full xl:mb-0">`);

		Breadcrumb($$renderer, {
			class: 'mb-6',
			children: ($$renderer) => {
				BreadcrumbItem($$renderer, {
					home: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BreadcrumbItem($$renderer, {
					class: 'hover:text-primary-600 inline-flex items-center text-gray-700 dark:text-gray-300 dark:hover:text-white',
					href: '/crud/users',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Users`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				BreadcrumbItem($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Settings`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h1',
			class: 'text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
			children: ($$renderer) => {
				$$renderer.push(`<!---->User settings`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="col-span-full space-y-4 xl:col-auto">`);
		UserProfile($$renderer, { src: users[4].avatar });
		$$renderer.push(`<!----> `);
		LanguageTime($$renderer, { languages, timezones });
		$$renderer.push(`<!----> `);
		SocialAccounts($$renderer, {});
		$$renderer.push(`<!----> `);

		Accounts($$renderer, {
			users: users.slice(0, 4),
			children: ($$renderer) => {
				Button($$renderer, {
					class: 'mt-2 w-fit',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Save all`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="col-span-2 space-y-4">`);
		GeneralInfo($$renderer, { inputs });
		$$renderer.push(`<!----> `);
		PasswordInfo($$renderer, {});
		$$renderer.push(`<!----> `);
		Sessions($$renderer, $.spread_props([sessionOptions]));
		$$renderer.push(`<!----></div></div> <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-4">`);
		NotificationCard($$renderer, { items: alertItems });
		$$renderer.push(`<!----> `);
		NotificationCard($$renderer, { items });
		$$renderer.push(`<!----></div></main> `);
		Footer($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}