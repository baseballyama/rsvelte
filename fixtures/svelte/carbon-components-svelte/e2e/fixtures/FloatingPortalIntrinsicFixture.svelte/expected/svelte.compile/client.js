import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingPortal } from "carbon-components-svelte";

var root = $.from_html(`<span data-testid="floating-inner">Intrinsic width content</span>`);
var root_1 = $.from_html(`<button type="button" data-testid="toggle">Toggle</button> <div data-testid="anchor" style="width: 320px;">Wide anchor</div> <!>`, 1);

export default function FloatingPortalIntrinsicFixture($$anchor) {
	let open = false;
	let anchor;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);

	$.bind_this(div, ($$value) => anchor = $$value, () => anchor);

	var node = $.sibling(div, 2);

	FloatingPortal(node, {
		get anchor() {
			return anchor;
		},

		get open() {
			return open;
		},
		direction: 'bottom',
		intrinsicWidth: true,
		intrinsicAlign: 'start',
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	$.event('click', button, () => open = !open);
	$.append($$anchor, fragment);
}