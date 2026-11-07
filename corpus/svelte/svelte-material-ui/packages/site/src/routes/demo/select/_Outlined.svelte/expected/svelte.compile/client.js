import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select, { Option } from '@smui/select';
import Icon from '@smui/select/icon';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _Outlined($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = $.state('');
	let valueHelperText = $.state('');
	let valueLeadingIcon = $.state('');
	let valueInvalid = $.state('');
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Select(node, {
		variant: 'outlined',
		label: 'Fruit',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Option(node_1, { value: '' });

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => fruits, $.index, ($$anchor, fruit) => {
				Option($$anchor, {
					get value() {
						return $.get(fruit);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(fruit)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	{
		const helperText = ($$anchor) => {
			$.next();

			var text_2 = $.text('Helper text.');

			$.append($$anchor, text_2);
		};

		Select(node_3, {
			variant: 'outlined',
			label: 'With Helper Text',
			get value() {
				return $.get(valueHelperText);
			},

			set value($$value) {
				$.set(valueHelperText, $$value, true);
			},
			helperText,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_4 = $.first_child(fragment_3);

				Option(node_4, { value: '' });

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => fruits, $.index, ($$anchor, fruit) => {
					Option($$anchor, {
						get value() {
							return $.get(fruit);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(fruit)));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { helperText: true, default: true }
		});
	}

	var pre_1 = $.sibling(node_3, 2);
	var text_4 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	{
		const leadingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('event');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		};

		Select(node_6, {
			variant: 'outlined',
			label: 'Leading Icon',
			get value() {
				return $.get(valueLeadingIcon);
			},

			set value($$value) {
				$.set(valueLeadingIcon, $$value, true);
			},
			leadingIcon,
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root();
				var node_7 = $.first_child(fragment_7);

				Option(node_7, { value: '' });

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => fruits, $.index, ($$anchor, fruit) => {
					Option($$anchor, {
						get value() {
							return $.get(fruit);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(fruit)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { leadingIcon: true, default: true }
		});
	}

	var pre_2 = $.sibling(node_6, 2);
	var text_7 = $.only_child(pre_2);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_9 = $.child(div_4);

	Select(node_9, {
		variant: 'outlined',
		invalid: true,
		label: 'Invalid',
		get value() {
			return $.get(valueInvalid);
		},

		set value($$value) {
			$.set(valueInvalid, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root();
			var node_10 = $.first_child(fragment_10);

			Option(node_10, { value: '' });

			var node_11 = $.sibling(node_10, 2);

			$.each(node_11, 17, () => fruits, $.index, ($$anchor, fruit) => {
				Option($$anchor, {
					get value() {
						return $.get(fruit);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(fruit)));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var pre_3 = $.sibling(node_9, 2);
	var text_9 = $.only_child(pre_3);

	$.reset(div_4);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, `Selected: ${$.get(value) ?? ''}`);
		$.set_text(text_4, `Selected: ${$.get(valueHelperText) ?? ''}`);
		$.set_text(text_7, `Selected: ${$.get(valueLeadingIcon) ?? ''}`);
		$.set_text(text_9, `Selected: ${$.get(valueInvalid) ?? ''}`);
	});

	$.append($$anchor, div);
}