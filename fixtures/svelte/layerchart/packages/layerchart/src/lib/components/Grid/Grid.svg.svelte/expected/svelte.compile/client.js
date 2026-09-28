import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GridBase from './Grid.base.svelte';
import Group from '../Group/Group.svg.svelte';
import Line from '../Line/Line.svg.svelte';
import Circle from '../Circle/Circle.svg.svelte';
import Rule from '../Rule/Rule.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Grid_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	GridBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Line() {
				return Line;
			},

			get Circle() {
				return Circle;
			},

			get Rule() {
				return Rule;
			}
		},
		() => props
	));
}