import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import Loader2Icon from '@lucide/svelte/icons/loader-2';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'role',
	'name',
	'color',
	'stroke',
	'aria-label'
]);

export default function Spinner($$anchor, $$props) {
	$.push($$props, true);

	let role = $.prop($$props, 'role', 3, 'status'),
		// we add name, color, and stroke for compatibility with different icon libraries props
		ariaLabel = $.prop($$props, 'aria-label', 3, 'Loading'),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => $$props.name === null ? undefined : $$props.name);
		let $1 = $.derived(() => $$props.color === null ? undefined : $$props.color);
		let $2 = $.derived(() => $$props.stroke === null ? undefined : $$props.stroke);
		let $3 = $.derived(() => cn('size-4 animate-spin', $$props.class));

		Loader2Icon($$anchor, $.spread_props(
			{
				get role() {
					return role();
				},

				get name() {
					return $.get($0);
				},

				get color() {
					return $.get($1);
				},

				get stroke() {
					return $.get($2);
				},

				get 'aria-label'() {
					return ariaLabel();
				},

				get class() {
					return $.get($3);
				}
			},
			() => restProps
		));
	}

	$.pop();
}