import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-4"><!> <p><span class="opacity-60">Checked:</span> <code class="code"> </code></p></div>`);

export default function Default($$anchor) {
	let checked = $.state(false);
	var div = root_1();
	var node = $.child(div);

	Switch(node, {
		get checked() {
			return $.get(checked);
		},
		onCheckedChange: (details) => $.set(checked, details.checked, true),
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Switch.Control, ($$anchor, Switch_Control) => {
				Switch_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_1, 2);

			$.component(node_3, () => Switch.Label, ($$anchor, Switch_Label) => {
				Switch_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Label');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_3, 2);

			$.component(node_4, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
				Switch_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 2);
	var code = $.sibling($.child(p), 2);
	var text_1 = $.only_child(code, true);

	$.reset(p);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, $.get(checked)));
	$.append($$anchor, div);
}