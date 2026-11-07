import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, CheckboxButton } from "flowbite-svelte";
import { AppleSolid, FacebookSolid, DiscordSolid, DropboxSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!>Apple`, 1);
var root_1 = $.from_html(`<!>Facebook`, 1);
var root_2 = $.from_html(`<!>Discord`, 1);
var root_3 = $.from_html(`<!>Dropbox`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<div><!> <!> <!> <!></div> <!>`, 1);

export default function CheckboxButton_1($$anchor) {
	const binding_group = [];
	let group = $.state($.proxy([]));
	var fragment = root_5();
	var div = $.first_child(fragment);
	var node = $.child(div);

	CheckboxButton(node, {
		value: 'Apple',
		get group() {
			return $.get(group);
		},

		set group($$value) {
			$.set(group, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			AppleSolid(node_1, { class: 'me-2 h-6 w-6' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	CheckboxButton(node_2, {
		value: 'Facebook',
		get group() {
			return $.get(group);
		},

		set group($$value) {
			$.set(group, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			FacebookSolid(node_3, { class: 'me-2 h-6 w-6' });
			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	CheckboxButton(node_4, {
		value: 'Discord',
		get group() {
			return $.get(group);
		},

		set group($$value) {
			$.set(group, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			DiscordSolid(node_5, { class: 'me-2 h-6 w-6' });
			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	CheckboxButton(node_6, {
		value: 'Dropbox',
		get group() {
			return $.get(group);
		},

		set group($$value) {
			$.set(group, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_3();
			var node_7 = $.first_child(fragment_4);

			DropboxSolid(node_7, { class: 'me-2 h-6 w-6' });
			$.next();
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_8 = $.sibling(div, 2);

	ButtonGroup(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_4();
			var node_9 = $.first_child(fragment_5);

			CheckboxButton(node_9, {
				value: 'Apple',
				get group() {
					return $.get(group);
				},

				set group($$value) {
					$.set(group, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_10 = $.first_child(fragment_6);

					AppleSolid(node_10, { class: 'h-6 w-6' });
					$.next();
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_9, 2);

			CheckboxButton(node_11, {
				value: 'Facebook',
				get group() {
					return $.get(group);
				},

				set group($$value) {
					$.set(group, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_12 = $.first_child(fragment_7);

					FacebookSolid(node_12, { class: 'h-6 w-6' });
					$.next();
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_11, 2);

			CheckboxButton(node_13, {
				value: 'Discord',
				get group() {
					return $.get(group);
				},

				set group($$value) {
					$.set(group, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_2();
					var node_14 = $.first_child(fragment_8);

					DiscordSolid(node_14, { class: 'h-6 w-6' });
					$.next();
					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_13, 2);

			CheckboxButton(node_15, {
				value: 'Dropbox',
				get group() {
					return $.get(group);
				},

				set group($$value) {
					$.set(group, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_3();
					var node_16 = $.first_child(fragment_9);

					DropboxSolid(node_16, { class: 'h-6 w-6' });
					$.next();
					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}