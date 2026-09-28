import * as $ from 'svelte/internal/server';
import { Toaster as Sonner } from 'svelte-sonner';
import { mode } from 'mode-watcher';
import Loader2Icon from '@lucide/svelte/icons/loader-2';
import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
import OctagonXIcon from '@lucide/svelte/icons/octagon-x';
import InfoIcon from '@lucide/svelte/icons/info';
import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

export default function Sonner_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;

		{
			function loadingIcon($$renderer) {
				Loader2Icon($$renderer, { class: 'size-4 animate-spin' });
			}

			function successIcon($$renderer) {
				CircleCheckIcon($$renderer, { class: 'size-4' });
			}

			function errorIcon($$renderer) {
				OctagonXIcon($$renderer, { class: 'size-4' });
			}

			function infoIcon($$renderer) {
				InfoIcon($$renderer, { class: 'size-4' });
			}

			function warningIcon($$renderer) {
				TriangleAlertIcon($$renderer, { class: 'size-4' });
			}

			Sonner($$renderer, $.spread_props([
				{
					theme: mode.current,
					class: 'toaster group',
					style: '--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);'
				},
				restProps,
				{
					loadingIcon,
					successIcon,
					errorIcon,
					infoIcon,
					warningIcon,
					$$slots: {
						loadingIcon: true,
						successIcon: true,
						errorIcon: true,
						infoIcon: true,
						warningIcon: true
					}
				}
			]));
		}
	});
}