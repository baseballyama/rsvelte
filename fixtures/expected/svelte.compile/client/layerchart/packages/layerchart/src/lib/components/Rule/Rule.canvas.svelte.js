import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RuleBase from './Rule.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Circle from '../Circle/Circle.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Rule_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	RuleBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Line() {
				return Line;
			},

			get Circle() {
				return Circle;
			}
		},
		() => props
	));
}