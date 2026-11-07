import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, ButtonGroupText } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Button_group_with_text($$anchor) {
	Example($$anchor, {
		title: 'With Text',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			ButtonGroup(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ButtonGroupText(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Text');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Another Button');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			ButtonGroup(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Label($$anchor, $.spread_props({ for: 'input-text' }, props, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('GPU Size');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							}));
						};

						ButtonGroupText(node_4, { child, $$slots: { child: true } });
					}

					var node_5 = $.sibling(node_4, 2);

					Input(node_5, { id: 'input-text', placeholder: 'Type something here...' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}