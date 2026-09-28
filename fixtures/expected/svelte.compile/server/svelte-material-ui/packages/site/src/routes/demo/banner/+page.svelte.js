import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Fixed from './_Fixed.svelte';
import General from './_General.svelte';
import Icon from './_Icon.svelte';
import DisableAutoClose from './_DisableAutoClose.svelte';

export default function _page($$renderer) {
	$.head('z2xaz', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Banner - SMUI</title>`);
		});
	});

	Fixed($$renderer, {});
	$$renderer.push(`<!----> <section class="svelte-z2xaz"><h2 class="svelte-z2xaz">Banner</h2> <h5 class="svelte-z2xaz">Installation</h5> <pre class="demo-spaced svelte-z2xaz">npm i -D @smui/banner</pre> <h5 class="svelte-z2xaz">Demos</h5> `);
	Demo($$renderer, { component: 'Shown above.', file: 'banner/_Fixed.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: General,
		file: 'banner/_General.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Banner options`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Icon,
		file: 'banner/_Icon.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Banner with icon`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: DisableAutoClose,
		file: 'banner/_DisableAutoClose.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disable auto close`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section>`);
}