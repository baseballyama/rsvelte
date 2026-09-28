import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<hr class="hr"/>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid gap-2 w-full"></div>`);

export default function List($$anchor) {
	var div = root_3();

	$.each(div, 22, () => ['Label 1', 'Label 2', 'Label 3'], (label) => label, ($$anchor, label, i) => {
		var fragment = root_2();
		var node = $.first_child(fragment);

		Switch(node, {
			class: 'flex justify-between p-2',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Switch.Label, ($$anchor, Switch_Label) => {
					Switch_Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, label));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Switch.Control, ($$anchor, Switch_Control) => {
					Switch_Control($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
								Switch_Thumb($$anchor, {});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
					Switch_HiddenInput($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});

		var node_5 = $.sibling(node, 2);

		{
			var consequent = ($$anchor) => {
				var hr = root_1();

				$.append($$anchor, hr);
			};

			$.if(node_5, ($$render) => {
				if ($.get(i) < 2) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
}