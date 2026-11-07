import * as $ from 'svelte/internal/server';
import { onMount, setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCNotchedOutlineFoundation } from './mdc';

export default function NotchedOutline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The notched state of the outline.
		 */
		/**
		 * Don't render a label.
		 */
		let {
			use = [],
			class: className = '',
			notched = false,
			noLabel = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let floatingLabel = void 0;
		let internalClasses = {};
		let notchStyles = {};
		let previousFloatingLabel = undefined;

		setContext('SMUI:floating-label:mount', (accessor) => {
			floatingLabel = accessor;
		});

		setContext('SMUI:floating-label:unmount', () => {
			floatingLabel = undefined;
		});

		onMount(() => {
			instance = new MDCNotchedOutlineFoundation({
				addClass,
				removeClass,
				setNotchWidthProperty: (width) => addNotchStyle('width', width + 'px'),
				removeNotchWidthProperty: () => removeNotchStyle('width')
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

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

		function addNotchStyle(name, value) {
			if (notchStyles[name] != value) {
				if (value === '' || value == null) {
					delete notchStyles[name];
				} else {
					notchStyles[name] = value;
				}
			}
		}

		function removeNotchStyle(name) {
			if (name in notchStyles) {
				delete notchStyles[name];
			}
		}

		function notch(notchWidth) {
			instance?.notch(notchWidth);
		}

		function closeNotch() {
			instance?.closeNotch();
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-notched-outline': true,
				'mdc-notched-outline--notched': notched,
				'mdc-notched-outline--no-label': noLabel,
				...internalClasses,
				[className]: true
			})),
			...restProps
		})}><div class="mdc-notched-outline__leading"></div> `);

		if (!noLabel) {
			$$renderer.push(`<!--[0--><div class="mdc-notched-outline__notch"${$.attr_style(Object.entries(notchStyles).map(([name, value]) => `${name}: ${value};`).join(' '))}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="mdc-notched-outline__trailing"></div></div>`);
		$.bind_props($$props, { notch, closeNotch, getElement });
	});
}