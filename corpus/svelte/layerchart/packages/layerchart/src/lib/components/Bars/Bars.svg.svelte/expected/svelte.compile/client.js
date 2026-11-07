import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BarsBase from './Bars.base.svelte';
import Bar from '../Bar/Bar.svg.svelte';
import Group from '../Group/Group.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Bars_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	BarsBase($$anchor, $.spread_props(
		{
			get Bar() {
				return Bar;
			},

			get Group() {
				return Group;
			}
		},
		() => props
	));
}