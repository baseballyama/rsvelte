import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCTextFieldIconFoundation } from './mdc';

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

	const $leadingStore = () => $.store_get(leadingStore, '$leadingStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
		tabindex = $.prop($$props, 'tabindex', 19, () => $$props.role === 'button' ? 0 : -1),
		disabled = $.prop($$props, 'disabled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let eventManager = new SvelteEventManager();
	let internalAttrs = $.proxy({});
	const leadingStore = getContext('SMUI:textfield:icon:leading');
	const leading = $leadingStore();
	let content = $.state(void 0);
	const roleProps = $.derived(() => ({ role: $$props.role, tabindex: tabindex() }));
	const SMUITextfieldLeadingIconMount = getContext('SMUI:textfield:leading-icon:mount');
	const SMUITextfieldLeadingIconUnmount = getContext('SMUI:textfield:leading-icon:unmount');
	const SMUITextfieldTrailingIconMount = getContext('SMUI:textfield:trailing-icon:mount');
	const SMUITextfieldTrailingIconUnmount = getContext('SMUI:textfield:trailing-icon:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCTextFieldIconFoundation({
				getAttr,
				setAttr: addAttr,
				removeAttr,
				setContent: (value) => {
					$.set(content, value, true);
				},
				registerInteractionHandler: (evtType, handler) => eventManager.on(getElement(), evtType, handler),
				deregisterInteractionHandler: (evtType, handler) => eventManager.off(getElement(), evtType, handler),
				notifyIconAction: () => dispatch(getElement(), 'SMUITextFieldIcon')
			}),
			true
		);

		if (leading) {
			SMUITextfieldLeadingIconMount && SMUITextfieldLeadingIconMount($.get(instance));
		} else {
			SMUITextfieldTrailingIconMount && SMUITextfieldTrailingIconMount($.get(instance));
		}

		$.get(instance).init();

		return () => {
			if ($.get(instance)) {
				if (leading) {
					SMUITextfieldLeadingIconUnmount && SMUITextfieldLeadingIconUnmount($.get(instance));
				} else {
					SMUITextfieldTrailingIconUnmount && SMUITextfieldTrailingIconUnmount($.get(instance));
				}
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
			'aria-disabled': $$props.role === 'button' ? disabled() ? 'true' : 'false' : undefined,
			...$.get(roleProps),
			...internalAttrs,
			...restProps
		}),
		[
			() => classMap({
				'mdc-text-field__icon': true,
				'mdc-text-field__icon--leading': leading,
				'mdc-text-field__icon--trailing': !leading,
				[className()]: true
			})
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

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}