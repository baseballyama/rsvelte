import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { Chart, Layer } from 'layerchart';
import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

export let tags = ['tiger'];

var root = $.from_svg(`<image href="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg" width="100%" height="100%"></image>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Pan_zoom_svg_image($$anchor) {
	{
		let $0 = $.derived(() => ({
			mode: 'canvas',
			motion: { type: 'tween', duration: 800, easing: cubicOut },
			scrollMode: 'scale'
		}));

		Chart($$anchor, {
			get transform() {
				return $.get($0);
			},
			clip: true,
			height: 500,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				TransformControls(node, {});

				var node_1 = $.sibling(node, 2);

				Layer(node_1, {
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
}