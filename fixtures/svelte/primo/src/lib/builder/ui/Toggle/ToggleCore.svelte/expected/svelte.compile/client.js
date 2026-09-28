import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'toggled',
	'disabled',
	'children'
]);

export default function ToggleCore($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {any} [id] - Specify the id
	 * @property {boolean} [toggled] - Specify whether the toggle switch is toggled
	 * @property {boolean} [disabled] - Set to `true` to disable the button
	 * @property {import('svelte').Snippet<[any]>} [children]
	 */
	/** @type {Props & { [key: string]: any }} */
	let id = $.prop($$props, 'id', 19, () => 'toggle' + Math.random().toString(36)),
		toggled = $.prop($$props, 'toggled', 11, true),
		disabled = $.prop($$props, 'disabled', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	let label = $.derived(() => ({ for: id() }));

	let button = $.derived(() => ({
		...rest,
		id: id(),
		disabled: disabled(),
		'aria-checked': toggled(),
		type: 'button',
		role: 'switch'
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ label: $.get(label), button: $.get(button) }));
	$.append($$anchor, fragment);
	$.pop();
}