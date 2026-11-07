import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LinkBase from './Link.base.svelte';
import Path from '../Path/Path.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'pathRef']);

export default function Link_svg($$anchor, $$props) {
	$.push($$props, true);

	let pathRef = $.prop($$props, 'pathRef', 15),
		rest = $.rest_props($$props, rest_excludes);

	LinkBase($$anchor, $.spread_props(
		{
			get Path() {
				return Path;
			}
		},
		() => rest,
		{
			get pathRef() {
				return pathRef();
			},

			set pathRef($$value) {
				pathRef($$value);
			}
		}
	));

	$.pop();
}