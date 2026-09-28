import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ObserverRender, Stack } from '@svelteuidev/core';

const code = `
<script>
	import { ObserverRender } from '@svelteuidev/core';
<\/script>

<ObserverRender let:entry let:node let:observer let:scrollDirection let:visible>
	<div>
		entry: {entry}
		node: {node}
		observer: {observer}
		scrollDirection: {scrollDirection}
		visible: {visible}
	</div>
</ObserverRender>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div> </div> <div> </div> <div> </div> <div> </div> <div> </div>`, 1);

export default function ObserverRender_demo_slots($$anchor) {
	ObserverRender($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const entry = $.derived(() => $$slotProps.entry);
				const node = $.derived(() => $$slotProps.node);
				const observer = $.derived(() => $$slotProps.observer);
				const scrollDirection = $.derived(() => $$slotProps.scrollDirection);
				const visible = $.derived(() => $$slotProps.visible);

				Stack($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var div = $.first_child(fragment_2);
						var text = $.only_child(div);
						var div_1 = $.sibling(div, 2);
						var text_1 = $.only_child(div_1);
						var div_2 = $.sibling(div_1, 2);
						var text_2 = $.only_child(div_2);
						var div_3 = $.sibling(div_2, 2);
						var text_3 = $.only_child(div_3);
						var div_4 = $.sibling(div_3, 2);
						var text_4 = $.only_child(div_4);

						$.template_effect(
							($0, $1, $2, $3) => {
								$.set_text(text, `entry: ${$0 ?? ''}`);
								$.set_text(text_1, `node: ${$1 ?? ''}`);
								$.set_text(text_2, `observer: ${$2 ?? ''}`);
								$.set_text(text_3, `scrollDirection: ${$3 ?? ''}`);
								$.set_text(text_4, `visible: ${$.get(visible) ?? ''}`);
							},
							[
								() => JSON.stringify($.get(entry)),
								() => JSON.stringify($.get(node)),
								() => JSON.stringify($.get(observer)),
								() => JSON.stringify($.get(scrollDirection))
							]
						);

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}