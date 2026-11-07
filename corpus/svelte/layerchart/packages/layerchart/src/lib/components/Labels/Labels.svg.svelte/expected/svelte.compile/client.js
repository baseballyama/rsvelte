import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LabelsBase from './Labels.base.svelte';
import Text from '../Text/Text.svg.svelte';
import Group from '../Group/Group.svg.svelte';
import Points from '../Points/Points.svg.svelte';
import Link from '../Link/Link.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Labels_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	LabelsBase($$anchor, $.spread_props(
		{
			get Text() {
				return Text;
			},

			get Group() {
				return Group;
			},

			get Points() {
				return Points;
			},

			get Link() {
				return Link;
			}
		},
		() => props
	));
}