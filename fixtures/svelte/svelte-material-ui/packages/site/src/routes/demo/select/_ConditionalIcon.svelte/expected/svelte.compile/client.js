import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select, { Option } from '@smui/select';
import Icon from '@smui/select/icon';
import Button from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div> <div><!></div>`, 1);

export default function _ConditionalIcon($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueA = $.state('');
	let valueB = $.state('');
	let valueC = $.state('');
	let showLeadingIcons = $.state(true);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const leadingIcon = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
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

				$.if(node_1, ($$render) => {
					if ($.get(showLeadingIcons)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		Select(node, {
			get withLeadingIcon() {
				return $.get(showLeadingIcons);
			},
			label: 'Standard',
			get value() {
				return $.get(valueA);
			},

			set value($$value) {
				$.set(valueA, $$value, true);
			},
			leadingIcon,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_2 = $.first_child(fragment_3);

				Option(node_2, { value: '' });

				var node_3 = $.sibling(node_2, 2);

				$.each(node_3, 17, () => fruits, $.index, ($$anchor, fruit) => {
					Option($$anchor, {
						get value() {
							return $.get(fruit);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(fruit)));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { leadingIcon: true, default: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_2 = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	{
		const leadingIcon = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_5 = $.first_child(fragment_6);

			{
				var consequent_1 = ($$anchor) => {
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

				$.if(node_5, ($$render) => {
					if ($.get(showLeadingIcons)) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_6);
		};

		Select(node_4, {
			get withLeadingIcon() {
				return $.get(showLeadingIcons);
			},
			variant: 'filled',
			label: 'Filled',
			get value() {
				return $.get(valueB);
			},

			set value($$value) {
				$.set(valueB, $$value, true);
			},
			leadingIcon,
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root();
				var node_6 = $.first_child(fragment_8);

				Option(node_6, { value: '' });

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => fruits, $.index, ($$anchor, fruit) => {
					Option($$anchor, {
						get value() {
							return $.get(fruit);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(fruit)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { leadingIcon: true, default: true }
		});
	}

	var pre_1 = $.sibling(node_4, 2);
	var text_5 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_8 = $.child(div_3);

	{
		const leadingIcon = ($$anchor) => {
			var fragment_11 = $.comment();
			var node_9 = $.first_child(fragment_11);

			{
				var consequent_2 = ($$anchor) => {
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

				$.if(node_9, ($$render) => {
					if ($.get(showLeadingIcons)) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_11);
		};

		Select(node_8, {
			get withLeadingIcon() {
				return $.get(showLeadingIcons);
			},
			variant: 'outlined',
			label: 'Outlined',
			get value() {
				return $.get(valueC);
			},

			set value($$value) {
				$.set(valueC, $$value, true);
			},
			leadingIcon,
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = root();
				var node_10 = $.first_child(fragment_13);

				Option(node_10, { value: '' });

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => fruits, $.index, ($$anchor, fruit) => {
					Option($$anchor, {
						get value() {
							return $.get(fruit);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(fruit)));
							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_13);
			},
			$$slots: { leadingIcon: true, default: true }
		});
	}

	var pre_2 = $.sibling(node_8, 2);
	var text_8 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var node_12 = $.child(div_4);

	Button(node_12, {
		onclick: () => $.set(showLeadingIcons, !$.get(showLeadingIcons)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Toggle Leading Icons');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	$.template_effect(() => {
		$.set_text(text_2, `Selected: ${$.get(valueA) ?? ''}`);
		$.set_text(text_5, `Selected: ${$.get(valueB) ?? ''}`);
		$.set_text(text_8, `Selected: ${$.get(valueC) ?? ''}`);
	});

	$.append($$anchor, fragment);
}