import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { A, Button } from "flowbite-svelte";
import { DribbbleSolid, FacebookSolid, GithubSolid, TwitterSolid } from "flowbite-svelte-icons";
import { CardWidget } from "flowbite-svelte-admin-dashboard";

var root = $.from_html(`<li class="py-4"><div class="flex items-center space-x-4"><div class="flex-shrink-0"><!></div> <div class="min-w-0 flex-1"><p class="truncate text-base font-semibold text-gray-900 dark:text-white"> </p> <p class="truncate text-sm font-normal text-gray-500 dark:text-gray-300"><!></p></div> <div class="inline-flex items-center"><!></div></div></li>`);
var root_1 = $.from_html(`<ul class="divide-y divide-gray-200 dark:divide-gray-700"></ul> <!>`, 1);

export default function SocialAccounts($$anchor) {
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

	CardWidget($$anchor, {
		title: 'Social accounts',
		class: 'p-4 sm:p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var ul = $.first_child(fragment_1);

			$.each(ul, 21, () => items, $.index, ($$anchor, $$item) => {
				let icon = () => $.get($$item).icon;
				let name = () => $.get($$item).name;
				let link = () => $.get($$item).link;
				var li = root();
				var div = $.child(li);
				var div_1 = $.child(div);
				var node = $.child(div_1);

				$.component(node, icon, ($$anchor, $$component) => {
					$$component($$anchor, { size: 'lg', class: 'text-gray-900 dark:text-white' });
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var p = $.child(div_2);
				var text = $.only_child(p, true);
				var p_1 = $.sibling(p, 2);
				var node_1 = $.child(p_1);

				{
					var consequent = ($$anchor) => {
						A($$anchor, {
							href: '',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, link()));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					};

					var alternate = ($$anchor) => {
						var text_2 = $.text('Not connected');

						$.append($$anchor, text_2);
					};

					$.if(node_1, ($$render) => {
						if (link()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(p_1);
				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_2 = $.child(div_3);

				{
					var consequent_1 = ($$anchor) => {
						Button($$anchor, {
							class: 'px-3 py-2',
							color: 'alternative',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Disconnect');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					};

					var alternate_1 = ($$anchor) => {
						Button($$anchor, {
							class: 'px-3 py-2',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Connect');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_2, ($$render) => {
						if (link()) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.reset(div_3);
				$.reset(div);
				$.reset(li);
				$.template_effect(() => $.set_text(text, name()));
				$.append($$anchor, li);
			});

			$.reset(ul);

			var node_3 = $.sibling(ul, 2);

			Button(node_3, {
				class: 'mt-2 w-fit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Save all');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}