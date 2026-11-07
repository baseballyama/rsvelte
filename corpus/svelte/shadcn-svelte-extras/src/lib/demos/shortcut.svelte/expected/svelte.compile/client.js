import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd, KbdGroup } from '$lib/components/ui/kbd';
import { toast } from 'svelte-sonner';
import { shortcut } from '$lib/actions/shortcut.svelte';
import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';

var root = $.from_html(`<!> <span>+</span> <!>`, 1);
var root_1 = $.from_html(`<p class="flex place-items-center justify-center gap-1"><!></p>`);

export default function Shortcut($$anchor, $$props) {
	$.push($$props, true);

	var p = root_1();

	$.action($.window, ($$node, $$action_arg) => shortcut?.($$node, $$action_arg), () => ({
		key: '1',
		ctrl: true,
		callback: () => toast.success(`You pressed ${cmdOrCtrl} + 1`)
	}));

	var node = $.child(p);

	KbdGroup(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Kbd(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, cmdOrCtrl));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 4);

			Kbd(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('1');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(p);
	$.append($$anchor, p);
	$.pop();
}