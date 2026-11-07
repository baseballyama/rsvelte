import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toaster as Sonner } from 'svelte-sonner';
import { mode } from 'mode-watcher';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Sonner_1($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	Sonner($$anchor, $.spread_props(
		{
			get theme() {
				return mode.current;
			},
			class: 'toaster group',
			toastOptions: {
				classes: {
					toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
					description: 'group-[.toast]:text-muted-foreground',
					actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
					cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
				}
			}
		},
		() => restProps
	));

	$.pop();
}