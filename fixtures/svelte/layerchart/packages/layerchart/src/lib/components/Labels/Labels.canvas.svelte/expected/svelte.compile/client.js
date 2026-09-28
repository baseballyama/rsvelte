import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LabelsBase from './Labels.base.svelte';
import Text from '../Text/Text.canvas.svelte';
import Group from '../Group/Group.canvas.svelte';
import Points from '../Points/Points.canvas.svelte';
import Link from '../Link/Link.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Labels_canvas($$anchor, $$props) {
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