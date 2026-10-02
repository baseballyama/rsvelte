import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd, KbdGroup } from '$lib/components/ui/kbd';
import Button from '$lib/components/button.svelte';
import SearchIcon from '@lucide/svelte/icons/search';
import { cn } from '$lib/utils.js';
import { commandContext } from '$lib/context';
import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';

var root = $.from_html(`<!> <span>+</span> <!>`, 1);
var root_1 = $.from_html(`<span class="text-muted-foreground flex place-items-center gap-2"><!> Search</span> <!>`, 1);

export default function Search_button($$anchor, $$props) {
	$.push($$props, true);

	const commandState = commandContext.get();

	{
		let $0 = $.derived(() => cn('flex w-full place-items-center justify-between px-2', $$props.class));

		Button($$anchor, {
			variant: 'outline',
			get class() {
				return $.get($0);
			},

			get onclick() {
				return commandState.setTrue;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var span = $.first_child(fragment_1);
				var node = $.child(span);

				SearchIcon(node, { class: 'inline size-4' });
				$.next();
				$.reset(span);

				var node_1 = $.sibling(span, 2);

				KbdGroup(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Kbd(node_2, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, cmdOrCtrl));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 4);

						Kbd(node_3, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('K');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}