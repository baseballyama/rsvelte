import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateField } from "bits-ui";

var root = $.from_html(`<div class="inline-block select-none"><!></div>`);

export default function Date_field($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DateField.Root, ($$anchor, DateField_Root) => {
		DateField_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					const children = ($$anchor, $$arg0) => {
						let segments = () => ($$arg0?.()).segments;
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.each(node_2, 19, segments, ({ part, value }, i) => part + i, ($$anchor, $$item) => {
							let part = () => $.get($$item).part;
							let value = () => $.get($$item).value;
							var div = root();
							var node_3 = $.child(div);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => DateField.Segment, ($$anchor, DateField_Segment) => {
										DateField_Segment($$anchor, {
											get part() {
												return part();
											},
											class: 'text-muted-foreground p-1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, value()));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								};

								var alternate = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									$.component(node_5, () => DateField.Segment, ($$anchor, DateField_Segment_1) => {
										DateField_Segment_1($$anchor, {
											get part() {
												return part();
											},
											class: 'rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground data-invalid:text-destructive focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, value()));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								};

								$.if(node_3, ($$render) => {
									if (part() === "literal") $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div);
							$.append($$anchor, div);
						});

						$.append($$anchor, fragment_2);
					};

					$.component(node_1, () => DateField.Input, ($$anchor, DateField_Input) => {
						DateField_Input($$anchor, {
							class: 'h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover data-invalid:border-destructive flex w-full select-none items-center border px-2 py-3 text-sm tracking-[0.01em] ',
							children,
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}