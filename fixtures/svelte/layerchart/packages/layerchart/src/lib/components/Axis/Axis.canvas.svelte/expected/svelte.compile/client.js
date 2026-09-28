import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AxisBase from './Axis.base.svelte';
import Group from '../Group/Group.canvas.svelte';
import Line from '../Line/Line.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';
import Rule from '../Rule/Rule.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Axis_canvas($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	AxisBase($$anchor, $.spread_props(
		{
			get Group() {
				return Group;
			},

			get Line() {
				return Line;
			},

			get Text() {
				return Text;
			},

			get Rule() {
				return Rule;
			}
		},
		() => props
	));
}