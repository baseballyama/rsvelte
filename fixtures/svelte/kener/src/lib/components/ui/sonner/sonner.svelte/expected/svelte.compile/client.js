import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
import InfoIcon from "@lucide/svelte/icons/info";
import Loader2Icon from "@lucide/svelte/icons/loader-2";
import OctagonXIcon from "@lucide/svelte/icons/octagon-x";
import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
import { Toaster as Sonner } from "svelte-sonner";
import { mode } from "mode-watcher";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Sonner_1($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	{
		const loadingIcon = ($$anchor) => {
			Loader2Icon($$anchor, { class: 'size-4 animate-spin' });
		};

		const successIcon = ($$anchor) => {
			CircleCheckIcon($$anchor, { class: 'size-4' });
		};

		const errorIcon = ($$anchor) => {
			OctagonXIcon($$anchor, { class: 'size-4' });
		};

		const infoIcon = ($$anchor) => {
			InfoIcon($$anchor, { class: 'size-4' });
		};

		const warningIcon = ($$anchor) => {
			TriangleAlertIcon($$anchor, { class: 'size-4' });
		};

		Sonner($$anchor, $.spread_props(
			{
				get theme() {
					return mode.current;
				},
				class: 'toaster group',
				style: '--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);'
			},
			() => restProps,
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
		));
	}

	$.pop();
}