import * as $ from 'svelte/internal/server';
import { onMount, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCTextFieldCharacterCounterFoundation } from './mdc';

export default function CharacterCounter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			class: className = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let content = void 0;
		const SMUITextfieldCharacterCounterMount = getContext('SMUI:textfield:character-counter:mount');
		const SMUITextfieldCharacterCounterUnmount = getContext('SMUI:textfield:character-counter:unmount');

		onMount(() => {
			instance = new MDCTextFieldCharacterCounterFoundation({
				setContent: (value) => {
					content = value;
				},
				setCounterValue: (currentLength, maxLength) => {}
			});

			SMUITextfieldCharacterCounterMount && SMUITextfieldCharacterCounterMount(instance);
			instance.init();

			return () => {
				if (SMUITextfieldCharacterCounterUnmount && instance) {
					SMUITextfieldCharacterCounterUnmount(instance);
				}

				instance?.destroy();
				instance = undefined;
			};
		});

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({ 'mdc-text-field-character-counter': true, [className]: true })),
			...restProps
		})}>`);

		if (content == null) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(content)}`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { getElement });
	});
}