import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Password from '$lib/components/ui/password';

var root = $.from_html(`<!> <div class="flex flex-col gap-1"><!> <span class="text-muted-foreground text-sm"> </span></div>`, 1);
var root_1 = $.from_html(`<div class="flex w-full max-w-3xs flex-col gap-2"><!></div>`);

export default function Password_strength($$anchor) {
	const SCORE_NAMING = ['Poor', 'Weak', 'Average', 'Strong', 'Secure'];
	let strength = $.state(void 0);
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Password.Root, ($$anchor, Password_Root) => {
		Password_Root($$anchor, {
			minScore: 2,
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Password.Input, ($$anchor, Password_Input) => {
					Password_Input($$anchor, {
						value: '$ecretpa$$word',
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

				var div_1 = $.sibling(node_1, 2);
				var node_3 = $.child(div_1);

				$.component(node_3, () => Password.Strength, ($$anchor, Password_Strength) => {
					Password_Strength($$anchor, {
						get strength() {
							return $.get(strength);
						},

						set strength($$value) {
							$.set(strength, $$value, true);
						}
					});
				});

				var span = $.sibling(node_3, 2);
				var text = $.only_child(span, true);

				$.reset(div_1);
				$.template_effect(() => $.set_text(text, SCORE_NAMING[$.get(strength)?.score ?? 0]));
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}