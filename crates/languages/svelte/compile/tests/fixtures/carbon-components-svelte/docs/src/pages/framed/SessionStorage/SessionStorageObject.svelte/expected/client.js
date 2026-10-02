import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, SessionStorage, Stack, TextInput } from "carbon-components-svelte";

var root = $.from_html(
	`<!> <div>Edit the nested fields below, then refresh the page to confirm the changes
    survive within the session. The two-way bindings mutate <code>settings</code> in place; the component still persists them.</div> <!> <!> <!> <div><strong>Current value:</strong> <pre> </pre></div> <div><strong>Updates (note prevValue is a true snapshot):</strong> <pre> </pre></div>`,
	1
);

export default function SessionStorageObject($$anchor) {
	// A nested object value. Editing a nested field — either through a two-way
	// binding or an explicit in-place mutation signalled with `value = value` —
	// is persisted because the component compares the serialized form.
	let settings = { profile: { name: "Ada", role: "Engineer" }, visits: 0 };

	let events = [];

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SessionStorage(node, {
				key: 'session-storage-object-example',
				get value() {
					return settings;
				},

				set value($$value) {
					settings = $$value;
				},

				$$events: {
					update: ({ detail }) => {
						events = [...events, { event: "on:update", detail }];
					}
				}
			});

			var node_1 = $.sibling(node, 4);

			TextInput(node_1, {
				labelText: 'Name (binds to settings.profile.name)',
				get value() {
					return settings.profile.name;
				},

				set value($$value) {
					settings.profile.name = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			TextInput(node_2, {
				labelText: 'Role (binds to settings.profile.role)',
				get value() {
					return settings.profile.role;
				},

				set value($$value) {
					settings.profile.role = $$value;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				size: 'small',
				$$events: {
					click: () => {
						settings.visits += 1; // in-place mutation
						settings = settings; // signal the change to Svelte
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Increment visits (${settings.visits ?? ''})`));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_3, 2);
			var pre = $.sibling($.child(div), 2);
			var text_1 = $.only_child(pre, true);

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var pre_1 = $.sibling($.child(div_1), 2);
			var text_2 = $.only_child(pre_1, true);

			$.reset(div_1);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_1, $0);
					$.set_text(text_2, $1);
				},
				[
					() => JSON.stringify(settings, null, 2),
					() => JSON.stringify(events, null, 2)
				]
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}