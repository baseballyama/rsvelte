import * as $ from 'svelte/internal/server';
import { customJs, lang } from '$lib/Stores';
import Toggle from '$lib/Components/Toggle.svelte';

export default function CustomJs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container svelte-17atuhh"><div><h2>${$.escape($.store_get($$store_subs ??= {}, '$lang', lang)('javascript_module'))}</h2> <p class="svelte-17atuhh"><code class="svelte-17atuhh">/data/custom_javascript.js</code></p></div> <div${$.attr_style('', { 'margin-top': '1.3rem' })}>`);

			Toggle($$renderer, {
				get checked() {
					return $.store_get($$store_subs ??= {}, '$customJs', customJs);
				},

				set checked($$value) {
					$.store_set(customJs, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <input type="hidden"${$.attr('value', $.store_get($$store_subs ??= {}, '$customJs', customJs))} name="custom_js"/></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}