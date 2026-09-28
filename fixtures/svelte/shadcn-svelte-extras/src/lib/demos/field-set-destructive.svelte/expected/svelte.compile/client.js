import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import * as FieldSet from '$lib/components/ui/field-set';
import * as Field from '$lib/components/ui/field';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full place-items-center justify-between"><span class="text-muted-foreground text-sm">Rename your project.</span> <!></div>`);
var root_2 = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Field_set_destructive($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => FieldSet.Root, ($$anchor, FieldSet_Root) => {
		FieldSet_Root($$anchor, {
			variant: 'destructive',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => FieldSet.Content, ($$anchor, FieldSet_Content) => {
					FieldSet_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										Label(node_3, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Project Name');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_4 = $.sibling(node_3, 2);

										Input(node_4, { value: 'ieedan/std', class: 'max-w-[225px]' });
										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => FieldSet.Footer, ($$anchor, FieldSet_Footer) => {
					FieldSet_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_1();
							var node_6 = $.sibling($.child(div_1), 2);

							Button(node_6, {
								variant: 'destructive',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Rename');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}