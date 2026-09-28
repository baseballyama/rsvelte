import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCSegmentedButtonSegmentFoundation } from './mdc';

export default function Segment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let uninitializedValue = () => {};

		function isUninitializedValue(value) {
			return value === uninitializedValue;
		}

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
		 * The segment object this segment is for.
		 */
		/**
		 * Whether to show a ripple animation.
		 */
		/**
		 * Whether to use touch styling
		 */
		/**
		 * Whether this segment is selected.
		 *
		 * You don't need to set this unless you are manually handling selection.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			segment: segmentId,
			ripple = true,
			touch = false,
			selected = uninitializedValue,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const initialSelectedStore = getContext('SMUI:segmented-button:segment:initialSelected');

		// Some trickery to detect uninitialized values but also have the right types.
		let manualSelection = !isUninitializedValue(selected);

		if (isUninitializedValue(selected)) {
			selected = $.store_get($$store_subs ??= {}, '$initialSelectedStore', initialSelectedStore);
		}

		// Done with the trickery.
		let element;

		let instance = void 0;
		let internalClasses = {};
		let internalStyles = {};
		let internalAttrs = {};
		const singleSelect = getContext('SMUI:segmented-button:singleSelect');
		const index = getContext('SMUI:segmented-button:segment:index');
		const SMUISegmentedButtonSegmentMount = getContext('SMUI:segmented-button:segment:mount');
		const SMUISegmentedButtonSegmentUnmount = getContext('SMUI:segmented-button:segment:unmount');

		onMount(() => {
			instance = new MDCSegmentedButtonSegmentFoundation({
				isSingleSelect: () => {
					return $.store_get($$store_subs ??= {}, '$singleSelect', singleSelect);
				},
				getAttr,
				setAttr: addAttr,
				addClass,
				removeClass,
				hasClass,
				notifySelectedChange: (value) => {
					selected = value;

					dispatch(getElement(), 'selected', {
						index: $.store_get($$store_subs ??= {}, '$index', index),
						selected,
						segmentId
					});
				},

				getRootBoundingClientRect: () => {
					return getElement().getBoundingClientRect();
				}
			});

			const accessor = {
				segmentId,
				get selected() {
					return selected;
				},

				set selected(value) {
					if (selected !== value) {
						selected = value;
					}
				}
			};

			SMUISegmentedButtonSegmentMount && SMUISegmentedButtonSegmentMount(accessor);
			instance.init();

			return () => {
				SMUISegmentedButtonSegmentUnmount && SMUISegmentedButtonSegmentUnmount(accessor);
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

		function getAttr(name) {
			return name in internalAttrs
				? internalAttrs[name] ?? null
				: getElement().getAttribute(name);
		}

		function addAttr(name, value) {
			if (internalAttrs[name] !== value) {
				internalAttrs[name] = value;
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

		function getElement() {
			return element;
		}

		$$renderer.push(`<button${$.attributes({
			class: $.clsx(classMap({
				'mdc-segmented-button__segment': true,
				'mdc-segmented-button__segment--touch': touch,
				'mdc-segmented-button__segment--selected': selected,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			role: singleSelect ? 'radio' : undefined,
			'aria-pressed': !singleSelect ? selected ? 'true' : 'false' : undefined,
			'aria-checked': singleSelect ? selected ? 'true' : 'false' : undefined,
			...internalAttrs,
			...restProps
		})}>`);

		if (ripple) {
			$$renderer.push(`<!--[0--><div class="mdc-segmented-button__ripple"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		children?.($$renderer);
		$$renderer.push(`<!---->`);

		if (touch) {
			$$renderer.push(`<!--[0--><div class="mdc-segmented-button__segment__touch"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { selected, getElement });
	});
}