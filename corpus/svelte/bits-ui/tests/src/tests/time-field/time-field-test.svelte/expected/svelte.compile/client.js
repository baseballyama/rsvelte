import 'svelte/internal/disclose-version';
import { TimeField } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'placeholder',
	'name'
]);

var root = $.from_html(`<div><!> <!></div>`);
var root_1 = $.from_html(`<main><button data-testid="reset">Reset</button> <div data-testid="value"> </div> <!></main>`);

export default function Time_field_test($$anchor, $$props) {
	let value = $.prop($$props, 'value', 7),
		placeholder = $.prop($$props, 'placeholder', 7),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_1();
	var button = $.child(main);
	var div = $.sibling(button, 2);
	var text = $.only_child(div, true);
	var node = $.sibling(div, 2);

	$.component(node, () => TimeField.Root, ($$anchor, TimeField_Root) => {
		TimeField_Root($$anchor, $.spread_props(() => restProps, {
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			get placeholder() {
				return placeholder();
			},

			set placeholder($$value) {
				placeholder($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var div_1 = root();
				var node_1 = $.child(div_1);

				$.component(node_1, () => TimeField.Label, ($$anchor, TimeField_Label) => {
					TimeField_Label($$anchor, {
						'data-testid': 'label',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Label');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let segments = () => ($$arg0?.()).segments;
						var fragment = $.comment();
						var node_3 = $.first_child(fragment);

						$.each(node_3, 17, segments, $.index, ($$anchor, $$item, i, $$array) => {
							let part = () => $.get($$item).part;
							let value = () => $.get($$item).value;
							var fragment_1 = $.comment();
							var node_4 = $.first_child(fragment_1);

							{
								let $0 = $.derived(() => part() === "literal" ? undefined : part());

								$.component(node_4, () => TimeField.Segment, ($$anchor, TimeField_Segment) => {
									TimeField_Segment($$anchor, {
										get part() {
											return part();
										},

										get 'data-testid'() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, value()));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_1);
						});

						$.append($$anchor, fragment);
					};

					$.component(node_2, () => TimeField.Input, ($$anchor, TimeField_Input) => {
						TimeField_Input($$anchor, {
							'data-testid': 'input',
							get name() {
								return $$props.name;
							},
							children,
							$$slots: { default: true }
						});
					});
				}

				$.reset(div_1);
				$.append($$anchor, div_1);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(main);
	$.template_effect(() => $.set_text(text, value()));
	$.delegated('click', button, () => value(undefined));
	$.append($$anchor, main);
}

$.delegate(['click']);