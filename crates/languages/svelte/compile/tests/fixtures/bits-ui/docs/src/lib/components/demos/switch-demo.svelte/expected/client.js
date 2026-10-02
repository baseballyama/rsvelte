import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Switch } from "bits-ui";

var root = $.from_html(`<div class="flex items-center space-x-3"><!> <!></div>`);

export default function Switch_demo($$anchor) {
	var div = root();
	var node = $.child(div);

	$.component(node, () => Switch.Root, ($$anchor, Switch_Root) => {
		Switch_Root($$anchor, {
			id: 'dnd',
			name: 'hello',
			class: 'focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-foreground data-[state=unchecked]:bg-dark-10 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-foreground focus-visible:outline-hidden peer inline-flex h-[36px] min-h-[36px] w-[60px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
					Switch_Thumb($$anchor, {
						class: 'bg-background data-[state=unchecked]:shadow-mini dark:border-background/30 dark:bg-foreground dark:shadow-popover pointer-events-none block size-[30px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border'
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Label.Root, ($$anchor, Label_Root) => {
		Label_Root($$anchor, {
			for: 'dnd',
			class: 'text-sm font-medium',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Do not disturb');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}