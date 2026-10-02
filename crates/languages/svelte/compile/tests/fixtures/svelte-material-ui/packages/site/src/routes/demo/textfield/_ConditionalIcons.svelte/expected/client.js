import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import Button from '@smui/button';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div> <div><!> <!></div>`, 1);

export default function _ConditionalIcons($$anchor) {
	let valueA = $.state('');
	let valueB = $.state('');
	let valueC = $.state('');
	let showLeadingIcons = $.state(true);
	let showTrailingIcons = $.state(true);
	var fragment = root();
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

		const trailingIcon = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			{
				var consequent_1 = ($$anchor) => {
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

				$.if(node_2, ($$render) => {
					if ($.get(showTrailingIcons)) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_3);
		};

		Textfield(node, {
			get withLeadingIcon() {
				return $.get(showLeadingIcons);
			},

			get withTrailingIcon() {
				return $.get(showTrailingIcons);
			},
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
	var node_3 = $.child(div_2);

	{
		const leadingIcon = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_4 = $.first_child(fragment_5);

			{
				var consequent_2 = ($$anchor) => {
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

				$.if(node_4, ($$render) => {
					if ($.get(showLeadingIcons)) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_5);
		};

		const trailingIcon = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_5 = $.first_child(fragment_7);

			{
				var consequent_3 = ($$anchor) => {
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

				$.if(node_5, ($$render) => {
					if ($.get(showTrailingIcons)) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_7);
		};

		Textfield(node_3, {
			get withLeadingIcon() {
				return $.get(showLeadingIcons);
			},

			get withTrailingIcon() {
				return $.get(showTrailingIcons);
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
			trailingIcon,
			$$slots: { leadingIcon: true, trailingIcon: true }
		});
	}

	var pre_1 = $.sibling(node_3, 2);
	var text_5 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	{
		const leadingIcon = ($$anchor) => {
			var fragment_9 = $.comment();
			var node_7 = $.first_child(fragment_9);

			{
				var consequent_4 = ($$anchor) => {
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

				$.if(node_7, ($$render) => {
					if ($.get(showLeadingIcons)) $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_9);
		};

		const trailingIcon = ($$anchor) => {
			var fragment_11 = $.comment();
			var node_8 = $.first_child(fragment_11);

			{
				var consequent_5 = ($$anchor) => {
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

				$.if(node_8, ($$render) => {
					if ($.get(showTrailingIcons)) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment_11);
		};

		Textfield(node_6, {
			get withLeadingIcon() {
				return $.get(showLeadingIcons);
			},

			get withTrailingIcon() {
				return $.get(showTrailingIcons);
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
			trailingIcon,
			$$slots: { leadingIcon: true, trailingIcon: true }
		});
	}

	var pre_2 = $.sibling(node_6, 2);
	var text_8 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var node_9 = $.child(div_4);

	Button(node_9, {
		onclick: () => $.set(showLeadingIcons, !$.get(showLeadingIcons)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Toggle Leading Icons');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Button(node_10, {
		onclick: () => $.set(showTrailingIcons, !$.get(showTrailingIcons)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Toggle Trailing Icons');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	$.template_effect(() => {
		$.set_text(text_2, `Value: ${$.get(valueA) ?? ''}`);
		$.set_text(text_5, `Value: ${$.get(valueB) ?? ''}`);
		$.set_text(text_8, `Value: ${$.get(valueC) ?? ''}`);
	});

	$.append($$anchor, fragment);
}