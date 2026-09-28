import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, TabItem, Button, P } from "flowbite-svelte";

var root = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_1 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_2 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`Currently selected \`key\`: <strong> </strong>`, 1);
var root_5 = $.from_html(`<!> <!> <div class="mt-4 space-x-2"><!> <!> <!></div>`, 1);

export default function BindSelected($$anchor) {
	let selectedKey = $.state("settings");
	var fragment = root_5();
	var node = $.first_child(fragment);

	Tabs(node, {
		get selected() {
			return $.get(selectedKey);
		},

		set selected($$value) {
			$.set(selectedKey, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node_1 = $.first_child(fragment_1);

			TabItem(node_1, {
				key: 'profile',
				title: 'Profile',
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			TabItem(node_2, {
				key: 'settings',
				title: 'Settings',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			TabItem(node_3, {
				key: 'users',
				title: 'Users',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_2();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	P(node_4, {
		class: 'mt-4 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root_4();
			var strong = $.sibling($.first_child(fragment_2));
			var text = $.only_child(strong, true);

			$.template_effect(() => $.set_text(text, $.get(selectedKey)));
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node_4, 2);
	var node_5 = $.child(div);

	Button(node_5, {
		onclick: () => $.set(selectedKey, "profile"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Go to Profile');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		onclick: () => $.set(selectedKey, "settings"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Go to Settings');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		onclick: () => $.set(selectedKey, "users"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Go to Users');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}