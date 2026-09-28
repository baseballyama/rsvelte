import * as $ from 'svelte/internal/server';
import { ExpandableTile } from "carbon-components-svelte";

export default function ExpandableTileFixture($$renderer) {
	ExpandableTile($$renderer, {
		'data-testid': 'expandable-tile',
		$$slots: {
			above: ($$renderer) => {
				$$renderer.push(`<span slot="above" data-testid="above-fold">Above the fold</span>`);
			},

			below: ($$renderer) => {
				$$renderer.push(`<span slot="below" data-testid="below-fold">Below the fold</span>`);
			}
		}
	});
}