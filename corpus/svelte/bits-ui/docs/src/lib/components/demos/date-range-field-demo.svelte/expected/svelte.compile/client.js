import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateRangeField } from "bits-ui";

var root = $.from_html(`<div class="inline-block select-none"><!></div>`);
var root_1 = $.from_html(`<div aria-hidden="true" class="text-muted-foreground px-1">–⁠⁠⁠⁠⁠</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover group-data-invalid:border-destructive flex w-full select-none items-center border px-2 py-3 text-sm tracking-[0.01em]"></div>`, 1);

export default function Date_range_field_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DateRangeField.Root, ($$anchor, DateRangeField_Root) => {
		DateRangeField_Root($$anchor, {
			class: 'group flex w-full max-w-[320px] flex-col gap-1.5',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => DateRangeField.Label, ($$anchor, DateRangeField_Label) => {
					DateRangeField_Label($$anchor, {
						class: 'block select-none text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Hotel dates');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var div = $.sibling(node_1, 2);

				$.each(div, 20, () => ["start", "end"], (type) => type, ($$anchor, type) => {
					var fragment_2 = root_2();
					var node_2 = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let segments = () => ($$arg0?.()).segments;
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 19, segments, ({ part, value }, i) => part + i, ($$anchor, $$item) => {
								let part = () => $.get($$item).part;
								let value = () => $.get($$item).value;
								var div_1 = root();
								var node_4 = $.child(div_1);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => DateRangeField.Segment, ($$anchor, DateRangeField_Segment) => {
											DateRangeField_Segment($$anchor, {
												get part() {
													return part();
												},
												class: 'text-muted-foreground p-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, value()));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var fragment_6 = $.comment();
										var node_6 = $.first_child(fragment_6);

										$.component(node_6, () => DateRangeField.Segment, ($$anchor, DateRangeField_Segment_1) => {
											DateRangeField_Segment_1($$anchor, {
												get part() {
													return part();
												},
												class: 'rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, value()));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									};

									$.if(node_4, ($$render) => {
										if (part() === "literal") $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.reset(div_1);
								$.append($$anchor, div_1);
							});

							$.append($$anchor, fragment_3);
						};

						$.component(node_2, () => DateRangeField.Input, ($$anchor, DateRangeField_Input) => {
							DateRangeField_Input($$anchor, {
								get type() {
									return type;
								},
								children,
								$$slots: { default: true }
							});
						});
					}

					var node_7 = $.sibling(node_2, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_2 = root_1();

							$.append($$anchor, div_2);
						};

						$.if(node_7, ($$render) => {
							if (type === "start") $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.reset(div);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}