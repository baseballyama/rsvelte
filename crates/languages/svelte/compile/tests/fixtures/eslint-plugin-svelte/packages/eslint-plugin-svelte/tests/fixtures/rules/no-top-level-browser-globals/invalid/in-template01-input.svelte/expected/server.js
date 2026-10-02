import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';

export default function In_template01_input($$renderer) {
	$$renderer.push(`<!---->${$.escape(location.href)} `);

	if (browser) {
		$$renderer.push(`<!--[0-->${$.escape(location.href)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (!browser) {
		$$renderer.push(`<!--[0-->${$.escape(location.href)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (browser) {
		$$renderer.push(`<!--[0-->${$.escape(location.href)}`);
	} else {
		$$renderer.push(`<!--[-1-->${$.escape(location.href)}`);
	}

	$$renderer.push(`<!--]--> `);

	if (!browser) {
		$$renderer.push(`<!--[0-->${$.escape(location.href)}`);
	} else {
		$$renderer.push(`<!--[-1-->${$.escape(location.href)}`);
	}

	$$renderer.push(`<!--]-->`);
}