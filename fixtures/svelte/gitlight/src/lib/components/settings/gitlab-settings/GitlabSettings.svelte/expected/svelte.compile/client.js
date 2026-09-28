import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Switch } from '$lib/components';
import { ExternalLinkIcon } from '$lib/icons';
import { settings } from '$lib/stores';
import GitlabRepos from './GitlabRepos.svelte';

var root = $.from_html(`<!> GitLab documentation`, 1);
var root_1 = $.from_html(`<h3>GitLight settings</h3> <!> <span></span> <h3>Review applications</h3> <p class="text svelte-dljcew">You can review GitLight access <a href="https://gitlab.com/oauth/applications" target="_blank" class="svelte-dljcew">here</a>. More documentation:</p> <div class="button-container svelte-dljcew"><!></div> <span></span> <h3>Repositories</h3> <!>`, 1);

export default function GitlabSettings($$anchor, $$props) {
	$.push($$props, true);

	const $settings = () => $.store_get(settings, '$settings', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	Switch(node, {
		label: 'Show only notifications in which you are involved',
		get active() {
			return $settings().gitlabOnlyInvolved;
		},

		set active($$value) {
			$.store_mutate(settings, $.untrack($settings).gitlabOnlyInvolved = $$value, $.untrack($settings));
		}
	});

	var div = $.sibling(node, 8);
	var node_1 = $.child(div);

	Button(node_1, {
		href: 'https://docs.gitlab.com/ee/integration/oauth_provider.html',
		external: true,
		small: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			ExternalLinkIcon(node_2, {});
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_3 = $.sibling(div, 6);

	GitlabRepos(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}