import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Password from '$lib/components/ui/password';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full max-w-3xs flex-col gap-2"><!></div>`);

export default function Password_1($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Password.Root, ($$anchor, Password_Root) => {
		Password_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Password.Input, ($$anchor, Password_Input) => {
					Password_Input($$anchor, {
						placeholder: 'Password',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Password.ToggleVisibility, ($$anchor, Password_ToggleVisibility) => {
								Password_ToggleVisibility($$anchor, {});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Password.Strength, ($$anchor, Password_Strength) => {
					Password_Strength($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}