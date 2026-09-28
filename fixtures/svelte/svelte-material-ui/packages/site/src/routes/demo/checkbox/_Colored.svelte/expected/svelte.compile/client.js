import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import Button from '@smui/button';

var root = $.from_html(`<div><!></div> <div><!></div> <div><!></div> <div><!></div> <br/> <!> <br/><br/> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <br/> <!>`, 1);

export default function _Colored($$anchor) {
	let checked = $.state(null);
	let checked2 = $.state(null);
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
				Checkbox($$anchor, { class: 'my-colored-checkbox' });
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
				Checkbox($$anchor, { class: 'my-colored-checkbox', disabled: true });
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
				Checkbox($$anchor, { class: 'my-colored-checkbox', disabled: true, checked: true });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	{
		const label = ($$anchor) => {
			$.next();

			var text_3 = $.text('Indeterminate');

			$.append($$anchor, text_3);
		};

		FormField(node_3, {
			label,
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => $.get(checked) === null);

					Checkbox($$anchor, {
						class: 'my-colored-checkbox',
						get indeterminate() {
							return $.get($0);
						},

						get checked() {
							return $.get(checked);
						},

						set checked($$value) {
							$.set(checked, $$value, true);
						}
					});
				}
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_3);

	var node_4 = $.sibling(div_3, 4);

	Button(node_4, {
		onclick: () => $.set(checked, null),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Reset');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var div_4 = $.sibling(node_4, 5);
	var node_5 = $.child(div_4);

	{
		const label = ($$anchor) => {
			$.next();

			var text_5 = $.text('Fully Colored');

			$.append($$anchor, text_5);
		};

		FormField(node_5, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, { class: 'my-fully-colored-checkbox' });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_6 = $.child(div_5);

	{
		const label = ($$anchor) => {
			$.next();

			var text_6 = $.text('Disabled');

			$.append($$anchor, text_6);
		};

		FormField(node_6, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, { class: 'my-fully-colored-checkbox', disabled: true });
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_7 = $.child(div_6);

	{
		const label = ($$anchor) => {
			$.next();

			var text_7 = $.text('Disabled, Checked');

			$.append($$anchor, text_7);
		};

		FormField(node_7, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					class: 'my-fully-colored-checkbox',
					disabled: true,
					checked: true
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_8 = $.child(div_7);

	{
		const label = ($$anchor) => {
			$.next();

			var text_8 = $.text('Indeterminate');

			$.append($$anchor, text_8);
		};

		FormField(node_8, {
			label,
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => $.get(checked2) === null);

					Checkbox($$anchor, {
						class: 'my-fully-colored-checkbox',
						get indeterminate() {
							return $.get($0);
						},

						get checked() {
							return $.get(checked2);
						},

						set checked($$value) {
							$.set(checked2, $$value, true);
						}
					});
				}
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div_7);

	var node_9 = $.sibling(div_7, 4);

	Button(node_9, {
		onclick: () => $.set(checked2, null),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Reset');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}