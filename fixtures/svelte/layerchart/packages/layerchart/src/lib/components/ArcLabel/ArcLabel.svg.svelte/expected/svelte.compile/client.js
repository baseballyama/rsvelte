import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArcLabelBase from './ArcLabel.base.svelte';
import Path from '../Path/Path.svg.svelte';
import Text from '../Text/Text.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ArcLabel_svg($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ArcLabelBase($$anchor, $.spread_props(
		{
			get Path() {
				return Path;
			},

			get Text() {
				return Text;
			}
		},
		() => props
	));
}