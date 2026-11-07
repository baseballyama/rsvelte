import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Text } from '@svelteuidev/core';
import { hotkey } from '@svelteuidev/composables';

const code = `
<script>
    import { hotkey } from '@svelteuidev/composables';

    function onSubmit() {
        alert("You've used a hotkey");
    }
<\/script>

<p>Press ⌘+Enter or Ctrl+Enter to trigger an alert</p>
<div use:hotkey={[['mod+Enter', () => onSubmit()]]}/>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <div></div>`, 1);

export default function Usage($$anchor) {
	function onSubmit() {
		alert("You've used a hotkey");
	}

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Text(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Press ⌘+Enter or Ctrl+Enter to trigger an alert');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);

			$.action(div, ($$node, $$action_arg) => hotkey?.($$node, $$action_arg), () => [['mod+Enter', () => onSubmit()]]);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}