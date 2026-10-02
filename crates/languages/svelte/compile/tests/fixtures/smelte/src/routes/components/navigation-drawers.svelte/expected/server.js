import * as $ from 'svelte/internal/server';
import Checkbox from "components/Checkbox";
import Code from "docs/Code.svelte";
import { right, elevation, persistent, showNav } from "stores.js";
import drawers from "examples/navigation-drawers.txt";

export default function Navigation_drawers($$renderer) {
	var $$store_subs;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Checkbox($$renderer, {
			label: 'Show drawer',
			get checked() {
				return $.store_get($$store_subs ??= {}, '$showNav', showNav);
			},

			set checked($$value) {
				$.store_set(showNav, $$value);
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			label: 'With elevation',
			get checked() {
				return $.store_get($$store_subs ??= {}, '$elevation', elevation);
			},

			set checked($$value) {
				$.store_set(elevation, $$value);
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			label: 'Placed on the right',
			get checked() {
				return $.store_get($$store_subs ??= {}, '$right', right);
			},

			set checked($$value) {
				$.store_set(right, $$value);
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			label: 'Persistent',
			get checked() {
				return $.store_get($$store_subs ??= {}, '$persistent', persistent);
			},

			set checked($$value) {
				$.store_set(persistent, $$value);
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Code($$renderer, { code: drawers });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}