import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext, getContext } from 'svelte';
import { on } from 'svelte/events';
import { writable } from 'svelte/store';
import { classMap, dispatch } from '@smui/common/internal';
import Paper from '@smui/paper';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'variant',
	'color',
	'elevation',
	'open',
	'disabled',
	'nonInteractive',
	'extend',
	'extendedElevation',
	'children'
]);

export default function Panel($$anchor, $$props) {
	$.push($$props, true);

	const $disabledStore = () => $.store_get(disabledStore, '$disabledStore', $$stores);
	const $nonInteractiveStore = () => $.store_get(nonInteractiveStore, '$nonInteractiveStore', $$stores);
	const $openStore = () => $.store_get(openStore, '$openStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		variant = $.prop($$props, 'variant', 3, 'raised'),
		color = $.prop($$props, 'color', 3, 'default'),
		elevation = $.prop($$props, 'elevation', 3, 1),
		open = $.prop($$props, 'open', 15, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		nonInteractive = $.prop($$props, 'nonInteractive', 3, false),
		extend = $.prop($$props, 'extend', 3, false),
		extendedElevation = $.prop($$props, 'extendedElevation', 3, 3),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let accessor;
	let opened = $.state($.proxy(open()));
	const disabledStore = writable(disabled());

	$.user_effect(() => {
		$.store_set(disabledStore, disabled());
	});

	setContext('SMUI:accordion:panel:disabled', disabledStore);

	const nonInteractiveStore = writable(nonInteractive());

	$.user_effect(() => {
		$.store_set(nonInteractiveStore, nonInteractive());
	});

	setContext('SMUI:accordion:panel:nonInteractive', nonInteractiveStore);

	const openStore = writable(open());

	$.user_effect(() => {
		$.store_set(openStore, open());
	});

	setContext('SMUI:accordion:panel:open', openStore);

	let previousOpen = open();

	$.user_pre_effect(() => {
		if (previousOpen !== open()) {
			previousOpen = open();

			Array.from(getElement().children).forEach((child) => {
				if (child.classList.contains('smui-paper__content')) {
					const content = child;

					// Calculate the height of the content and apply it. This lets the CSS
					// animation run properly.
					if (open()) {
						content.classList.add('smui-accordion__content--no-transition');
						content.classList.add('smui-accordion__content--force-open');

						// Force a reflow to get the height.
						const { height } = content.getBoundingClientRect();

						content.classList.remove('smui-accordion__content--force-open');

						// Force another reflow to reset the height.
						content.getBoundingClientRect();

						content.classList.remove('smui-accordion__content--no-transition');
						content.style.height = height + 'px';

						on(
							content,
							'transitionend',
							() => {
								if (content) {
									content.style.height = '';
								}

								// Assign only when the panel is fully opened.
								$.set(opened, open(), true);

								dispatch(getElement(), 'SMUIAccordionPanelOpened', { accessor });
							},
							{ once: true }
						);
					} else {
						content.style.height = content.getBoundingClientRect().height + 'px';

						// Force a reflow.
						content.getBoundingClientRect();

						requestAnimationFrame(() => {
							if (content) {
								content.style.height = '';
							}

							dispatch(getElement(), 'SMUIAccordionPanelClosed', { accessor });
						});

						// Assign as soon as the panel is closing.
						$.set(opened, false);
					}

					// Set the aria-hidden property.
					content.setAttribute('aria-hidden', open() ? 'false' : 'true');
				}
			});

			dispatch(
				getElement(),
				open()
					? 'SMUIAccordionPanelOpening'
					: 'SMUIAccordionPanelClosing',
				{ accessor }
			);
		}
	});

	const SMUIAccordionPanelMount = getContext('SMUI:accordion:panel:mount');
	const SMUIAccordionPanelUnmount = getContext('SMUI:accordion:panel:unmount');

	onMount(() => {
		accessor = {
			get open() {
				return open();
			},
			setOpen
		};

		// Set the ari-hidden property on content children.
		Array.from(getElement().children).forEach((child) => {
			if (child.classList.contains('smui-paper__content')) {
				const content = child;

				content.setAttribute('aria-hidden', open() ? 'false' : 'true');
			}
		});

		SMUIAccordionPanelMount && SMUIAccordionPanelMount(accessor);

		return () => {
			SMUIAccordionPanelUnmount && SMUIAccordionPanelUnmount(accessor);
		};
	});

	function handleHeaderActivate(event) {
		event.stopPropagation();

		if (disabled() || nonInteractive()) {
			return;
		}

		dispatch(getElement(), 'SMUIAccordionPanelActivate', { accessor, event });
	}

	function isOpen() {
		return open();
	}

	function setOpen(value) {
		open(value);
	}

	function getElement() {
		return element.getElement();
	}

	var $$exports = { isOpen, setOpen, getElement };

	{
		let $0 = $.derived(() => classMap({
			'smui-accordion__panel': true,
			'smui-accordion__panel--open': open(),
			'smui-accordion__panel--opened': $.get(opened),
			'smui-accordion__panel--disabled': disabled(),
			'smui-accordion__panel--non-interactive': nonInteractive(),
			'smui-accordion__panel--raised': variant() === 'raised',
			'smui-accordion__panel--extend': extend(),
			['smui-accordion__panel--elevation-z' + (extend() && open() ? extendedElevation() : elevation())]: elevation() !== 0 && variant() === 'raised' || extendedElevation() !== 0 && variant() === 'raised' && extend() && open(),
			[className()]: true
		}));

		let $1 = $.derived(() => variant() === 'raised' ? 'unelevated' : variant());

		$.bind_this(
			Paper($$anchor, $.spread_props(
				{
					get use() {
						return use();
					},

					get class() {
						return $.get($0);
					},

					get color() {
						return color();
					},

					get variant() {
						return $.get($1);
					}
				},
				() => restProps,
				{
					onSMUIAccordionHeaderActivate: (e) => {
						handleHeaderActivate(e);
						$$props.onSMUIAccordionHeaderActivate?.(e);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node = $.first_child(fragment_1);

						$.snippet(node, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			)),
			($$value) => element = $$value,
			() => element
		);
	}

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}