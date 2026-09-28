import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

var root = $.from_html(`<div><!> <!></div> <div><!> <!></div> <br/><br/> <div><!> <!></div> <div><!> <!></div>`, 1);

export default function _Colored($$anchor) {
	const binding_group = [];
	const binding_group_1 = [];
	let selected = $.state('on');
	let selected2 = $.state('on');
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Custom');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-colored-radio',
					value: 'on',
					get group() {
						return $.get(selected);
					},

					set group($$value) {
						$.set(selected, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Color');

			$.append($$anchor, text_1);
		};

		FormField(node_1, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-colored-radio',
					value: 'off',
					get group() {
						return $.get(selected);
					},

					set group($$value) {
						$.set(selected, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	{
		const label = ($$anchor) => {
			$.next();

			var text_2 = $.text('Disabled');

			$.append($$anchor, text_2);
		};

		FormField(node_2, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-colored-radio',
					disabled: true,
					group: 'off',
					value: 'on'
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_3 = $.text('Checked');

			$.append($$anchor, text_3);
		};

		FormField(node_3, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-colored-radio',
					disabled: true,
					group: 'on',
					value: 'on'
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 5);
	var node_4 = $.child(div_2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_4 = $.text('Fully');

			$.append($$anchor, text_4);
		};

		FormField(node_4, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-fully-colored-radio',
					value: 'on',
					get group() {
						return $.get(selected2);
					},

					set group($$value) {
						$.set(selected2, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_5 = $.text('Colored');

			$.append($$anchor, text_5);
		};

		FormField(node_5, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-fully-colored-radio',
					value: 'off',
					get group() {
						return $.get(selected2);
					},

					set group($$value) {
						$.set(selected2, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	{
		const label = ($$anchor) => {
			$.next();

			var text_6 = $.text('Disabled');

			$.append($$anchor, text_6);
		};

		FormField(node_6, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-fully-colored-radio',
					disabled: true,
					group: 'off',
					value: 'on'
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_7 = $.text('Checked');

			$.append($$anchor, text_7);
		};

		FormField(node_7, {
			label,
			children: ($$anchor, $$slotProps) => {
				Radio($$anchor, {
					class: 'my-fully-colored-radio',
					disabled: true,
					group: 'on',
					value: 'on'
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_3);
	$.append($$anchor, fragment);
}