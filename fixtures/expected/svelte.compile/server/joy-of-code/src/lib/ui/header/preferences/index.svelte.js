import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { createDropdownMenu, melt } from '@melt-ui/svelte';
import { Cog } from '$lib/icons';
import { sfx } from '$lib/sfx';
import Themes from './themes.svelte';
import Reading from './reading.svelte';
import Dyslexic from './dyslexic.svelte';
import Reset from './reset.svelte';

export default function Preferences($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { elements: { trigger, menu, arrow }, states: { open } } = createDropdownMenu({ arrowSize: 16 });

		$$renderer.push(`<button aria-label="Preferences">`);
		Cog($$renderer, { width: 24, height: 24, 'aria-hidden': true });
		$$renderer.push(`<!----></button> `);

		if (open) {
			$$renderer.push(`<!--[0--><div class="menu svelte-ejy25z"><div></div> <div class="preferences svelte-ejy25z"><span class="title svelte-ejy25z">Preferences</span> <div class="options svelte-ejy25z">`);
			Themes($$renderer, {});
			$$renderer.push(`<!----> `);
			Reading($$renderer, {});
			$$renderer.push(`<!----> `);
			Dyslexic($$renderer, {});
			$$renderer.push(`<!----> `);
			Reset($$renderer, {});
			$$renderer.push(`<!----></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}