import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GridBase from './Grid.base.svelte';
import Group from '../Group/Group.html.svelte';
import Line from '../Line/Line.html.svelte';
import Circle from '../Circle/Circle.html.svelte';
import Rule from '../Rule/Rule.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Grid_html($$anchor, $$props) {
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