import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { classMap, useActions, SvelteEventManager } from '@smui/common/internal';
import { MDCLineRippleFoundation } from './mdc';

export default function LineRipple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		 * Whether the line is active.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			active = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let internalClasses = {};
		let internalStyles = {};

		onMount(() => {
			instance = new MDCLineRippleFoundation({
				addClass,
				removeClass,
				hasClass,
				setStyle: addStyle,
				registerEventHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterEventHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler)
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
				eventManager.clear();
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

		function addStyle(name, value) {
			if (internalStyles[name] != value) {
				if (value === '' || value == null) {
					delete internalStyles[name];
				} else {
					internalStyles[name] = value;
				}
			}
		}

		function activate() {
			instance?.activate();
		}

		function deactivate() {
			instance?.deactivate();
		}

		function setRippleCenter(xCoordinate) {
			instance?.setRippleCenter(xCoordinate);
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-line-ripple': true,
				'mdc-line-ripple--active': active,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			...restProps
		})}></div>`);

		$.bind_props($$props, { activate, deactivate, setRippleCenter, getElement });
	});
}