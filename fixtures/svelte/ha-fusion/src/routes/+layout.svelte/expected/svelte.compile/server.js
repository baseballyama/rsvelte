import * as $ from 'svelte/internal/server';
import { motion } from '$lib/Stores';
import { fade } from 'svelte/transition';
import { Modals, closeModal } from 'svelte-modals';
import Loader from '$lib/Components/Loader.svelte';
import '@fontsource-variable/inter';
import { expoOut } from 'svelte/easing';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$.head('12qhfyh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>FUSION</title>`);
			});

			$$renderer.push(`<meta name="description" content="fusion"/> <meta charset="utf-8"/>`);
		});

		Modals($$renderer, {
			$$slots: {
				backdrop: ($$renderer) => {
					$$renderer.push(`<div slot="backdrop" class="backdrop svelte-12qhfyh" role="button" tabindex="0"></div>`);
				},

				loading: ($$renderer) => {
					$$renderer.push(`<div slot="loading">`);
					Loader($$renderer, {});
					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}