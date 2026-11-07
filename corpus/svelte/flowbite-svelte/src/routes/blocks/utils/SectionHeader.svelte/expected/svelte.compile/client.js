import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<section><div><!> <h1 class="mb-2 inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"> </h1> <p class="text-lg text-gray-500 lg:mb-0 dark:text-gray-400"> </p></div></section>`);

export default function SectionHeader($$anchor, $$props) {
	let home = $.prop($$props, 'home', 3, "Blocks");

	let headerCls = $.derived(() => $$props.breadcrumb_title
		? ""
		: "mx-auto max-w-8xl pt-8 px-4 lg:px-20 mx-auto max-w-8xl col-span-2 mb-2 lg:mb-0");

	let capitalized = $.derived(() => () => {
		if ($$props.category !== undefined) {
			const [first, ...rest] = $$props.category;

			return `${first.toUpperCase()}${rest.join("")}`;
		}

		return undefined;
	});

	const allowedDirs = ["application", "marketing", "publisher"];
	var section = root_1();
	var div = $.child(section);
	var node = $.child(div);

	Breadcrumb(node, {
		class: 'mb-3 flex',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			BreadcrumbItem(node_1, {
				href: '/blocks',
				home: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, home()));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					BreadcrumbItem($$anchor, {
						get href() {
							return `/blocks/${$$props.category ?? ''}`;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} UI`), [() => $.get(capitalized)()]);
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				};

				var d = $.derived(() => $$props.category && allowedDirs.includes($$props.category));

				$.if(node_2, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					BreadcrumbItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $$props.breadcrumb_title));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if ($$props.breadcrumb_title) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var h1 = $.sibling(node, 2);
	var text_3 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_4 = $.only_child(p, true);

	$.reset(div);
	$.reset(section);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx($.get(headerCls)));
		$.set_text(text_3, $$props.title);
		$.set_text(text_4, $$props.description);
	});

	$.append($$anchor, section);
}