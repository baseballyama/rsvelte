import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TimeField } from "bits-ui";

var root = $.from_html(`<div class="inline-block select-none"><!></div>`);
var root_1 = $.from_html(`<div class="flex w-full max-w-[280px] flex-col gap-1.5"><!> <!></div>`);

export default function Time_field_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => TimeField.Root, ($$anchor, TimeField_Root) => {
		TimeField_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var div = root_1();
				var node_1 = $.child(div);

				$.component(node_1, () => TimeField.Label, ($$anchor, TimeField_Label) => {
					TimeField_Label($$anchor, {
						class: 'block select-none text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Appointment Time');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let segments = () => ($$arg0?.()).segments;
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.each(node_3, 19, segments, ({ part, value }, i) => part + i, ($$anchor, $$item) => {
							let part = () => $.get($$item).part;
							let value = () => $.get($$item).value;
							var div_1 = root();
							var node_4 = $.child(div_1);

							{
								var consequent = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => TimeField.Segment, ($$anchor, TimeField_Segment) => {
										TimeField_Segment($$anchor, {
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

									$.append($$anchor, fragment_2);
								};

								var alternate = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => TimeField.Segment, ($$anchor, TimeField_Segment_1) => {
										TimeField_Segment_1($$anchor, {
											get part() {
												return part();
											},
											class: 'rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground data-invalid:text-destructive focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, value()));
												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_4, ($$render) => {
									if (part() === "literal") $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div_1);
							$.append($$anchor, div_1);
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_2, () => TimeField.Input, ($$anchor, TimeField_Input) => {
						TimeField_Input($$anchor, {
							name: 'hello',
							class: 'h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover data-invalid:border-destructive flex w-full select-none items-center border px-2 py-3 text-sm tracking-[0.01em] ',
							children,
							$$slots: { default: true }
						});
					});
				}

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}