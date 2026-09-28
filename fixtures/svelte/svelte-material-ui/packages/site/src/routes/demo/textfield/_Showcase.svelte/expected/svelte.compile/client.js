import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import HelperText from '@smui/textfield/helper-text';

var root = $.from_html(`<div class="margins"><!></div> <pre class="status"> </pre>`, 1);

export default function _Showcase($$anchor) {
	let focused = $.state(false);
	let value = $.state(null);
	let dirty = $.state(false);
	let invalid = $.state(false);
	const disabled = $.derived(() => $.get(focused) || !$.get(value) || !$.get(dirty) || $.get(invalid));

	function clickHandler() {
		alert(`Sending to ${$.get(value)}!`);
		$.set(value, null);
		$.set(dirty, false);
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const trailingIcon = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, {
						class: 'material-icons',
						role: 'button',
						onclick: clickHandler,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('send');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_1, ($$render) => {
					if (!$.get(disabled)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		const helper = ($$anchor) => {
			HelperText($$anchor, {
				validationMsg: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('That\'s not a valid email address.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => !$.get(disabled));

		Textfield(node, {
			type: 'email',
			updateInvalid: true,
			label: 'To',
			style: 'min-width: 250px;',
			input$autocomplete: 'email',
			onfocus: () => $.set(focused, true),
			onblur: () => $.set(focused, false),
			get withTrailingIcon() {
				return $.get($0);
			},

			get dirty() {
				return $.get(dirty);
			},

			set dirty($$value) {
				$.set(dirty, $$value, true);
			},

			get invalid() {
				return $.get(invalid);
			},

			set invalid($$value) {
				$.set(invalid, $$value, true);
			},

			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			trailingIcon,
			helper,
			$$slots: { trailingIcon: true, helper: true }
		});
	}

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_2, `Focused: ${$.get(focused) ?? ''}, Dirty: ${$.get(dirty) ?? ''}, Invalid: ${$.get(invalid) ?? ''}, Value: ${$.get(value) ?? ''}`));
	$.append($$anchor, fragment);
}