import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "bits-ui";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'items',
	'disabledItems',
	'readonlyItems',
	'type',
	'onFormSubmit',
	'getValue',
	'setValue'
]);

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main><form method="POST"><p data-testid="binding"> </p> <!> <button type="submit" data-testid="submit">Submit</button></form> <button data-testid="update">Programmatic update</button></main>`);

export default function Checkbox_group_test($$anchor, $$props) {
	$.push($$props, true);

	const /**
	 * The individual checkbox items.
	 */
	MyCheckbox = ($$anchor, $$arg0) => {
		let itemValue = () => ($$arg0?.()).itemValue;
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			const children = ($$anchor, $$arg0) => {
				let checked = () => ($$arg0?.()).checked;
				let indeterminate = () => ($$arg0?.()).indeterminate;
				var span = root();
				var node_1 = $.child(span);

				{
					var consequent = ($$anchor) => {
						var text = $.text('indeterminate');

						$.append($$anchor, text);
					};

					var alternate = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, checked()));
						$.append($$anchor, text_1);
					};

					$.if(node_1, ($$render) => {
						if (indeterminate()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(span);
				$.template_effect(() => $.set_attribute(span, 'data-testid', `${itemValue() ?? ''}-indicator`));
				$.append($$anchor, span);
			};

			let $0 = $.derived(() => disabledItems()?.includes(itemValue()));
			let $1 = $.derived(() => readonlyItems()?.includes(itemValue()));

			$.component(node, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
				Checkbox_Root($$anchor, {
					get 'data-testid'() {
						return `${itemValue() ?? ''}-checkbox`;
					},

					get value() {
						return itemValue();
					},

					get disabled() {
						return $.get($0);
					},

					get readonly() {
						return $.get($1);
					},

					get type() {
						return $$props.type;
					},
					children,
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment);
	};

	let valueProp = $.prop($$props, 'value', 27, () => $.proxy([])),
		items = $.prop($$props, 'items', 19, () => []),
		disabledItems = $.prop($$props, 'disabledItems', 19, () => []),
		readonlyItems = $.prop($$props, 'readonlyItems', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	let myValue = $.state($.proxy(valueProp()));
	var main = root_2();
	var form = $.child(main);
	var p = $.child(form);
	var text_2 = $.only_child(p, true);
	var node_2 = $.sibling(p, 2);

	var bind_get = () => {
		$$props.getValue?.();

		return $.get(myValue);
	};

	var bind_set = (v) => {
		$$props.setValue?.(v);
		$.set(myValue, v, true);
	};

	$.component(node_2, () => Checkbox.Group, ($$anchor, Checkbox_Group) => {
		Checkbox_Group($$anchor, $.spread_props(
			{
				'data-testid': 'group',
				get value() {
					return bind_get();
				},

				set value($$value) {
					bind_set($$value);
				}
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.first_child(fragment_2);

					$.component(node_3, () => Checkbox.GroupLabel, ($$anchor, Checkbox_GroupLabel) => {
						Checkbox_GroupLabel($$anchor, {
							'data-testid': 'group-label',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('My Group');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					});

					var node_4 = $.sibling(node_3, 2);

					$.each(node_4, 16, items, (itemValue) => itemValue, ($$anchor, itemValue) => {
						MyCheckbox($$anchor, () => ({ itemValue }));
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}
		));
	});

	$.next(2);
	$.reset(form);

	var button = $.sibling(form, 2);

	$.reset(main);
	$.template_effect(() => $.set_text(text_2, $.get(myValue)));

	$.event('submit', form, (e) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		$$props.onFormSubmit?.(formData);
	});

	$.delegated('click', button, () => $.set(myValue, ["c", "d"], true));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);