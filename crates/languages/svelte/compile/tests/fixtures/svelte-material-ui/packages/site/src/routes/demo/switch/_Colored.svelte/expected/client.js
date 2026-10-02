import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Switch from '@smui/switch';
import FormField from '@smui/form-field';

var root = $.from_html(`<div><!></div> <div><!></div> <div><!></div> <br/><br/> <div><!></div> <div><!></div> <div><!></div>`, 1);

export default function _Colored($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Custom Color');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, { class: 'my-colored-switch' });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Disabled');

			$.append($$anchor, text_1);
		};

		FormField(node_1, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, { class: 'my-colored-switch', disabled: true });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_2 = $.text('Disabled, Checked');

			$.append($$anchor, text_2);
		};

		FormField(node_2, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, { class: 'my-colored-switch', disabled: true, checked: true });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 5);
	var node_3 = $.child(div_3);

	{
		const label = ($$anchor) => {
			$.next();

			var text_3 = $.text('Fully Colored');

			$.append($$anchor, text_3);
		};

		FormField(node_3, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, { class: 'my-fully-colored-switch' });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	{
		const label = ($$anchor) => {
			$.next();

			var text_4 = $.text('Disabled');

			$.append($$anchor, text_4);
		};

		FormField(node_4, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, { class: 'my-fully-colored-switch', disabled: true });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_5 = $.child(div_5);

	{
		const label = ($$anchor) => {
			$.next();

			var text_5 = $.text('Disabled, Checked');

			$.append($$anchor, text_5);
		};

		FormField(node_5, {
			label,
			children: ($$anchor, $$slotProps) => {
				Switch($$anchor, {
					class: 'my-fully-colored-switch',
					disabled: true,
					checked: true
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_5);
	$.append($$anchor, fragment);
}