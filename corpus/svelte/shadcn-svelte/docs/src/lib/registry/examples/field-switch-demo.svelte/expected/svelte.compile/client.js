import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_switch_demo($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
		Field_Field($$anchor, {
			orientation: 'horizontal',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Content, ($$anchor, Field_Content) => {
					Field_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
								Field_Label($$anchor, {
									for: '2fa',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Multi-factor authentication');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Field.Description, ($$anchor, Field_Description) => {
								Field_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Enable multi-factor authentication. If you do not have a two-factor device, you can use a\n				one-time code sent to your email.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				Switch(node_4, { id: '2fa' });
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}