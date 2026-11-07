import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import JsrepoLogo from '$lib/components/logos/jsrepo.svelte';
import ShadcnSvelteLogo from '$lib/components/logos/shadcn-svelte.svelte';
import { cn } from '$lib/utils';

export default function Add_installer_logo($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => cn('size-4 shrink-0', $$props.class));

				JsrepoLogo($$anchor, {
					get class() {
						return $.get($0);
					}
				});
			}
		};

		var alternate = ($$anchor) => {
			ShadcnSvelteLogo($$anchor, {
				get class() {
					return $$props.class;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.installer === 'jsrepo') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}