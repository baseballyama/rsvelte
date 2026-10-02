import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCNotchedOutlineFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'notched',
	'noLabel',
	'children'
]);

var root = $.from_html(`<div class="mdc-notched-outline__notch"><!></div>`);
var root_1 = $.from_html(`<div><div class="mdc-notched-outline__leading"></div> <!> <div class="mdc-notched-outline__trailing"></div></div>`);

export default function NotchedOutline($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		notched = $.prop($$props, 'notched', 3, false),
		noLabel = $.prop($$props, 'noLabel', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let floatingLabel = $.state(void 0);
	let internalClasses = $.proxy({});
	let notchStyles = $.proxy({});
	let previousFloatingLabel = undefined;

	$.user_effect(() => {
		if ($.get(floatingLabel) !== previousFloatingLabel) {
			if ($.get(floatingLabel)) {
				$.get(floatingLabel).addStyle('transition-duration', '0s');
				addClass('mdc-notched-outline--upgraded');

				requestAnimationFrame(() => {
					if ($.get(floatingLabel)) {
						$.get(floatingLabel).removeStyle('transition-duration');
					}
				});
			} else {
				removeClass('mdc-notched-outline--upgraded');
			}

			previousFloatingLabel = $.get(floatingLabel);
		}
	});

	setContext('SMUI:floating-label:mount', (accessor) => {
		$.set(floatingLabel, accessor, true);
	});

	setContext('SMUI:floating-label:unmount', () => {
		$.set(floatingLabel, undefined);
	});

	onMount(() => {
		$.set(
			instance,
			new MDCNotchedOutlineFoundation({
				addClass,
				removeClass,
				setNotchWidthProperty: (width) => addNotchStyle('width', width + 'px'),
				removeNotchWidthProperty: () => removeNotchStyle('width')
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
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
		$.get(instance)?.notch(notchWidth);
	}

	function closeNotch() {
		$.get(instance)?.closeNotch();
	}

	function getElement() {
		return element;
	}

	var $$exports = { notch, closeNotch, getElement };
	var div = root_1();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => classMap({
			'mdc-notched-outline': true,
			'mdc-notched-outline--notched': notched(),
			'mdc-notched-outline--no-label': noLabel(),
			...internalClasses,
			[className()]: true
		})
	]);

	var node = $.sibling($.child(div), 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div_1);

			$.template_effect(($0) => $.set_style(div_1, $0), [
				() => Object.entries(notchStyles).map(([name, value]) => `${name}: ${value};`).join(' ')
			]);

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!noLabel()) $$render(consequent);
		});
	}

	$.next(2);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}