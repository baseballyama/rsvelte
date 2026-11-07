import * as $ from 'svelte/internal/server';
import { onMount, getContext, tick } from 'svelte';
import { classMap, exclude, prefixFilter, useActions } from '@smui/common/internal';
import Checkmark from './Checkmark.svelte';

export default function Text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The tab index.
		 */
		/**
		 * A spot for the checkbox icon.
		 *
		 * You probably shouldn't customize this.
		 */
		let {
			use = [],
			class: className = '',
			tabindex = getContext('SMUI:chips:chip:focusable') ? 0 : -1,
			children,
			checkbox,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let input = undefined;
		let primaryAction = undefined;
		let internalAttrs = {};
		const nonInteractive = getContext('SMUI:chips:nonInteractive');
		const choice = getContext('SMUI:chips:choice');
		const filter = getContext('SMUI:chips:filter');
		const isSelected = getContext('SMUI:chips:chip:isSelected');

		const roleProps = $.derived(() => ({
			role: $.store_get($$store_subs ??= {}, '$filter', filter)
				? 'checkbox'
				: $.store_get($$store_subs ??= {}, '$choice', choice) ? 'radio' : 'button',
			tabindex
		}));

		const SMUIChipsPrimaryActionMount = getContext('SMUI:chips:primary-action:mount');
		const SMUIChipsPrimaryActionUnmount = getContext('SMUI:chips:primary-action:unmount');

		onMount(() => {
			let accessor = { focus, addAttr };

			SMUIChipsPrimaryActionMount && SMUIChipsPrimaryActionMount(accessor);

			return () => {
				SMUIChipsPrimaryActionUnmount && SMUIChipsPrimaryActionUnmount(accessor);
			};
		});

		function addAttr(name, value) {
			if (internalAttrs[name] !== value) {
				internalAttrs[name] = value;
			}
		}

		function waitForTabindex(fn) {
			if (internalAttrs['tabindex'] !== getElement().getAttribute('tabindex')) {
				tick().then(fn);
			} else {
				fn();
			}
		}

		function focus() {
			// Let the tabindex change propagate.
			waitForTabindex(() => {
				primaryAction && primaryAction.focus();
			});
		}

		function getInput() {
			return input && input.getElement();
		}

		function getElement() {
			return element;
		}

		if ($.store_get($$store_subs ??= {}, '$filter', filter)) {
			$$renderer.push('<!--[0-->');

			Checkmark($$renderer, $.spread_props([
				{ children: checkbox },
				prefixFilter(restProps, 'checkmark$')
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span${$.attributes({ role: 'gridcell', ...prefixFilter(restProps, 'container$') })}>`);

		if ($.store_get($$store_subs ??= {}, '$nonInteractive', nonInteractive)) {
			$$renderer.push(`<!--[0--><span${$.attributes({ class: 'mdc-chip__text', ...prefixFilter(restProps, 'text$') })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({
				class: $.clsx(classMap({ 'mdc-chip__primary-action': true, [className]: true })),
				...$.store_get($$store_subs ??= {}, '$filter', filter) || $.store_get($$store_subs ??= {}, '$choice', choice)
					? {
						'aria-selected': $.store_get($$store_subs ??= {}, '$isSelected', isSelected) ? 'true' : 'false'
					}
					: {},
				...roleProps(),
				...internalAttrs,
				...exclude(restProps, ['checkmark$', 'container$', 'text$'])
			})}><span${$.attributes({ class: 'mdc-chip__text', ...prefixFilter(restProps, 'text$') })}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></span></span>`);
		}

		$$renderer.push(`<!--]--></span>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { focus, getInput, getElement });
	});
}