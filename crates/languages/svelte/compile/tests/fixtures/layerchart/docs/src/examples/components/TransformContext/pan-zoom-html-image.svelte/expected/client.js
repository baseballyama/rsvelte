import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { Chart, Layer } from 'layerchart';
import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

export let tags = ['tiger'];

var root = $.from_html(`<div class="h-full flex justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ghostscript_Tiger.svg/500px-Ghostscript_Tiger.svg.png" alt="Ghostscript Tiger" class="h-full"/></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Pan_zoom_html_image($$anchor) {
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

				TransformContextControls(node, {});

				var node_1 = $.sibling(node, 2);

				Layer(node_1, {
					type: 'html',
					children: ($$anchor, $$slotProps) => {
						var div = root();

						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}
}