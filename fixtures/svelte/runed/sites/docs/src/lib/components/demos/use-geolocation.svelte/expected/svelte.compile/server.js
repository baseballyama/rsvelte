import * as $ from 'svelte/internal/server';
import { useGeolocation } from "runed";
import { DemoContainer, Button } from "@svecodocs/kit";

export default function Use_geolocation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const location = useGeolocation();

		DemoContainer($$renderer, {
			class: 'flex flex-col gap-1',
			children: ($$renderer) => {
				$$renderer.push(`<pre>Coords: ${$.escape(JSON.stringify(location.position.coords, null, 2))}</pre> <pre>Located at: ${$.escape(location.position.timestamp)}</pre> <pre>Error: ${$.escape(JSON.stringify(location.error, null, 2))}</pre> <pre>Is Supported: ${$.escape(location.isSupported)}</pre> <div class="mt-4 flex items-center gap-2">`);

				Button($$renderer, {
					size: 'sm',
					onclick: location.pause,
					disabled: location.isPaused,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Pause`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					onclick: location.resume,
					disabled: !location.isPaused,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Resume`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}