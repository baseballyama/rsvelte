import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Textarea($$renderer, $$props) {
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
		 * The value of the input.
		 */
		/**
		 * Whether the input has been changed.
		 */
		/**
		 * Whether the input is invalid.
		 */
		/**
		 * Set to false to prevent updating the value passed to invalid.
		 */
		/**
		 * Set to true to update the invalid state immediately on instantiation.
		 */
		/**
		 * Whether the textarea should be user resizeable.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			value = '',
			dirty = false,
			invalid = false,
			updateInvalid = true,
			initialInvalid = false,
			resizable = true,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let internalAttrs = {};

		onMount(() => {
			if (updateInvalid && initialInvalid) {
				invalid = getElement().matches(':invalid');
			}
		});

		function changeHandler() {
			dirty = true;

			if (updateInvalid) {
				invalid = getElement().matches(':invalid');
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

		function removeAttr(name) {
			if (!(name in internalAttrs) || internalAttrs[name] != null) {
				internalAttrs[name] = undefined;
			}
		}

		function focus() {
			getElement().focus();
		}

		function blur() {
			getElement().blur();
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<textarea${$.attributes({
			class: $.clsx(classMap({ 'mdc-text-field__input': true, [className]: true })),
			style: `${resizable ? '' : 'resize: none; '}${style}`,
			...internalAttrs,
			...restProps
		})}>`);

		const $$body = $.escape(value);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea>`);

		$.bind_props($$props, {
			value,
			dirty,
			invalid,
			getAttr,
			addAttr,
			removeAttr,
			focus,
			blur,
			getElement
		});
	});
}