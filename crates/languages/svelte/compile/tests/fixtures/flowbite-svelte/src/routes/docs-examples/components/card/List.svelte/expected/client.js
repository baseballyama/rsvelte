import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Listgroup, Avatar } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-900 dark:text-white"> </p> <p class="truncate text-sm text-gray-500 dark:text-gray-400"> </p></div> <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"> </div>`, 1);
var root_1 = $.from_html(`<div class="flex items-center space-x-4 py-2 rtl:space-x-reverse"><!></div>`);
var root_2 = $.from_html(`<div class="mb-4 flex items-center justify-between"><h5 class="text-xl leading-none font-bold text-gray-900 dark:text-white">Latest Customers</h5> <a href="/" class="text-primary-600 dark:text-primary-500 text-sm font-medium hover:underline">View all</a></div> <!>`, 1);

export default function List($$anchor) {
	let list = [
		{
			img: { src: "/images/profile-picture-1.webp", alt: "Neil Sims" },
			name: "Neil Sims",
			email: "email@windster.com",
			value: "$320"
		},

		{
			img: { src: "/images/profile-picture-2.webp", alt: "Bonnie Green" },
			name: "Bonnie Green",
			email: "email@windster.com",
			value: "$3467"
		},

		{
			img: { src: "/images/profile-picture-3.webp", alt: "Michael Gough" },
			name: "Michael Gough",
			email: "email@windster.com",
			value: "$67"
		}
	];

	Card($$anchor, {
		class: 'p-4 sm:p-8 md:p-10',
		size: 'md',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.sibling($.first_child(fragment_1), 2);

			{
				const children = ($$anchor, item = $.noop) => {
					var div = root_1();
					var node_1 = $.child(div);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							Avatar(node_2, {
								get src() {
									return item().img.src;
								},

								get alt() {
									return item().img.alt;
								},
								class: 'shrink-0'
							});

							var div_1 = $.sibling(node_2, 2);
							var p = $.child(div_1);
							var text = $.only_child(p, true);
							var p_1 = $.sibling(p, 2);
							var text_1 = $.only_child(p_1, true);

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var text_2 = $.only_child(div_2, true);

							$.template_effect(() => {
								$.set_text(text, item().name);
								$.set_text(text_1, item().email);
								$.set_text(text_2, item().value);
							});

							$.append($$anchor, fragment_2);
						};

						$.if(node_1, ($$render) => {
							if (typeof item() === "object" && item().img) $$render(consequent);
						});
					}

					$.reset(div);
					$.append($$anchor, div);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}