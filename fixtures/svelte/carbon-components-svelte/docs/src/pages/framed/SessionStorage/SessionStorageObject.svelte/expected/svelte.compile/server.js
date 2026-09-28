import * as $ from 'svelte/internal/server';
import { Button, SessionStorage, Stack, TextInput } from "carbon-components-svelte";

export default function SessionStorageObject($$renderer) {
	// A nested object value. Editing a nested field — either through a two-way
	// binding or an explicit in-place mutation signalled with `value = value` —
	// is persisted because the component compares the serialized form.
	let settings = { profile: { name: "Ada", role: "Engineer" }, visits: 0 };

	let events = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				SessionStorage($$renderer, {
					key: 'session-storage-object-example',
					get value() {
						return settings;
					},

					set value($$value) {
						settings = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div>Edit the nested fields below, then refresh the page to confirm the changes
    survive within the session. The two-way bindings mutate <code>settings</code> in place; the component still persists them.</div> `);

				TextInput($$renderer, {
					labelText: 'Name (binds to settings.profile.name)',
					get value() {
						return settings.profile.name;
					},

					set value($$value) {
						settings.profile.name = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				TextInput($$renderer, {
					labelText: 'Role (binds to settings.profile.role)',
					get value() {
						return settings.profile.role;
					},

					set value($$value) {
						settings.profile.role = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Increment visits (${$.escape(settings.visits)})`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div><strong>Current value:</strong> <pre>${$.escape(JSON.stringify(settings, null, 2))}</pre></div> <div><strong>Updates (note prevValue is a true snapshot):</strong> <pre>${$.escape(JSON.stringify(events, null, 2))}</pre></div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}