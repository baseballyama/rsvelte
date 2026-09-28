import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<nav class="contents"><a class="anchor" href="/docs/design/themes">Themes</a> <a class="anchor" href="/docs/design/colors">Colors</a> <a class="anchor" href="/docs/tailwind-utilities/presets">Presets</a> <a class="anchor" href="/docs/design/typography">Typography</a> <a class="anchor" href="/docs/design/spacing">Spacing</a> <a class="anchor" href="/docs/design/iconography">Iconography</a></nav>`);
var root_1 = $.from_html(`<div class="w-full flex justify-between items-center"><p class="font-bold">Design System</p> <!></div> <!>`, 1);

export default function Default($$anchor) {
	Collapsible($$anchor, {
		class: 'items-start card preset-filled-surface-100-900 p-4 w-56 mx-auto',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.sibling($.child(div), 2);

			$.component(node, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
				Collapsible_Trigger($$anchor, {
					class: 'btn-icon hover:preset-tonal',
					children: ($$anchor, $$slotProps) => {
						ArrowUpDownIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);

			$.component(node_1, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
				Collapsible_Content($$anchor, {
					class: 'flex flex-col gap-2',
					children: ($$anchor, $$slotProps) => {
						var nav = root();

						$.append($$anchor, nav);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}