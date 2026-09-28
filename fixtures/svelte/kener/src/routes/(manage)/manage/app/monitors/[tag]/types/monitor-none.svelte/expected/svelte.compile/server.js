import * as $ from 'svelte/internal/server';
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { Label } from "$lib/components/ui/label/index.js";

export default function Monitor_none($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data = void 0 } = $$props;

		if (data.overrideWithLastKnownStatus === undefined) {
			data.overrideWithLastKnownStatus = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="bg-muted/50 rounded-lg p-6 text-center"><p class="text-muted-foreground text-sm">This monitor type does not have any automatic checks. Status updates must be made manually via the API or through
      incidents.</p></div> <div class="flex items-start gap-3 rounded-lg border p-4">`);

			Checkbox($$renderer, {
				id: 'none-override-last-known-status',
				get checked() {
					return data.overrideWithLastKnownStatus;
				},

				set checked($$value) {
					data.overrideWithLastKnownStatus = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid gap-1.5 leading-none">`);

			Label($$renderer, {
				for: 'none-override-last-known-status',
				class: 'cursor-pointer',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Override with last known status`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-muted-foreground text-sm">On each scheduled run, reuse the last manual status (created using the API) so this monitor keeps that state in
        status history, uptime, and alert evaluation until you change it.</p></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}