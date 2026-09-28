import * as $ from 'svelte/internal/server';
import JsrepoLogo from '$lib/components/logos/jsrepo.svelte';
import ShadcnSvelteLogo from '$lib/components/logos/shadcn-svelte.svelte';
import { cn } from '$lib/utils';

export default function Add_installer_logo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { installer, class: className } = $$props;

		if (installer === 'jsrepo') {
			$$renderer.push('<!--[0-->');
			JsrepoLogo($$renderer, { class: cn('size-4 shrink-0', className) });
		} else {
			$$renderer.push('<!--[-1-->');
			ShadcnSvelteLogo($$renderer, { class: className });
		}

		$$renderer.push(`<!--]-->`);
	});
}