import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mode } from "mode-watcher";
import { Toaster as Sonner } from "svelte-sonner";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Sonner_1($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	{
		const loadingIcon = ($$anchor) => {
			IconPlaceholder($$anchor, {
				lucide: 'Loader2Icon',
				tabler: 'IconLoader',
				hugeicons: 'Loading03Icon',
				phosphor: 'SpinnerIcon',
				remixicon: 'RiLoaderLine',
				class: 'size-4 animate-spin'
			});
		};

		const successIcon = ($$anchor) => {
			IconPlaceholder($$anchor, {
				lucide: 'CircleCheckIcon',
				tabler: 'IconCircleCheck',
				hugeicons: 'CheckmarkCircle02Icon',
				phosphor: 'CheckCircleIcon',
				remixicon: 'RiCheckboxCircleLine',
				class: 'size-4'
			});
		};

		const errorIcon = ($$anchor) => {
			IconPlaceholder($$anchor, {
				lucide: 'OctagonXIcon',
				tabler: 'IconAlertOctagon',
				hugeicons: 'MultiplicationSignCircleIcon',
				phosphor: 'XCircleIcon',
				remixicon: 'RiErrorWarningLine',
				class: 'size-4'
			});
		};

		const infoIcon = ($$anchor) => {
			IconPlaceholder($$anchor, {
				lucide: 'InfoIcon',
				tabler: 'IconInfoCircle',
				hugeicons: 'InformationCircleIcon',
				phosphor: 'InfoIcon',
				remixicon: 'RiInformationLine',
				class: 'size-4'
			});
		};

		const warningIcon = ($$anchor) => {
			IconPlaceholder($$anchor, {
				lucide: 'TriangleAlertIcon',
				tabler: 'IconAlertTriangle',
				hugeicons: 'Alert02Icon',
				phosphor: 'WarningIcon',
				remixicon: 'RiCloseCircleLine',
				class: 'size-4'
			});
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