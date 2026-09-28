import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCSelectIconFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'role',
	'tabindex',
	'disabled',
	'children'
]);

var root = $.from_html(`<i><!></i>`);

export default function Icon($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		role = $.prop($$props, 'role', 3, undefined),
		tabindex = $.prop($$props, 'tabindex', 19, () => role() === 'button' ? 0 : -1),
		disabled = $.prop($$props, 'disabled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalAttrs = $.proxy({});
	let content = $.state(void 0);
	const roleProps = $.derived(() => ({ role: role(), tabindex: tabindex() }));
	const SMUISelectLeadingIconMount = getContext('SMUI:select:leading-icon:mount');
	const SMUISelectLeadingIconUnmount = getContext('SMUI:select:leading-icon:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCSelectIconFoundation({
				getAttr,
				setAttr: addAttr,
				removeAttr,
				setContent: (value) => {
					$.set(content, value, true);
				},
				registerInteractionHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler),
				notifyIconAction: () => dispatch(getElement(), 'SMUISelectIcon')
			}),
			true
		);

		SMUISelectLeadingIconMount && SMUISelectLeadingIconMount($.get(instance));
		$.get(instance).init();

		return () => {
			if (SMUISelectLeadingIconUnmount && $.get(instance)) {
				SMUISelectLeadingIconUnmount($.get(instance));
			}

			$.get(instance)?.destroy();
			$.set(instance, undefined);
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

	var $$exports = { getElement };
	var i = root();

	$.attribute_effect(
		i,
		($0) => ({
			class: $0,
			'aria-hidden': tabindex() === -1 ? 'true' : 'false',
			'aria-disabled': role() === 'button' ? disabled() ? 'true' : 'false' : undefined,
			...$.get(roleProps),
			...internalAttrs,
			...restProps
		}),
		[
			() => classMap({ 'mdc-select__icon': true, [className()]: true })
		]
	);

	var node = $.child(i);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(content)));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(content) == null) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(i);
	$.bind_this(i, ($$value) => element = $$value, () => element);
	$.action(i, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, i);

	return $.pop($$exports);
}