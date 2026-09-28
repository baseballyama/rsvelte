import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCCircularProgressFoundation } from './mdc';

export default function CircularProgress($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
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
		 * Show the four color loop animation.
		 */
		let {
			use = [],
			class: className = '',
			indeterminate = false,
			closed = false,
			progress = 0,
			fourColor = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let internalAttrs = {};
		let determinateCircleAttrs = {};
		let determinateCircle;

		onMount(() => {
			instance = new MDCCircularProgressFoundation({
				addClass,
				getDeterminateCircleAttribute: getDeterminateCircleAttr,
				hasClass,
				removeClass,
				removeAttribute: removeAttr,
				setAttribute: addAttr,
				setDeterminateCircleAttribute: addDeterminateCircleAttr
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

		function getDeterminateCircleAttr(name) {
			return name in determinateCircleAttrs
				? determinateCircleAttrs[name] ?? null
				: determinateCircle.getAttribute(name);
		}

		function addDeterminateCircleAttr(name, value) {
			if (determinateCircleAttrs[name] !== value) {
				determinateCircleAttrs[name] = value;
			}
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-circular-progress': true,
				'mdc-circular-progress--indeterminate': indeterminate,
				'mdc-circular-progress--closed': closed,
				...internalClasses,
				[className]: true
			})),
			role: 'progressbar',
			'aria-valuemin': 0,
			'aria-valuemax': 1,
			'aria-valuenow': indeterminate ? undefined : progress,
			...internalAttrs,
			...restProps
		})}><div class="mdc-circular-progress__determinate-container"><svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4"></circle><circle${$.attributes(
			{
				class: 'mdc-circular-progress__determinate-circle',
				cx: '24',
				cy: '24',
				r: '18',
				'stroke-dasharray': '113.097',
				'stroke-dashoffset': '113.097',
				'stroke-width': '4',
				...determinateCircleAttrs
			},
			void 0,
			void 0,
			void 0,
			3
		)}></circle></svg></div> <div class="mdc-circular-progress__indeterminate-container"><!--[-->`);

		const each_array = $.ensure_array_like(fourColor ? [1, 2, 3, 4] : [1]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let color = each_array[$$index];

			$$renderer.push(`<div${$.attr_class($.clsx(classMap({
				'mdc-circular-progress__spinner-layer': true,
				['mdc-circular-progress__color-' + color]: fourColor,
				[className]: true
			})))}><div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left"><svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"></circle></svg></div> <div class="mdc-circular-progress__gap-patch"><svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2"></circle></svg></div> <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right"><svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"></circle></svg></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { getElement });
	});
}