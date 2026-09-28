import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCSelectIconFoundation } from './mdc';

export default function Icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The element's role.
		 */
		/**
		 * The tab index.
		 */
		/**
		 * Whether the element is disabled.
		 */
		let {
			use = [],
			class: className = '',
			role = undefined,
			tabindex = role === 'button' ? 0 : -1,
			disabled = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let internalAttrs = {};
		let content = void 0;
		const roleProps = $.derived(() => ({ role, tabindex }));
		const SMUISelectLeadingIconMount = getContext('SMUI:select:leading-icon:mount');
		const SMUISelectLeadingIconUnmount = getContext('SMUI:select:leading-icon:unmount');

		onMount(() => {
			instance = new MDCSelectIconFoundation({
				getAttr,
				setAttr: addAttr,
				removeAttr,
				setContent: (value) => {
					content = value;
				},
				registerInteractionHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler),
				notifyIconAction: () => dispatch(getElement(), 'SMUISelectIcon')
			});

			SMUISelectLeadingIconMount && SMUISelectLeadingIconMount(instance);
			instance.init();

			return () => {
				if (SMUISelectLeadingIconUnmount && instance) {
					SMUISelectLeadingIconUnmount(instance);
				}

				instance?.destroy();
				instance = undefined;
				eventManager.clear();
			};
		});

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

		function removeAttr(name) {
			if (!(name in internalAttrs) || internalAttrs[name] != null) {
				internalAttrs[name] = undefined;
			}
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<i${$.attributes({
			class: $.clsx(classMap({ 'mdc-select__icon': true, [className]: true })),
			'aria-hidden': tabindex === -1 ? 'true' : 'false',
			'aria-disabled': role === 'button' ? disabled ? 'true' : 'false' : undefined,
			...roleProps(),
			...internalAttrs,
			...restProps
		})}>`);

		if (content == null) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(content)}`);
		}

		$$renderer.push(`<!--]--></i>`);
		$.bind_props($$props, { getElement });
	});
}