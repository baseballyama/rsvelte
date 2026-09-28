import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _BothIcons($$anchor) {
	let valueA = $.state('');
	let valueB = $.state('');
	let valueC = $.state('');
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const leadingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('event');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		const trailingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('delete');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node, {
			label: 'Standard',
			get value() {
				return $.get(valueA);
			},

			set value($$value) {
				$.set(valueA, $$value, true);
			},
			leadingIcon,
			trailingIcon,
			$$slots: { leadingIcon: true, trailingIcon: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_2 = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		const leadingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('event');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		};

		const trailingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('delete');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_1, {
			variant: 'filled',
			label: 'Filled',
			get value() {
				return $.get(valueB);
			},

			set value($$value) {
				$.set(valueB, $$value, true);
			},
			leadingIcon,
			trailingIcon,
			$$slots: { leadingIcon: true, trailingIcon: true }
		});
	}

	var pre_1 = $.sibling(node_1, 2);
	var text_5 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	{
		const leadingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('event');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});
		};

		const trailingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('delete');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_2, {
			variant: 'outlined',
			label: 'Outlined',
			get value() {
				return $.get(valueC);
			},

			set value($$value) {
				$.set(valueC, $$value, true);
			},
			leadingIcon,
			trailingIcon,
			$$slots: { leadingIcon: true, trailingIcon: true }
		});
	}

	var pre_2 = $.sibling(node_2, 2);
	var text_8 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_2, `Value: ${$.get(valueA) ?? ''}`);
		$.set_text(text_5, `Value: ${$.get(valueB) ?? ''}`);
		$.set_text(text_8, `Value: ${$.get(valueC) ?? ''}`);
	});

	$.append($$anchor, div);
}