import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { classMap } from '@smui/common/internal';
import Paper from '@smui/paper';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'fabInset',
	'children'
]);

export default function Section($$anchor, $$props) {
	$.push($$props, true);

	const $color = () => $.store_get(color, '$color', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Use an inset cutout styling for the FAB.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		fabInset = $.prop($$props, 'fabInset', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	const color = getContext('SMUI:bottom-app-bar:color');

	function getElement() {
		return element.getElement();
	}

	var $$exports = { getElement };

	{
		let $0 = $.derived(() => classMap({
			'smui-bottom-app-bar__section': true,
			'smui-bottom-app-bar__section--fab-inset': fabInset(),
			[className()]: true
		}));

		$.bind_this(
			Paper($$anchor, $.spread_props(
				{
					get use() {
						return use();
					},

					get class() {
						return $.get($0);
					},

					get color() {
						return $color();
					},
					variant: 'unelevated',
					square: true
				},
				() => restProps,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node = $.first_child(fragment_1);

						$.snippet(node, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			)),
			($$value) => element = $$value,
			() => element
		);
	}

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}