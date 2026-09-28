import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import Button from '@smui/button';

export default function _ConditionalIcons($$renderer) {
	let valueA = '';
	let valueB = '';
	let valueC = '';
	let showLeadingIcons = true;
	let showTrailingIcons = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		{
			function leadingIcon($$renderer) {
				if (showLeadingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->event`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			function trailingIcon($$renderer) {
				if (showTrailingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->delete`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Textfield($$renderer, {
				withLeadingIcon: showLeadingIcons,
				withTrailingIcon: showTrailingIcons,
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
				if (showLeadingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->event`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			function trailingIcon($$renderer) {
				if (showTrailingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->delete`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Textfield($$renderer, {
				withLeadingIcon: showLeadingIcons,
				withTrailingIcon: showTrailingIcons,
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
				if (showLeadingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->event`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			function trailingIcon($$renderer) {
				if (showTrailingIcons) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						children: ($$renderer) => {
							$$renderer.push(`<!---->delete`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Textfield($$renderer, {
				withLeadingIcon: showLeadingIcons,
				withTrailingIcon: showTrailingIcons,
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

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueC)}</pre></div></div> <div>`);

		Button($$renderer, {
			onclick: () => showLeadingIcons = !showLeadingIcons,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle Leading Icons`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => showTrailingIcons = !showTrailingIcons,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle Trailing Icons`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}