import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput } from '$lib/components/ui/phone-input';
import Button from '$lib/components/button.svelte';
import * as FieldSet from '$lib/components/ui/field-set';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="text-muted-foreground text-sm">Add your phone number.</span> <!>`, 1);

export default function Phone_number_setting($$anchor) {
	let loading = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => FieldSet.Root, ($$anchor, FieldSet_Root) => {
		FieldSet_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => FieldSet.Content, ($$anchor, FieldSet_Content) => {
					FieldSet_Content($$anchor, {
						class: 'flex flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => FieldSet.Title, ($$anchor, FieldSet_Title) => {
								FieldSet_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Phone Number');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							PhoneInput(node_3, { value: '+1 418 543 8090' });
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => FieldSet.Footer, ($$anchor, FieldSet_Footer) => {
					FieldSet_Footer($$anchor, {
						class: 'flex place-items-center justify-between',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_5 = $.sibling($.first_child(fragment_3), 2);

							Button(node_5, {
								get loading() {
									return $.get(loading);
								},
								size: 'sm',
								onclick: () => {
									$.set(loading, true);

									setTimeout(
										() => {
											$.set(loading, false);
										},
										500
									);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Save');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}