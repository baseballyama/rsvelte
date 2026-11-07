import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Toggle from '$lib/components/ui/toggle.svelte';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);

export default function Theme_toggle($$anchor) {
	let theme = $.state('light');
	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $.get(theme) === 'dark');
		let $1 = $.derived(() => $.get(theme) === 'dark' ? 'light' : 'dark');

		Toggle(node, {
			variant: 'outline',
			class: 'group text-muted-foreground data-[state=on]:text-muted-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground size-8 rounded-full border-none shadow-none data-[state=on]:bg-transparent',
			get pressed() {
				return $.get($0);
			},
			onPressedChange: () => $.set(theme, $.get(theme) === 'dark' ? 'light' : 'dark', true),
			get 'aria-label'() {
				return `Switch to ${$.get($1) ?? ''} mode`;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				MoonIcon(node_1, {
					size: 16,
					class: 'shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100',
					'aria-hidden': 'true'
				});

				var node_2 = $.sibling(node_1, 2);

				SunIcon(node_2, {
					size: 16,
					class: 'absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0',
					'aria-hidden': 'true'
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}