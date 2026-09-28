import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { computeBitMask } from '../../lib/computeBitMask.js';

export default function CollisionGroups($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { groups, filter, memberships, children } = $$props;

		setContext('threlte-rapier-collision-group', () => computeBitMask(groups, filter, memberships));
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}