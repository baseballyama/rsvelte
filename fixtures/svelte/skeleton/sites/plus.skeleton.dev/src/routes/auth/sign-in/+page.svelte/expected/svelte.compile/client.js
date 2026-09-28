import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { supportedOAuthProviders } from '$lib/auth/supported-oauth-providers';
import SignInButton from '$lib/components/auth/sign-in-button.svelte';

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<div class="space-y-6 text-center"><header class="space-y-2"><h1 class="h2">Sign In</h1> <p class="opacity-60">Choose a service and sign in to Skeleton Plus.</p></header> <div class="grid grid-cols-1 items-center gap-2"></div></div>`);

export default function _page($$anchor) {
	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => supportedOAuthProviders, $.index, ($$anchor, provider) => {
		SignInButton($$anchor, {
			get providerId() {
				return $.get(provider).id;
			},
			class: 'btn btn-lg preset-filled w-full max-w-xs',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				$.component(node, () => $.get(provider).Icon, ($$anchor, provider_Icon) => {
					provider_Icon($$anchor, {});
				});

				var span = $.sibling(node, 2);
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $.get(provider).name));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}