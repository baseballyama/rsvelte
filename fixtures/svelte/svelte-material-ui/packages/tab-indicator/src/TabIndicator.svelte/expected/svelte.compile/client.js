import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';

import {
	MDCFadingTabIndicatorFoundation,
	MDCSlidingTabIndicatorFoundation
} from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'active',
	'type',
	'transition',
	'content$use',
	'content$class',
	'children'
]);

var root = $.from_html(`<span><span><!></span></span>`);

export default function TabIndicator($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether the tab associated with this indicator is active.
	 */
	/**
	 * The visual styling of the tab indictor.
	 */
	/**
	 * The visual transition used when the active tab changes.
	 */
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		active = $.prop($$props, 'active', 15, false),
		type = $.prop($$props, 'type', 3, 'underline'),
		transition = $.prop($$props, 'transition', 3, 'slide'),
		content$use = $.prop($$props, 'content$use', 19, () => []),
		content$class = $.prop($$props, 'content$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let content;
	let internalClasses = $.state($.proxy({}));
	let contentStyles = $.state($.proxy({}));
	let changeSets = $.proxy([]);
	let oldTransition = transition();

	$.user_effect(() => {
		if (oldTransition !== transition()) {
			oldTransition = transition();
			$.get(instance)?.destroy();
			$.set(instance, undefined);
			$.set(internalClasses, {}, true);
			$.set(contentStyles, {}, true);
			$.set(instance, getInstance(), true);
			$.get(instance).init();
		}
	});

	// Use sets of changes for DOM updates, to facilitate animations.
	$.user_pre_effect(() => {
		if (changeSets.length) {
			requestAnimationFrame(() => {
				const changeSet = changeSets.shift() ?? [];

				for (const fn of changeSet) {
					fn();
				}
			});
		}
	});

	onMount(() => {
		$.set(instance, getInstance(), true);
		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
		};
	});

	function getInstance() {
		const Foundation = ({
			fade: MDCFadingTabIndicatorFoundation,
			slide: MDCSlidingTabIndicatorFoundation
		})[transition()] || MDCSlidingTabIndicatorFoundation;

		return new Foundation({
			addClass: (...props) => doChange(() => addClass(...props)),
			removeClass: (...props) => doChange(() => removeClass(...props)),
			computeContentClientRect,
			setContentStyleProperty: (...props) => doChange(() => addContentStyle(...props))
		});
	}

	function doChange(fn) {
		if (changeSets.length) {
			changeSets[changeSets.length - 1].push(fn);
		} else {
			fn();
		}
	}

	function addClass(className) {
		if (!$.get(internalClasses)[className]) {
			$.get(internalClasses)[className] = true;
		}
	}

	function removeClass(className) {
		if (!(className in $.get(internalClasses)) || $.get(internalClasses)[className]) {
			$.get(internalClasses)[className] = false;
		}
	}

	function addContentStyle(name, value) {
		if ($.get(contentStyles)[name] != value) {
			if (value === '' || value == null) {
				delete $.get(contentStyles)[name];
			} else {
				$.get(contentStyles)[name] = value;
			}
		}
	}

	function activate(previousIndicatorClientRect) {
		active(true);
		$.get(instance)?.activate(previousIndicatorClientRect);
	}

	function deactivate() {
		active(false);
		$.get(instance)?.deactivate();
	}

	function computeContentClientRect() {
		changeSets.push([]);

		return content.getBoundingClientRect();
	}

	function getElement() {
		return element;
	}

	var $$exports = { activate, deactivate, computeContentClientRect, getElement };
	var span = root();

	$.attribute_effect(span, ($0, $1) => ({ class: $0, ...$1 }), [
		() => classMap({
			'mdc-tab-indicator': true,
			'mdc-tab-indicator--active': active(),
			'mdc-tab-indicator--fade': transition() === 'fade',
			...$.get(internalClasses),
			[className()]: true
		}),
		() => exclude(restProps, ['content$'])
	]);

	var span_1 = $.child(span);

	$.attribute_effect(
		span_1,
		($0, $1, $2) => ({
			class: $0,
			style: $1,
			'aria-hidden': type() === 'icon' ? 'true' : undefined,
			...$2
		}),
		[
			() => classMap({
				'mdc-tab-indicator__content': true,
				'mdc-tab-indicator__content--underline': type() === 'underline',
				'mdc-tab-indicator__content--icon': type() === 'icon',
				[content$class()]: true
			}),
			() => Object.entries($.get(contentStyles)).map(([name, value]) => `${name}: ${value};`).join(' '),
			() => prefixFilter(restProps, 'content$')
		]
	);

	var node = $.child(span_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span_1);
	$.bind_this(span_1, ($$value) => content = $$value, () => content);
	$.action(span_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), content$use);
	$.reset(span);
	$.bind_this(span, ($$value) => element = $$value, () => element);
	$.action(span, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, span);

	return $.pop($$exports);
}