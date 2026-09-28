import * as $ from 'svelte/internal/server';
import { Button, FloatingPortal, Tile } from "carbon-components-svelte";

export default function FloatingPortalIntrinsicAlign($$renderer) {
	let anchorStart = null;
	let anchorCenter = null;
	let anchorEnd = null;
	let openStart = false;
	let openCenter = false;
	let openEnd = false;

	$$renderer.push(`<p style="margin-bottom: 1rem;">With <code>intrinsicWidth</code>, use <code>intrinsicAlign</code> to pin the
  floating box to the start, center, or end of the anchor along the cross axis
  (horizontal for top/bottom).</p> <div style="display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-start;"><div><div>`);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Start`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	FloatingPortal($$renderer, {
		anchor: anchorStart,
		open: openStart,
		intrinsicWidth: true,
		intrinsicAlign: 'start',
		children: ($$renderer) => {
			Tile($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Align start`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><div>`);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Center`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	FloatingPortal($$renderer, {
		anchor: anchorCenter,
		open: openCenter,
		intrinsicWidth: true,
		intrinsicAlign: 'center',
		children: ($$renderer) => {
			Tile($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Align center`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div><div>`);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->End`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	FloatingPortal($$renderer, {
		anchor: anchorEnd,
		open: openEnd,
		intrinsicWidth: true,
		intrinsicAlign: 'end',
		children: ($$renderer) => {
			Tile($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Align end`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}