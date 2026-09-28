import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';

export default function _BothIcons($$renderer) {
	let valueA = '';
	let valueB = '';
	let valueC = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		{
			function leadingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->event`);
					},
					$$slots: { default: true }
				});
			}

			function trailingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->delete`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				label: 'Standard',
				get value() {
					return valueA;
				},

				set value($$value) {
					valueA = $$value;
					$$settled = false;
				},
				leadingIcon,
				trailingIcon,
				$$slots: { leadingIcon: true, trailingIcon: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueA)}</pre></div> <div>`);

		{
			function leadingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->event`);
					},
					$$slots: { default: true }
				});
			}

			function trailingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->delete`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				variant: 'filled',
				label: 'Filled',
				get value() {
					return valueB;
				},

				set value($$value) {
					valueB = $$value;
					$$settled = false;
				},
				leadingIcon,
				trailingIcon,
				$$slots: { leadingIcon: true, trailingIcon: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueB)}</pre></div> <div>`);

		{
			function leadingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->event`);
					},
					$$slots: { default: true }
				});
			}

			function trailingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->delete`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				variant: 'outlined',
				label: 'Outlined',
				get value() {
					return valueC;
				},

				set value($$value) {
					valueC = $$value;
					$$settled = false;
				},
				leadingIcon,
				trailingIcon,
				$$slots: { leadingIcon: true, trailingIcon: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueC)}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}