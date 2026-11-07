import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BottomNav, BottomNavItem, Card, Listgroup, Avatar } from "flowbite-svelte";
import { ClockSolid, UsersGroupOutline, StarSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<a href="/" class="flex w-full items-center justify-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"><!> <div><p class="text-sm text-gray-500 dark:text-gray-400"></p> <span class="text-primary-600 dark:text-primary-500 text-xs"></span></div></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Card_1($$anchor) {
	let list = [
		{
			img: { src: "/images/profile-picture-1.webp", alt: "Neil Sims" },
			comment: 'New message from <span class="font-medium text-gray-900 dark:text-white">Jese Leos</span>: "Hey, what\'s up? All set for the presentation?"',
			message: "a few moments ago"
		},

		{
			img: { src: "/images/profile-picture-2.webp", alt: "Bonnie Green" },
			comment: 'Joseph McFall and <span class="font-medium text-gray-900 dark:text-white">5 others</span> started following you.',
			message: "10 minutes ago"
		},

		{
			img: {
				src: "/images/profile-picture-3.webp",
				alt: "Leslie Livingston"
			},
			comment: 'Bonnie Green and <span class="font-medium text-gray-900 dark:text-white">141 others</span> love your story. See it and view more stories.',
			message: "23 minutes ago"
		},

		{
			img: { src: "/images/profile-picture-4.webp", alt: "Robert Brown" },
			comment: 'Leslie Livingston mentioned you in a comment: <span class="font-medium text-primary-600 dark:text-primary-500 hover:underline">@bonnie.green</span> what do you say?',
			message: "23 minutes ago"
		},

		{
			img: { src: "/images/profile-picture-5.webp", alt: "Michael Gough" },
			comment: "Robert Brown</span> posted a new video: Glassmorphism - learn how to implement the new design trend.",
			message: "23 minutes ago"
		}
	];

	Card($$anchor, {
		class: 'relative h-96 overflow-y-scroll rounded-lg border border-gray-100 bg-white dark:border-gray-600 dark:bg-gray-700',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, item = $.noop) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var a = root();
							var node_2 = $.child(a);

							{
								let $0 = $.derived(() => item().img?.src);
								let $1 = $.derived(() => item().img?.alt);

								Avatar(node_2, {
									get src() {
										return $.get($0);
									},

									get alt() {
										return $.get($1);
									},
									class: 'me-3 shrink-0'
								});
							}

							var div = $.sibling(node_2, 2);
							var p = $.child(div);

							$.html(p, () => item().comment || "", true);
							$.reset(p);

							var span = $.sibling(p, 2);

							$.html(span, () => item().message || "", true);
							$.reset(span);
							$.reset(div);
							$.reset(a);
							$.append($$anchor, a);
						};

						$.if(node_1, ($$render) => {
							if (item() && typeof item() !== "string") $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				};

				Listgroup(node, {
					get items() {
						return list;
					},
					class: 'border-0 dark:bg-transparent!',
					children,
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node, 2);

			BottomNav(node_3, {
				position: 'sticky',
				navType: 'card',
				classes: { inner: "grid-cols-3 pt-2 pb-4" },
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					BottomNavItem(node_4, {
						btnName: 'Latest',
						id: 'card-latest',
						children: ($$anchor, $$slotProps) => {
							ClockSolid($$anchor, {
								class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					BottomNavItem(node_5, {
						btnName: 'Following',
						id: 'card-following',
						children: ($$anchor, $$slotProps) => {
							UsersGroupOutline($$anchor, {
								class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					BottomNavItem(node_6, {
						btnName: 'Favorites',
						id: 'card-favorites',
						children: ($$anchor, $$slotProps) => {
							StarSolid($$anchor, {
								class: 'group-hover:text-primary-600 dark:group-hover:text-primary-500 mb-1 h-6 w-6 text-gray-500 dark:text-gray-400'
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}