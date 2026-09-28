import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { classMap, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'ripple',
	'children',
	'description',
	'icon'
]);

var root = $.from_html(`<div class="smui-accordion__header__ripple"></div>`);
var root_1 = $.from_html(`<div class="smui-accordion__header__description"><!></div>`);
var root_2 = $.from_html(`<div class="smui-accordion__header__icon"><!></div>`);
var root_3 = $.from_html(`<div><!> <div><!></div> <!> <!></div>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $nonInteractive = () => $.store_get(nonInteractive, '$nonInteractive', $$stores);
	const $disabled = () => $.store_get(disabled, '$disabled', $$stores);
	const $open = () => $.store_get(open, '$open', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
	 * Whether to show a ripple animation.
	 */
	/**
	 * A spot for the description.
	 */
	/**
	 * A spot for the icon.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	const disabled = getContext('SMUI:accordion:panel:disabled');
	const nonInteractive = getContext('SMUI:accordion:panel:nonInteractive');
	const open = getContext('SMUI:accordion:panel:open');

	function handleClick(event) {
		if (event.button === 0) {
			dispatch(getElement(), 'SMUIAccordionHeaderActivate', { event });
		}
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter') {
			dispatch(getElement(), 'SMUIAccordionHeaderActivate', { event });
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

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root_3();

	var event_handler = (e) => {
		handleClick(e);
		$$props.onclick?.(e);
	};

	var event_handler_1 = (e) => {
		handleKeyDown(e);
		$$props.onkeydown?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			style: $1,
			role: 'button',
			tabindex: $nonInteractive() ? -1 : 0,
			'aria-expanded': $open() ? 'true' : 'false',
			...restProps,
			onclick: event_handler,
			onkeydown: event_handler_1
		}),
		[
			() => classMap({
				'smui-accordion__header': true,
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
		]
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (ripple()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();
			var node_3 = $.child(div_3);

			$.snippet(node_3, () => $$props.description ?? $.noop);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_2, ($$render) => {
			if ($$props.description) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_4 = root_2();
			var node_5 = $.child(div_4);

			$.snippet(node_5, () => $$props.icon ?? $.noop);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_4, ($$render) => {
			if ($$props.icon) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	$.action(div, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		ripple: ripple(),
		unbounded: false,
		surface: !$nonInteractive(),
		disabled: $disabled() || $nonInteractive(),
		addClass,
		removeClass,
		addStyle
	}));

	$.template_effect(($0) => $.set_class(div_2, 1, $0), [
		() => $.clsx(classMap({
			'smui-accordion__header__title': true,
			'smui-accordion__header__title--with-description': $$props.description
		}))
	]);

	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}