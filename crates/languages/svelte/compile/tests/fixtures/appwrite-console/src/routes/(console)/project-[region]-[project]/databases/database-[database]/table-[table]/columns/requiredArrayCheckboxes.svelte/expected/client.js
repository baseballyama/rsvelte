import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Selector, Tooltip } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function RequiredArrayCheckboxes($$anchor, $$props) {
	$.push($$props, true);

	let required = $.prop($$props, 'required', 15, false),
		array = $.prop($$props, 'array', 15, false),
		editing = $.prop($$props, 'editing', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false);

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => !array() || disabled());

		Tooltip(node, {
			get disabled() {
				return $.get($0);
			},
			maxWidth: '275px',
			placement: 'bottom-start',
			children: ($$anchor, $$slotProps) => {
				var div = root();

				$.set_style(div, '', {}, { width: 'fit-content' });

				var node_1 = $.child(div);

				{
					let $0 = $.derived(() => array() || disabled());

					$.component(node_1, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
						Selector_Checkbox($$anchor, {
							size: 's',
							id: 'required',
							label: 'Required',
							get disabled() {
								return $.get($0);
							},
							description: 'Indicate whether this column is required.',
							get checked() {
								return required();
							},

							set checked($$value) {
								required($$value);
							}
						});
					});
				}

				$.reset(div);
				$.append($$anchor, div);
			},

			$$slots: {
				default: true,
				tooltip: ($$anchor, $$slotProps) => {
					var text = $.text('Required cannot be selected because array columns may contain more than one value.');

					$.append($$anchor, text);
				}
			}
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => !(required() || editing()) || disabled());

		Tooltip(node_2, {
			get disabled() {
				return $.get($0);
			},
			maxWidth: '275px',
			placement: 'bottom-start',
			children: ($$anchor, $$slotProps) => {
				var div_1 = root();

				$.set_style(div_1, '', {}, { width: 'fit-content' });

				var node_3 = $.child(div_1);

				{
					let $0 = $.derived(() => required() || editing() || disabled());

					$.component(node_3, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_1) => {
						Selector_Checkbox_1($$anchor, {
							size: 's',
							id: 'array',
							label: 'Array',
							get disabled() {
								return $.get($0);
							},
							description: 'Indicate whether this column is an array. Defaults to an empty array.',
							get checked() {
								return array();
							},

							set checked($$value) {
								array($$value);
							}
						});
					});
				}

				$.reset(div_1);
				$.append($$anchor, div_1);
			},

			$$slots: {
				default: true,
				tooltip: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_4 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var text_1 = $.text('Array cannot be selected to avoid data incompatibility.');

							$.append($$anchor, text_1);
						};

						var alternate = ($$anchor) => {
							var text_2 = $.text('Array cannot be selected because required columns must be populated in all rows with a\n            single value.');

							$.append($$anchor, text_2);
						};

						$.if(node_4, ($$render) => {
							if (editing()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				}
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}