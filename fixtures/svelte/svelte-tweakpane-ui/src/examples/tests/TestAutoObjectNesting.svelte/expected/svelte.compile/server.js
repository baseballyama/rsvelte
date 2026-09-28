import * as $ from 'svelte/internal/server';
import { AutoObject } from '$lib';

export default function TestAutoObjectNesting($$renderer) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/10
	let object = {
		aFolder: {
			aSetting: 0,
			bFolder: { bSetting: 0, cFolder: { cSetting: 0 } }
		}
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		AutoObject($$renderer, {
			get object() {
				return object;
			},

			set object($$value) {
				object = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>Value: <span>${$.escape(JSON.stringify(object))}</span></pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}