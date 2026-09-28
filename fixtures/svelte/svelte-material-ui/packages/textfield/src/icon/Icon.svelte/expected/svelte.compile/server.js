import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCTextFieldIconFoundation } from './mdc';

export default function Icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

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
			role,
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
		const leadingStore = getContext('SMUI:textfield:icon:leading');
		const leading = $.store_get($$store_subs ??= {}, '$leadingStore', leadingStore);
		let content = void 0;
		const roleProps = $.derived(() => ({ role, tabindex }));
		const SMUITextfieldLeadingIconMount = getContext('SMUI:textfield:leading-icon:mount');
		const SMUITextfieldLeadingIconUnmount = getContext('SMUI:textfield:leading-icon:unmount');
		const SMUITextfieldTrailingIconMount = getContext('SMUI:textfield:trailing-icon:mount');
		const SMUITextfieldTrailingIconUnmount = getContext('SMUI:textfield:trailing-icon:unmount');

		onMount(() => {
			instance = new MDCTextFieldIconFoundation({
				getAttr,
				setAttr: addAttr,
				removeAttr,
				setContent: (value) => {
					content = value;
				},
				registerInteractionHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler),
				notifyIconAction: () => dispatch(getElement(), 'SMUITextFieldIcon')
			});

			if (leading) {
				SMUITextfieldLeadingIconMount && SMUITextfieldLeadingIconMount(instance);
			} else {
				SMUITextfieldTrailingIconMount && SMUITextfieldTrailingIconMount(instance);
			}

			instance.init();

			return () => {
				if (instance) {
					if (leading) {
						SMUITextfieldLeadingIconUnmount && SMUITextfieldLeadingIconUnmount(instance);
					} else {
						SMUITextfieldTrailingIconUnmount && SMUITextfieldTrailingIconUnmount(instance);
					}
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
			class: $.clsx(classMap({
				'mdc-text-field__icon': true,
				'mdc-text-field__icon--leading': leading,
				'mdc-text-field__icon--trailing': !leading,
				[className]: true
			})),
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { getElement });
	});
}