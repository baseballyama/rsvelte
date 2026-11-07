import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MonthBase from './Month.base.svelte';
import Rect from '../Rect/Rect.html.svelte';
import Group from '../Group/Group.html.svelte';
import Text from '../Text/Text.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Month_html($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	MonthBase($$anchor, $.spread_props(
		{
			get Rect() {
				return Rect;
			},

			get Group() {
				return Group;
			},

			get Text() {
				return Text;
			}
		},
		() => props
	));
}