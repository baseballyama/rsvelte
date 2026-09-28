import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GithubLogo from "$lib/components/logos/github.svelte";
import JsrepoLogo from "$lib/components/logos/jsrepo.svelte";
import GitlabLogo from "$lib/components/logos/gitlab.svelte";
import BitbucketLogo from "$lib/components/logos/bitbucket.svelte";
import AzureDevops from "$lib/components/logos/azure-devops.svelte";
import ServerIcon from "@lucide/svelte/icons/server";
import { cn } from "$lib/utils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'registry',
	'class',
	'fallbackIcon'
]);

export default function Add_registry_logo($$anchor, $$props) {
	$.push($$props, true);

	let FallbackIcon = $.prop($$props, 'fallbackIcon', 3, ServerIcon),
		rest = $.rest_props($$props, rest_excludes);

	const logos = [
		{ matches: (r) => r.startsWith("@"), logo: JsrepoLogo },
		{
			matches: (r) => r.startsWith("github") || r.startsWith("https://github.com/"),
			logo: GithubLogo
		},

		{
			matches: (r) => r.startsWith("gitlab") || r.startsWith("https://gitlab.com/"),
			logo: GitlabLogo
		},

		{
			matches: (r) => r.startsWith("bitbucket") || r.startsWith("https://bitbucket.org/"),
			logo: BitbucketLogo
		},
		{ matches: (r) => r.startsWith("azure"), logo: AzureDevops }
	];

	const logo = $.derived(() => logos.find((l) => l.matches($$props.registry)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $.get(logo).logo, ($$anchor, logo_logo) => {
				logo_logo($$anchor, $.spread_props(
					{
						get class() {
							return $$props.class;
						}
					},
					() => rest
				));
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => cn("text-muted-foreground", $$props.class));

				$.component(node_2, FallbackIcon, ($$anchor, FallbackIcon_1) => {
					FallbackIcon_1($$anchor, $.spread_props(
						{
							get class() {
								return $.get($0);
							}
						},
						() => rest
					));
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($.get(logo)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}