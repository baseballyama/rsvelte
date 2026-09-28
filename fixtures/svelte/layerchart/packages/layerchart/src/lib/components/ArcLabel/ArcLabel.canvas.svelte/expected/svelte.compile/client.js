import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArcLabelBase from './ArcLabel.base.svelte';
import Path from '../Path/Path.canvas.svelte';
import Text from '../Text/Text.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ArcLabel_canvas($$anchor, $$props) {
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