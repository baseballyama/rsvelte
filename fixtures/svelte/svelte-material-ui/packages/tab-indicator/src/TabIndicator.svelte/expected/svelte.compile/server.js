import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';

import {
	MDCFadingTabIndicatorFoundation,
	MDCSlidingTabIndicatorFoundation
} from './mdc';

export default function TabIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Whether the tab associated with this indicator is active.
		 */
		/**
		 * The visual styling of the tab indictor.
		 */
		/**
		 * The visual transition used when the active tab changes.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			class: className = '',
			active = false,
			type = 'underline',
			transition = 'slide',
			content$use = [],
			content$class = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let content;
		let internalClasses = {};
		let contentStyles = {};
		let changeSets = [];
		let oldTransition = transition;

		// Use sets of changes for DOM updates, to facilitate animations.
		onMount(() => {
			instance = getInstance();
			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

		function getInstance() {
			const Foundation = ({
				fade: MDCFadingTabIndicatorFoundation,
				slide: MDCSlidingTabIndicatorFoundation
			})[transition] || MDCSlidingTabIndicatorFoundation;

			return new Foundation({
				addClass: (...props) => doChange(() => addClass(...props)),
				removeClass: (...props) => doChange(() => removeClass(...props)),
				computeContentClientRect,
				setContentStyleProperty: (...props) => doChange(() => addContentStyle(...props))
			});
		}

		function doChange(fn) {
			if (changeSets.length) {
				changeSets[changeSets.length - 1].push(fn);
			} else {
				fn();
			}
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

		function addContentStyle(name, value) {
			if (contentStyles[name] != value) {
				if (value === '' || value == null) {
					delete contentStyles[name];
				} else {
					contentStyles[name] = value;
				}
			}
		}

		function activate(previousIndicatorClientRect) {
			active = true;
			instance?.activate(previousIndicatorClientRect);
		}

		function deactivate() {
			active = false;
			instance?.deactivate();
		}

		function computeContentClientRect() {
			changeSets.push([]);

			return content.getBoundingClientRect();
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<span${$.attributes({
			class: $.clsx(classMap({
				'mdc-tab-indicator': true,
				'mdc-tab-indicator--active': active,
				'mdc-tab-indicator--fade': transition === 'fade',
				...internalClasses,
				[className]: true
			})),
			...exclude(restProps, ['content$'])
		})}><span${$.attributes({
			class: $.clsx(classMap({
				'mdc-tab-indicator__content': true,
				'mdc-tab-indicator__content--underline': type === 'underline',
				'mdc-tab-indicator__content--icon': type === 'icon',
				[content$class]: true
			})),
			style: Object.entries(contentStyles).map(([name, value]) => `${name}: ${value};`).join(' '),
			'aria-hidden': type === 'icon' ? 'true' : undefined,
			...prefixFilter(restProps, 'content$')
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span></span>`);

		$.bind_props($$props, {
			active,
			activate,
			deactivate,
			computeContentClientRect,
			getElement
		});
	});
}