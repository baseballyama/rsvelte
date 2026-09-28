import * as $ from 'svelte/internal/server';
import { Button, Checkbox, CheckboxGroup, Stack } from "carbon-components-svelte";

export default function CheckboxGroupReactive($$renderer) {
	let selected = ["email"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			inline: true,
			gap: 4,
			children: ($$renderer) => {
				CheckboxGroup($$renderer, {
					legendText: 'Notification preferences',
					name: 'prefs',
					get selected() {
						return selected;
					},

					set selected($$value) {
						selected = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Checkbox($$renderer, { value: 'email', labelText: 'Email' });
						$$renderer.push(`<!----> `);
						Checkbox($$renderer, { value: 'sms', labelText: 'SMS' });
						$$renderer.push(`<!----> `);
						Checkbox($$renderer, { value: 'push', labelText: 'Push notifications' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Select Email + Push`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div><strong>selected:</strong> ${$.escape(JSON.stringify(selected))}</div>`);
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