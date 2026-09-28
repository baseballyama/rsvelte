import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCLinearProgressFoundation } from './mdc';

export default function LinearProgress($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A list of CSS styles.
		 */
		/**
		 * Whether to show indeterminate progress (a throbber).
		 */
		/**
		 * Whether the progress indicator is closed.
		 *
		 * Closed progress indicators animate out, then still take up space in the
		 * UI.
		 */
		/**
		 * The current progress (between 0 and 1).
		 */
		/**
		 * An optional buffer section of the progress bar.
		 *
		 * This can be used to show when, for example, a video has a current
		 * position and a buffered position.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			indeterminate = false,
			closed = false,
			progress = 0,
			buffer = undefined,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let internalAttrs = {};
		let internalStyles = {};
		let bufferBarStyles = {};
		let primaryBarStyles = {};
		let context = getContext('SMUI:linear-progress:context');
		let closedStore = getContext('SMUI:linear-progress:closed');

		onMount(() => {
			instance = new MDCLinearProgressFoundation({
				addClass,
				forceLayout: () => {
					getElement().getBoundingClientRect();
				},
				setBufferBarStyle: addBufferBarStyle,
				setPrimaryBarStyle: addPrimaryBarStyle,
				hasClass,
				removeAttribute: removeAttr,
				removeClass,
				setAttribute: addAttr,
				setStyle: addStyle,
				attachResizeObserver: (callback) => {
					const RO = window.ResizeObserver;

					if (RO) {
						const ro = new RO(callback);

						ro.observe(getElement());

						return ro;
					}

					return null;
				},
				getWidth: () => getElement().offsetWidth
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

		function hasClass(className) {
			return className in internalClasses
				? internalClasses[className]
				: getElement().classList.contains(className);
		}

		function addClass(className) {
			if (!internalClasses[className]) {
				internalClasses[className] = true;
			}
		}

		function removeClass(className) {
			if (!(className in internalClasses) || internalClasses[className]) {
				internalClasses[className] = false;
			}
		}

		function addAttr(name, value) {
			if (internalAttrs[name] !== value) {
				internalAttrs[name] = value;
			}
		}

		function removeAttr(name) {
			if (!(name in internalAttrs) || internalAttrs[name] != null) {
				internalAttrs[name] = undefined;
			}
		}

		function addStyle(name, value) {
			if (internalStyles[name] != value) {
				if (value === '' || value == null) {
					delete internalStyles[name];
				} else {
					internalStyles[name] = value;
				}
			}
		}

		function addBufferBarStyle(name, value) {
			if (bufferBarStyles[name] != value) {
				if (value === '' || value == null) {
					delete bufferBarStyles[name];
				} else {
					bufferBarStyles[name] = value;
				}
			}
		}

		function addPrimaryBarStyle(name, value) {
			if (primaryBarStyles[name] != value) {
				if (value === '' || value == null) {
					delete primaryBarStyles[name];
				} else {
					primaryBarStyles[name] = value;
				}
			}
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-linear-progress': true,
				'mdc-linear-progress--indeterminate': indeterminate,
				'mdc-linear-progress--closed': closed,
				'mdc-data-table__linear-progress': context === 'data-table',
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			role: 'progressbar',
			'aria-valuemin': 0,
			'aria-valuemax': 1,
			'aria-valuenow': indeterminate ? undefined : progress,
			...internalAttrs,
			...restProps
		})}><div class="mdc-linear-progress__buffer"><div class="mdc-linear-progress__buffer-bar"${$.attr_style(Object.entries(bufferBarStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}></div> <div class="mdc-linear-progress__buffer-dots"></div></div> <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"${$.attr_style(Object.entries(primaryBarStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}><span class="mdc-linear-progress__bar-inner"></span></div> <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"><span class="mdc-linear-progress__bar-inner"></span></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}