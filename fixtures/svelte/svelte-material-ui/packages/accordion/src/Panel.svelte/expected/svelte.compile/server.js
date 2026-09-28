import * as $ from 'svelte/internal/server';
import { onMount, setContext, getContext } from 'svelte';
import { on } from 'svelte/events';
import { writable } from 'svelte/store';
import { classMap, dispatch } from '@smui/common/internal';
import Paper from '@smui/paper';

export default function Panel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The styling variant of the panel.
		 */
		/**
		 * The color of the panel.
		 */
		/**
		 * The elevation of the panel.
		 */
		/**
		 * Whether the panel is open.
		 */
		/**
		 * Whether the panel is disabled.
		 */
		/**
		 * Whether the panel is non-interactive.
		 *
		 * This is distinct from disabled, because it doesn't add any visual
		 * styling.
		 */
		/**
		 * Whether the panel should slightly extend horizontally when it is opened.
		 */
		/**
		 * The elevation the panel should transition to when it is extended.
		 */
		let {
			use = [],
			class: className = '',
			variant = 'raised',
			color = 'default',
			elevation = 1,
			open = false,
			disabled = false,
			nonInteractive = false,
			extend = false,
			extendedElevation = 3,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let accessor;
		let opened = open;
		const disabledStore = writable(disabled);

		setContext('SMUI:accordion:panel:disabled', disabledStore);

		const nonInteractiveStore = writable(nonInteractive);

		setContext('SMUI:accordion:panel:nonInteractive', nonInteractiveStore);

		const openStore = writable(open);

		setContext('SMUI:accordion:panel:open', openStore);

		let previousOpen = open;

		// Calculate the height of the content and apply it. This lets the CSS
		// animation run properly.
		// Force a reflow to get the height.
		// Force another reflow to reset the height.
		// Assign only when the panel is fully opened.
		// Force a reflow.
		// Assign as soon as the panel is closing.
		// Set the aria-hidden property.
		const SMUIAccordionPanelMount = getContext('SMUI:accordion:panel:mount');

		const SMUIAccordionPanelUnmount = getContext('SMUI:accordion:panel:unmount');

		onMount(() => {
			accessor = {
				get open() {
					return open;
				},
				setOpen
			};

			// Set the ari-hidden property on content children.
			Array.from(getElement().children).forEach((child) => {
				if (child.classList.contains('smui-paper__content')) {
					const content = child;

					content.setAttribute('aria-hidden', open ? 'false' : 'true');
				}
			});

			SMUIAccordionPanelMount && SMUIAccordionPanelMount(accessor);

			return () => {
				SMUIAccordionPanelUnmount && SMUIAccordionPanelUnmount(accessor);
			};
		});

		function handleHeaderActivate(event) {
			event.stopPropagation();

			if (disabled || nonInteractive) {
				return;
			}

			dispatch(getElement(), 'SMUIAccordionPanelActivate', { accessor, event });
		}

		function isOpen() {
			return open;
		}

		function setOpen(value) {
			open = value;
		}

		function getElement() {
			return element.getElement();
		}

		Paper($$renderer, $.spread_props([
			{
				use,
				class: classMap({
					'smui-accordion__panel': true,
					'smui-accordion__panel--open': open,
					'smui-accordion__panel--opened': opened,
					'smui-accordion__panel--disabled': disabled,
					'smui-accordion__panel--non-interactive': nonInteractive,
					'smui-accordion__panel--raised': variant === 'raised',
					'smui-accordion__panel--extend': extend,
					['smui-accordion__panel--elevation-z' + (extend && open ? extendedElevation : elevation)]: elevation !== 0 && variant === 'raised' || extendedElevation !== 0 && variant === 'raised' && extend && open,
					[className]: true
				}),
				color,
				variant: variant === 'raised' ? 'unelevated' : variant
			},
			restProps,
			{
				onSMUIAccordionHeaderActivate: (e) => {
					handleHeaderActivate(e);
					restProps.onSMUIAccordionHeaderActivate?.(e);
				},

				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { open, isOpen, setOpen, getElement });
	});
}