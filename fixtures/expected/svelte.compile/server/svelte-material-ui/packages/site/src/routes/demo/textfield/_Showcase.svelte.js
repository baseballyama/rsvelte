import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import HelperText from '@smui/textfield/helper-text';

export default function _Showcase($$renderer) {
	let focused = false;
	let value = null;
	let dirty = false;
	let invalid = false;
	const disabled = $.derived(() => focused || !value || !dirty || invalid);

	function clickHandler() {
		alert(`Sending to ${value}!`);
		value = null;
		dirty = false;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="margins">`);

		{
			function trailingIcon($$renderer) {
				if (!disabled()) {
					$$renderer.push('<!--[0-->');

					Icon($$renderer, {
						class: 'material-icons',
						role: 'button',
						onclick: clickHandler,
						children: ($$renderer) => {
							$$renderer.push(`<!---->send`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			function helper($$renderer) {
				HelperText($$renderer, {
					validationMsg: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->That's not a valid email address.`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				type: 'email',
				updateInvalid: true,
				label: 'To',
				style: 'min-width: 250px;',
				input$autocomplete: 'email',
				onfocus: () => focused = true,
				onblur: () => focused = false,
				withTrailingIcon: !disabled(),
				get dirty() {
					return dirty;
				},

				set dirty($$value) {
					dirty = $$value;
					$$settled = false;
				},

				get invalid() {
					return invalid;
				},

				set invalid($$value) {
					invalid = $$value;
					$$settled = false;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				trailingIcon,
				helper,
				$$slots: { trailingIcon: true, helper: true }
			});
		}

		$$renderer.push(`<!----></div> <pre class="status">Focused: ${$.escape(focused)}, Dirty: ${$.escape(dirty)}, Invalid: ${$.escape(invalid)}, Value: ${$.escape(value)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}