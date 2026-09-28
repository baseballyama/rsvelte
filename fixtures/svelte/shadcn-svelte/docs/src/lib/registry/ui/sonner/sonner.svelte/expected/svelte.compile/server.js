import * as $ from 'svelte/internal/server';
import { mode } from "mode-watcher";
import { Toaster as Sonner } from "svelte-sonner";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

export default function Sonner_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...restProps } = $$props;

		{
			function loadingIcon($$renderer) {
				IconPlaceholder($$renderer, {
					lucide: 'Loader2Icon',
					tabler: 'IconLoader',
					hugeicons: 'Loading03Icon',
					phosphor: 'SpinnerIcon',
					remixicon: 'RiLoaderLine',
					class: 'size-4 animate-spin'
				});
			}

			function successIcon($$renderer) {
				IconPlaceholder($$renderer, {
					lucide: 'CircleCheckIcon',
					tabler: 'IconCircleCheck',
					hugeicons: 'CheckmarkCircle02Icon',
					phosphor: 'CheckCircleIcon',
					remixicon: 'RiCheckboxCircleLine',
					class: 'size-4'
				});
			}

			function errorIcon($$renderer) {
				IconPlaceholder($$renderer, {
					lucide: 'OctagonXIcon',
					tabler: 'IconAlertOctagon',
					hugeicons: 'MultiplicationSignCircleIcon',
					phosphor: 'XCircleIcon',
					remixicon: 'RiErrorWarningLine',
					class: 'size-4'
				});
			}

			function infoIcon($$renderer) {
				IconPlaceholder($$renderer, {
					lucide: 'InfoIcon',
					tabler: 'IconInfoCircle',
					hugeicons: 'InformationCircleIcon',
					phosphor: 'InfoIcon',
					remixicon: 'RiInformationLine',
					class: 'size-4'
				});
			}

			function warningIcon($$renderer) {
				IconPlaceholder($$renderer, {
					lucide: 'TriangleAlertIcon',
					tabler: 'IconAlertTriangle',
					hugeicons: 'Alert02Icon',
					phosphor: 'WarningIcon',
					remixicon: 'RiCloseCircleLine',
					class: 'size-4'
				});
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