import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, SvelteEventManager } from '@smui/common/internal';
import { MDCFloatingLabelFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'for',
	'floatAbove',
	'required',
	'wrapped',
	'children'
]);

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<label><!></label>`);

export default function FloatingLabel($$anchor, $$props) {
	$.push($$props, true);

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
	 * The ID that this label is for.
	 */
	/**
	 * Whether to float the label.
	 */
	/**
	 * Whether to style for a required input.
	 */
	/**
	 * Whether the input is already wrapped in a label.
	 *
	 * If not, a label element will be used with the ID value in the `for` prop.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		floatAbove = $.prop($$props, 'floatAbove', 15, false),
		required = $.prop($$props, 'required', 15, false),
		wrapped = $.prop($$props, 'wrapped', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let inputProps = getContext('SMUI:generic:input:props') ?? {};
	let previousFloatAbove = floatAbove();

	$.user_effect(() => {
		if ($.get(instance) && previousFloatAbove !== floatAbove()) {
			previousFloatAbove = floatAbove();
			$.get(instance).float(floatAbove());
		}
	});

	let previousRequired = required();

	$.user_effect(() => {
		if ($.get(instance) && previousRequired !== required()) {
			previousRequired = required();
			$.get(instance).setRequired(required());
		}
	});

	const SMUIFloatingLabelMount = getContext('SMUI:floating-label:mount');
	const SMUIFloatingLabelUnmount = getContext('SMUI:floating-label:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCFloatingLabelFoundation({
				addClass,
				removeClass,
				hasClass,
				getWidth: () => {
					const el = getElement();
					const clone = el.cloneNode(true);

					el.parentNode?.appendChild(clone);
					clone.classList.add('smui-floating-label--remove-transition');
					clone.classList.add('smui-floating-label--force-size');
					clone.classList.remove('mdc-floating-label--float-above');

					const scrollWidth = clone.scrollWidth;

					el.parentNode?.removeChild(clone);

					return scrollWidth;
				},
				registerInteractionHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler)
			}),
			true
		);

		const accessor = {
			get element() {
				return getElement();
			},
			addStyle,
			removeStyle
		};

		SMUIFloatingLabelMount && SMUIFloatingLabelMount(accessor);
		$.get(instance).init();

		return () => {
			SMUIFloatingLabelUnmount && SMUIFloatingLabelUnmount(accessor);
			$.get(instance)?.destroy();
			$.set(instance, undefined);
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

	function removeStyle(name) {
		if (name in internalStyles) {
			delete internalStyles[name];
		}
	}

	function shake(shouldShake) {
		$.get(instance)?.shake(shouldShake);
	}

	function float(shouldFloat) {
		floatAbove(shouldFloat);
	}

	function setRequired(isRequired) {
		required(isRequired);
	}

	function getWidth() {
		if ($.get(instance) == null) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).getWidth();
	}

	function getElement() {
		return element;
	}

	var $$exports = { shake, float, setRequired, getWidth, getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.attribute_effect(span, ($0, $1) => ({ class: $0, style: $1, ...restProps }), [
				() => classMap({
					'mdc-floating-label': true,
					'mdc-floating-label--float-above': floatAbove(),
					'mdc-floating-label--required': required(),
					...internalClasses,
					[className()]: true
				}),
				() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
			]);

			var node_1 = $.child(span);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(span);
			$.bind_this(span, ($$value) => element = $$value, () => element);
			$.action(span, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, span);
		};

		var alternate = ($$anchor) => {
			var label = root_1();

			$.attribute_effect(
				label,
				($0, $1) => ({
					class: $0,
					style: $1,
					for: $$props.for || (inputProps ? inputProps.id : undefined),
					...restProps
				}),
				[
					() => classMap({
						'mdc-floating-label': true,
						'mdc-floating-label--float-above': floatAbove(),
						'mdc-floating-label--required': required(),
						...internalClasses,
						[className()]: true
					}),
					() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
				]
			);

			var node_2 = $.child(label);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(label);
			$.bind_this(label, ($$value) => element = $$value, () => element);
			$.action(label, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, label);
		};

		$.if(node, ($$render) => {
			if (wrapped()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}