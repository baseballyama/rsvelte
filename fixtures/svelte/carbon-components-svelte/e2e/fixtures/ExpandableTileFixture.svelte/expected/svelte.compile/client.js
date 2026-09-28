import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ExpandableTile } from "carbon-components-svelte";

var root = $.from_html(`<span slot="above" data-testid="above-fold">Above the fold</span>`);
var root_1 = $.from_html(`<span slot="below" data-testid="below-fold">Below the fold</span>`);

export default function ExpandableTileFixture($$anchor) {
	ExpandableTile($$anchor, {
		'data-testid': 'expandable-tile',
		$$slots: {
			above: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			},

			below: ($$anchor, $$slotProps) => {
				var span_1 = root_1();

				$.append($$anchor, span_1);
			}
		}
	});
}