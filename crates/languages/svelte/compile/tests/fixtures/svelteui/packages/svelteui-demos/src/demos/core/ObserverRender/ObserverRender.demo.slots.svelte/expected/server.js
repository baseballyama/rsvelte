import * as $ from 'svelte/internal/server';
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

export default function ObserverRender_demo_slots($$renderer) {
	ObserverRender($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: (
				$$renderer,
				{ entry, node, observer, scrollDirection, visible }
			) => {
				Stack($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div>entry: ${$.escape(JSON.stringify(entry))}</div> <div>node: ${$.escape(JSON.stringify(node))}</div> <div>observer: ${$.escape(JSON.stringify(observer))}</div> <div>scrollDirection: ${$.escape(JSON.stringify(scrollDirection))}</div> <div>visible: ${$.escape(visible)}</div>`);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}