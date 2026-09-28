import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { Chart, Layer } from 'layerchart';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

export let tags = ['tiger'];

var root = $.from_svg(`<image href="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg" width="100%" height="100%"></image>`);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(
	`<p class="text-sm text-surface-content/50 mb-2">Hold <kbd class="px-1 py-0.5 rounded bg-surface-200 text-xs font-mono">⌘ Command</kbd> to zoom with
	scroll</p> <!>`,
	1
);

export default function Scroll_activation_key($$anchor) {
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => ({
			mode: 'canvas',
			motion: { type: 'tween', duration: 800, easing: cubicOut },
			scrollMode: 'scale',
			scrollActivationKey: 'meta'
		}));

		Chart(node, {
			get transform() {
				return $.get($0);
			},
			clip: true,
			height: 500,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				TransformControls(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				Layer(node_2, {
					type: 'svg',
					children: ($$anchor, $$slotProps) => {
						var image = root();

						$.append($$anchor, image);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
}