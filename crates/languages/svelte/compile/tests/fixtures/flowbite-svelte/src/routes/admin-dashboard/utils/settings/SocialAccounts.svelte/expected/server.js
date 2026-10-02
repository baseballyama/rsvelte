import * as $ from 'svelte/internal/server';
import { A, Button } from "flowbite-svelte";
import { DribbbleSolid, FacebookSolid, GithubSolid, TwitterSolid } from "flowbite-svelte-icons";
import { CardWidget } from "flowbite-svelte-admin-dashboard";

export default function SocialAccounts($$renderer) {
	const items = [
		{
			icon: FacebookSolid,
			name: "Facebook account",
			link: "www.facebook.com/themesberg"
		},

		{
			icon: TwitterSolid,
			name: "Twitter account",
			link: "www.twitter.com/themesberg"
		},
		{ icon: GithubSolid, name: "Github account", link: "" },
		{ icon: DribbbleSolid, name: "Dribble account", link: "" }
	];

	CardWidget($$renderer, {
		title: 'Social accounts',
		class: 'p-4 sm:p-6',
		children: ($$renderer) => {
			$$renderer.push(`<ul class="divide-y divide-gray-200 dark:divide-gray-700"><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { icon, name, link } = each_array[$$index];

				$$renderer.push(`<li class="py-4"><div class="flex items-center space-x-4"><div class="flex-shrink-0">`);

				if (icon) {
					$$renderer.push('<!--[-->');
					icon($$renderer, { size: 'lg', class: 'text-gray-900 dark:text-white' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> <div class="min-w-0 flex-1"><p class="truncate text-base font-semibold text-gray-900 dark:text-white">${$.escape(name)}</p> <p class="truncate text-sm font-normal text-gray-500 dark:text-gray-300">`);

				if (link) {
					$$renderer.push('<!--[0-->');

					A($$renderer, {
						href: '',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(link)}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push(`<!--[-1-->Not connected`);
				}

				$$renderer.push(`<!--]--></p></div> <div class="inline-flex items-center">`);

				if (link) {
					$$renderer.push('<!--[0-->');

					Button($$renderer, {
						class: 'px-3 py-2',
						color: 'alternative',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Disconnect`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');

					Button($$renderer, {
						class: 'px-3 py-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Connect`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div></div></li>`);
			}

			$$renderer.push(`<!--]--></ul> `);

			Button($$renderer, {
				class: 'mt-2 w-fit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Save all`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}