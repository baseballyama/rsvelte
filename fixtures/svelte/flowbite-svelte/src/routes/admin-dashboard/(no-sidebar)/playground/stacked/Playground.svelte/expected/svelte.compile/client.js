import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem, Heading } from "flowbite-svelte";
import { EmptyCard } from "flowbite-svelte-admin-dashboard";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<main><div class="grid grid-cols-1 pt-2 xl:grid-cols-3 xl:gap-4 xl:px-0 dark:bg-gray-900"><div class="col-span-full mb-4 xl:mb-2"><!> <!></div> <div class="col-span-full xl:col-auto"><!> <!></div> <div class="col-span-2"><!> <!></div></div> <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"></div></main>`);

export default function Playground($$anchor) {
	var main = root_1();
	var div = $.child(main);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Breadcrumb(node, {
		class: 'mb-5',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			BreadcrumbItem(node_1, {
				href: '/',
				home: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			BreadcrumbItem(node_2, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Pages');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			BreadcrumbItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Playground');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Heading(node_4, {
		tag: 'h1',
		class: 'text-xl font-semibold sm:text-2xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Create something awesome here');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_5 = $.child(div_2);

	EmptyCard(node_5, {
		size: 'xl',
		class: 'mb-4 h-80 w-full space-y-6 p-4 2xl:col-span-2'
	});

	var node_6 = $.sibling(node_5, 2);

	EmptyCard(node_6, {
		size: 'xl',
		class: 'mb-4 h-80 w-full space-y-6 p-4 2xl:col-span-2'
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_7 = $.child(div_3);

	EmptyCard(node_7, { size: undefined, class: 'mb-4 h-80 max-w-none space-y-6 p-4' });

	var node_8 = $.sibling(node_7, 2);

	EmptyCard(node_8, {
		size: undefined,
		class: 'mb-4 h-80 w-full max-w-none space-y-6 p-4'
	});

	$.reset(div_3);
	$.reset(div);

	var div_4 = $.sibling(div, 2);

	$.each(div_4, 20, () => Array(4), $.index, ($$anchor, _) => {
		EmptyCard($$anchor, { size: 'xl', class: 'h-60 w-full space-y-6 sm:p-6' });
	});

	$.reset(div_4);
	$.reset(main);
	$.append($$anchor, main);
}