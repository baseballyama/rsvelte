import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useGeolocation } from "runed";
import { DemoContainer, Button } from "@svecodocs/kit";

var root = $.from_html(`<pre> </pre> <pre> </pre> <pre> </pre> <pre> </pre> <div class="mt-4 flex items-center gap-2"><!> <!></div>`, 1);

export default function Use_geolocation($$anchor, $$props) {
	$.push($$props, true);

	const location = useGeolocation();

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var pre = $.first_child(fragment_1);
			var text = $.only_child(pre);
			var pre_1 = $.sibling(pre, 2);
			var text_1 = $.only_child(pre_1);
			var pre_2 = $.sibling(pre_1, 2);
			var text_2 = $.only_child(pre_2);
			var pre_3 = $.sibling(pre_2, 2);
			var text_3 = $.only_child(pre_3);
			var div = $.sibling(pre_3, 2);
			var node = $.child(div);

			Button(node, {
				size: 'sm',
				get onclick() {
					return location.pause;
				},

				get disabled() {
					return location.isPaused;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Pause');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => !location.isPaused);

				Button(node_1, {
					size: 'sm',
					get onclick() {
						return location.resume;
					},

					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Resume');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div);

			$.template_effect(
				($0, $1) => {
					$.set_text(text, `Coords: ${$0 ?? ''}`);
					$.set_text(text_1, `Located at: ${location.position.timestamp ?? ''}`);
					$.set_text(text_2, `Error: ${$1 ?? ''}`);
					$.set_text(text_3, `Is Supported: ${location.isSupported ?? ''}`);
				},
				[
					() => JSON.stringify(location.position.coords, null, 2),
					() => JSON.stringify(location.error, null, 2)
				]
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}