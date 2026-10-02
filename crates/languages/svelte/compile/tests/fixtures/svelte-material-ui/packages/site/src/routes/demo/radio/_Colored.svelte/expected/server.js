import * as $ from 'svelte/internal/server';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

export default function _Colored($$renderer) {
	let selected = 'on';
	let selected2 = 'on';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Custom`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Radio($$renderer, {
						class: 'my-colored-radio',
						value: 'on',
						get group() {
							return selected;
						},

						set group($$value) {
							selected = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Color`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Radio($$renderer, {
						class: 'my-colored-radio',
						value: 'off',
						get group() {
							return selected;
						},

						set group($$value) {
							selected = $$value;
							$$settled = false;
						}
					});
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
					Radio($$renderer, {
						class: 'my-colored-radio',
						disabled: true,
						group: 'off',
						value: 'on'
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Checked`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Radio($$renderer, {
						class: 'my-colored-radio',
						disabled: true,
						group: 'on',
						value: 'on'
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <br/><br/> <div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Fully`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Radio($$renderer, {
						class: 'my-fully-colored-radio',
						value: 'on',
						get group() {
							return selected2;
						},

						set group($$value) {
							selected2 = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Colored`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Radio($$renderer, {
						class: 'my-fully-colored-radio',
						value: 'off',
						get group() {
							return selected2;
						},

						set group($$value) {
							selected2 = $$value;
							$$settled = false;
						}
					});
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
					Radio($$renderer, {
						class: 'my-fully-colored-radio',
						disabled: true,
						group: 'off',
						value: 'on'
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Checked`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Radio($$renderer, {
						class: 'my-fully-colored-radio',
						disabled: true,
						group: 'on',
						value: 'on'
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}