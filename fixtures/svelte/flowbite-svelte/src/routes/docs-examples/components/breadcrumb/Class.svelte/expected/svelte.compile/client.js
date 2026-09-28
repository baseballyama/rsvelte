import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="h-20"><!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!></div>`, 1);

export default function Class($$anchor) {
	let navClass = $.state("");

	const changeNavClass = () => {
		$.set(navClass, $.get(navClass) === "" ? "border border-red-500 p-2" : "", true);
	};

	let olClass = $.state("");

	const changeOlClass = () => {
		$.set(olClass, $.get(olClass) === "" ? "border border-blue-500 p-2" : "", true);
	};

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Breadcrumb(node, {
		get class() {
			return $.get(navClass);
		},

		get olClass() {
			return $.get(olClass);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

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

					var text_1 = $.text('Projects');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			BreadcrumbItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Flowbite Svelte');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	Button(node_4, {
		class: 'w-48',
		onclick: changeNavClass,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text();

			$.template_effect(() => $.set_text(text_3, $.get(navClass) ? "Remove navClass" : "Add navClass"));
			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		class: 'w-48',
		color: 'green',
		onclick: changeOlClass,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text();

			$.template_effect(() => $.set_text(text_4, $.get(olClass) ? "Remove olClass" : "Add olClass"));
			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}