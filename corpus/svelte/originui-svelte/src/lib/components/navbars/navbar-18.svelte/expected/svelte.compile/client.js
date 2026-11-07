import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '../ui/button.svelte';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import UploadIcon from '@lucide/svelte/icons/upload';
import { AppToggle, TeamSwitcher } from '$lib/components/_extras/navbars';

var root = $.from_html(`<!> <span class="max-sm:sr-only">Export</span>`, 1);
var root_1 = $.from_html(`<!> <span class="max-sm:sr-only">Upgrade</span>`, 1);
var root_2 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex flex-1 items-center gap-2"><!></div> <!> <div class="flex flex-1 items-center justify-end gap-2"><!> <!></div></div></header>`);

export default function Navbar_18($$anchor) {
	const teams = ['Acme Inc.', 'Origin UI - Svelte', 'Junon'];
	var header = root_2();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	TeamSwitcher(node, {
		get teams() {
			return teams;
		},

		get defaultTeam() {
			return teams[0];
		}
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	AppToggle(node_1, {});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	Button(node_2, {
		size: 'sm',
		variant: 'ghost',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			UploadIcon(node_3, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		size: 'sm',
		class: 'aspect-square text-sm max-sm:p-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_5 = $.first_child(fragment_1);

			SparklesIcon(node_5, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}