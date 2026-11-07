import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { RatingGroup } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'max',
	'orientation',
	'class'
]);

export default function Star_rating($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, 0),
		max = $.prop($$props, 'max', 3, 5),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('group flex w-fit place-items-center gap-1 rounded-md outline-hidden', $$props.class));

		$.component(node, () => RatingGroup.Root, ($$anchor, RatingGroup_Root) => {
			RatingGroup_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					},

					get max() {
						return max();
					},

					get orientation() {
						return orientation();
					}
				},
				() => rest,
				{
					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}