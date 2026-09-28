import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { computeBitMask } from '../../lib/computeBitMask.js';

export default function CollisionGroups($$anchor, $$props) {
	$.push($$props, true);
	setContext('threlte-rapier-collision-group', () => computeBitMask($$props.groups, $$props.filter, $$props.memberships));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}