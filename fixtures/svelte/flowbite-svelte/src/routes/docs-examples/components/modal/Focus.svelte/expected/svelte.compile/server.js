import * as $ from 'svelte/internal/server';
import { Button, Modal, Label, Input, Checkbox } from "flowbite-svelte";

export default function Focus($$renderer) {
	let open = false;
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: () => open = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Default modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			get checked() {
				return checked;
			},

			set checked($$value) {
				checked = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Focus trap`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function footer($$renderer) {
				Button($$renderer, {
					type: 'submit',
					value: 'notify',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Notify`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'submit',
					color: 'alternative',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Cancel`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			Modal($$renderer, {
				form: true,
				focustrap: checked,
				size: 'sm',
				title: 'Notify user',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},
				footer,
				children: ($$renderer) => {
					Label($$renderer, {
						class: 'space-y-2',
						children: ($$renderer) => {
							$$renderer.push(`<span>Email:</span> `);
							Input($$renderer, { autofocus: true });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { footer: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}