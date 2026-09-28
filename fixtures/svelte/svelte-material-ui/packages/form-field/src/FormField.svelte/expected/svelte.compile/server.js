import * as $ from 'svelte/internal/server';
import { onMount, setContext } from 'svelte';

import {
	classMap,
	exclude,
	prefixFilter,
	useActions,
	SvelteEventManager
} from '@smui/common/internal';

import { MDCFormFieldFoundation } from './mdc';

let counter = 0;

export default function FormField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * Where to align the input.
		 */
		/**
		 * How to justify the label and input.
		 */
		/**
		 * Whether to prevent content wrapping.
		 */
		/**
		 * The ID the input will use.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The content of the form field's label.
		 */
		let {
			use = [],
			class: className = '',
			align = 'start',
			justify = 'normal',
			noWrap = false,
			inputId = 'SMUI-form-field-' + counter++,
			label$use = [],
			label$class = '',
			children,
			label,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let labelEl;
		let input = void 0;

		setContext('SMUI:generic:input:props', { id: inputId });

		setContext('SMUI:generic:input:mount', (accessor) => {
			input = accessor;
		});

		setContext('SMUI:generic:input:unmount', () => {
			input = undefined;
		});

		onMount(() => {
			instance = new MDCFormFieldFoundation({
				activateInputRipple: () => {
					if (input) {
						input.activateRipple();
					}
				},

				deactivateInputRipple: () => {
					if (input) {
						input.deactivateRipple();
					}
				},
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(labelEl, evtType, handler),
				registerInteractionHandler: (evtType, handler) => eventManager.on(labelEl, evtType, handler)
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
				eventManager.clear();
			};
		});

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-form-field': true,
				'mdc-form-field--align-end': align === 'end',
				'mdc-form-field--space-between': justify === 'space-between',
				'mdc-form-field--nowrap': noWrap,
				[className]: true
			})),
			...exclude(restProps, ['label$'])
		})}>`);

		children?.($$renderer);

		$$renderer.push(`<!----> <label${$.attributes({
			class: $.clsx(classMap({ 'mdc-label': true, [label$class]: true })),
			for: inputId,
			...prefixFilter(restProps, 'label$')
		})}>`);

		label?.($$renderer);
		$$renderer.push(`<!----></label></div>`);
		$.bind_props($$props, { getElement });
	});
}