import * as $ from 'svelte/internal/server';
import Switch from '@smui/switch';
import FormField from '@smui/form-field';

export default function _Colored($$renderer) {
	$$renderer.push(`<div>`);

	{
		function label($$renderer) {
			$$renderer.push(`<!---->Custom Color`);
		}

		FormField($$renderer, {
			label,
			children: ($$renderer) => {
				Switch($$renderer, { class: 'my-colored-switch' });
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
				Switch($$renderer, { class: 'my-colored-switch', disabled: true });
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
				Switch($$renderer, { class: 'my-colored-switch', disabled: true, checked: true });
			},
			$$slots: { label: true, default: true }
		});
	}

	$$renderer.push(`<!----></div> <br/><br/> <div>`);

	{
		function label($$renderer) {
			$$renderer.push(`<!---->Fully Colored`);
		}

		FormField($$renderer, {
			label,
			children: ($$renderer) => {
				Switch($$renderer, { class: 'my-fully-colored-switch' });
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
				Switch($$renderer, { class: 'my-fully-colored-switch', disabled: true });
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
				Switch($$renderer, {
					class: 'my-fully-colored-switch',
					disabled: true,
					checked: true
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}