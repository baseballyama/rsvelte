import 'svelte/internal/disclose-version';
import { DateRangeField } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'placeholder',
	'startProps',
	'endProps'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main><div data-testid="value"> </div> <div data-testid="start-value"> </div> <div data-testid="end-value"> </div> <!></main>`);

export default function Date_range_field_test($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 7),
		placeholder = $.prop($$props, 'placeholder', 7),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_1();
	var div = $.child(main);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2, true);
	var node = $.sibling(div_2, 2);

	$.component(node, () => DateRangeField.Root, ($$anchor, DateRangeField_Root) => {
		DateRangeField_Root($$anchor, $.spread_props(() => restProps, {
			'data-testid': 'root',
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
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => DateRangeField.Label, ($$anchor, DateRangeField_Label) => {
					DateRangeField_Label($$anchor, {
						'data-testid': 'label',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Label');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.each(node_2, 16, () => ["start", "end"], (type) => type, ($$anchor, type) => {
					const inputProps = $.derived(() => type === "start" ? $$props.startProps : $$props.endProps);
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					{
						const children = ($$anchor, $$arg0) => {
							let segments = () => ($$arg0?.()).segments;
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.each(node_4, 17, segments, $.index, ($$anchor, $$item, i, $$array) => {
								let part = () => $.get($$item).part;
								let value = () => $.get($$item).value;
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => part() === "literal" ? undefined : `${type}-${part()}`);

									$.component(node_5, () => DateRangeField.Segment, ($$anchor, DateRangeField_Segment) => {
										DateRangeField_Segment($$anchor, {
											get part() {
												return part();
											},

											get 'data-testid'() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text();

												$.template_effect(() => $.set_text(text_4, value()));
												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						};

						$.component(node_3, () => DateRangeField.Input, ($$anchor, DateRangeField_Input) => {
							DateRangeField_Input($$anchor, $.spread_props(
								{
									get 'data-testid'() {
										return `${type ?? ''}-input`;
									},

									get type() {
										return type;
									}
								},
								() => $.get(inputProps),
								{ children, $$slots: { default: true } }
							));
						});
					}

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(main);

	$.template_effect(() => {
		$.set_text(text, value());
		$.set_text(text_1, value()?.start);
		$.set_text(text_2, value()?.end);
	});

	$.append($$anchor, main);
	$.pop();
}