import * as $ from 'svelte/internal/server';
import { Toaster as Sonner } from 'svelte-sonner';

export default function Sonner_1($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	Sonner($$renderer, $.spread_props([
		{
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
		restProps
	]));
}