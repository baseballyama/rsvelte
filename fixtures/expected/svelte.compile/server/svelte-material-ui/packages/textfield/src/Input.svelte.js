import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The input type.
		 */
		/**
		 * A placeholder to show when the input is empty.
		 */
		/**
		 * The value of the input.
		 */
		/**
		 * The selected files of the input if it is "file" type.
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
		 * When the value of the input is "", set value prop to null.
		 */
		/**
		 * When the value of the input is "", set value prop to undefined.
		 */
		let {
			use = [],
			class: className = '',
			type = 'text',
			// Always having a placeholder fixes Safari's baseline alignment.
			// See: https://github.com/philipwalton/flexbugs/issues/270
			placeholder = ' ',
			value = void 0,
			files = null,
			dirty = false,
			invalid = false,
			updateInvalid = true,
			initialInvalid = false,
			emptyValueNull = value === null,
			emptyValueUndefined = value === undefined,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let internalAttrs = {};
		let valueProp = {};

		onMount(() => {
			if (updateInvalid && initialInvalid) {
				invalid = getElement().matches(':invalid');
			}
		});

		function toNumber(value) {
			if (value === '') {
				return Number.NaN;
			}

			return +value;
		}

		function valueUpdater(e) {
			if (type === 'file') {
				files = e.currentTarget.files;

				return;
			}

			if (e.currentTarget.value === '' && emptyValueNull) {
				value = null;

				return;
			}

			if (e.currentTarget.value === '' && emptyValueUndefined) {
				value = undefined;

				return;
			}

			switch (type) {
				case 'number':

				case 'range':
					value = toNumber(e.currentTarget.value);
					break;

				default:
					value = e.currentTarget.value;
					break;
			}
		}

		function changeHandler(e) {
			if (type === 'file' || type === 'range') {
				valueUpdater(e);
			}

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

		$$renderer.push(`<input${$.attributes(
			{
				class: $.clsx(classMap({ 'mdc-text-field__input': true, [className]: true })),
				type,
				placeholder,
				...valueProp,
				...internalAttrs,
				...restProps
			},
			void 0,
			void 0,
			void 0,
			4
		)}/>`);

		$.bind_props($$props, {
			value,
			files,
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