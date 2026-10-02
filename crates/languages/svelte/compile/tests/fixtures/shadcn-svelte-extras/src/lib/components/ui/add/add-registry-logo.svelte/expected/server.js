import * as $ from 'svelte/internal/server';
import GithubLogo from '$lib/components/logos/github.svelte';
import JsrepoLogo from '$lib/components/logos/jsrepo.svelte';
import GitlabLogo from '$lib/components/logos/gitlab.svelte';
import BitbucketLogo from '$lib/components/logos/bitbucket.svelte';
import AzureDevops from '$lib/components/logos/azure-devops.svelte';
import ServerIcon from '@lucide/svelte/icons/server';
import { cn } from '$lib/utils';

export default function Add_registry_logo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			registry,
			class: className,
			fallbackIcon: FallbackIcon = ServerIcon,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const logos = [
			{ matches: (r) => r.startsWith('@'), logo: JsrepoLogo },
			{
				matches: (r) => r.startsWith('github') || r.startsWith('https://github.com/'),
				logo: GithubLogo
			},

			{
				matches: (r) => r.startsWith('gitlab') || r.startsWith('https://gitlab.com/'),
				logo: GitlabLogo
			},

			{
				matches: (r) => r.startsWith('bitbucket') || r.startsWith('https://bitbucket.org/'),
				logo: BitbucketLogo
			},
			{ matches: (r) => r.startsWith('azure'), logo: AzureDevops }
		];

		const logo = $.derived(() => logos.find((l) => l.matches(registry)));

		if (logo()) {
			$$renderer.push('<!--[0-->');

			if (logo().logo) {
				$$renderer.push('<!--[-->');
				logo().logo($$renderer, $.spread_props([{ class: className }, rest]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');

			if (FallbackIcon) {
				$$renderer.push('<!--[-->');
				FallbackIcon($$renderer, $.spread_props([{ class: cn('text-muted-foreground', className) }, rest]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}