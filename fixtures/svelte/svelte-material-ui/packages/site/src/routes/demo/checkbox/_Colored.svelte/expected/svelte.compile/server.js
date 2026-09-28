import * as $ from 'svelte/internal/server';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Colored($$renderer) {
	let checked = null;
	let checked2 = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Custom Color`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, { class: 'my-colored-checkbox' });
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Disabled`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, { class: 'my-colored-checkbox', disabled: true });
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Disabled, Checked`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, { class: 'my-colored-checkbox', disabled: true, checked: true });
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Indeterminate`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						class: 'my-colored-checkbox',
						indeterminate: checked === null,
						get checked() {
							return checked;
						},

						set checked($$value) {
							checked = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <br/> `);

		Button($$renderer, {
			onclick: () => checked = null,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Reset`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <br/><br/> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Fully Colored`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, { class: 'my-fully-colored-checkbox' });
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Disabled`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, { class: 'my-fully-colored-checkbox', disabled: true });
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Disabled, Checked`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						class: 'my-fully-colored-checkbox',
						disabled: true,
						checked: true
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Indeterminate`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						class: 'my-fully-colored-checkbox',
						indeterminate: checked2 === null,
						get checked() {
							return checked2;
						},

						set checked($$value) {
							checked2 = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <br/> `);

		Button($$renderer, {
			onclick: () => checked2 = null,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Reset`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}