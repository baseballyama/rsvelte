import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem, Heading, P } from "flowbite-svelte";
import { HighlightCompo } from "svelte-rune-highlight";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`Create <code>.env</code> file and add your image url or directory to <code>VITE_IMG_DIR</code>`, 1);
var root_2 = $.from_html(`<main class="h-screen w-full overflow-y-auto bg-white dark:bg-gray-900"><div class="p-12"><!> <!> <!> <!> <!> <!> <!> <!> <!></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const modules = import.meta.glob("./md/*.md", { query: "?raw", import: "default", eager: true });
	var main = root_2();
	var div = $.child(main);
	var node = $.child(div);

	Breadcrumb(node, {
		class: 'mb-5',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			BreadcrumbItem(node_1, {
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
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('About');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Heading(node_3, {
		tag: 'h1',
		class: 'mb-8 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Flowbite Svelte Admin Dashboard');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Heading(node_4, {
		tag: 'h2',
		class: 'my-8 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Installation');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	HighlightCompo(node_5, {
		class: 'mb-8',
		get code() {
			return modules["./md/installation.md"];
		}
	});

	var node_6 = $.sibling(node_5, 2);

	P(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('If you use SvelteKit and the main css file is `src/routes/layout.css` or `src/app.css`, add one of the following based on the file location:');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	HighlightCompo(node_7, {
		class: 'mb-8',
		get code() {
			return modules["./md/css.md"];
		}
	});

	var node_8 = $.sibling(node_7, 2);

	Heading(node_8, {
		tag: 'h2',
		class: 'my-8 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('.env File');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	P(node_9, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root_1();

			$.next(3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	HighlightCompo(node_10, {
		class: 'mb-8',
		get code() {
			return modules["./md/env.md"];
		}
	});

	$.reset(div);
	$.reset(main);
	$.append($$anchor, main);
	$.pop();
}