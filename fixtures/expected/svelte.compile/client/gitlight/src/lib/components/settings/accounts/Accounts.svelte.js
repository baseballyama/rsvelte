import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import { GithubIcon, GitlabIcon } from '$lib/icons';
import Account from './Account.svelte';

var root = $.from_html(`<ul class="accounts-wrapper svelte-sf1dmd"><!> <!></ul>`);

export default function Accounts($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const githubUser = $page().data.session?.githubUser;
	const gitlabUser = $page().data.session?.gitlabUser;
	var ul = root();
	var node = $.child(ul);

	Account(node, {
		title: 'GitHub',
		provider: 'github',
		get user() {
			return githubUser;
		},

		$$slots: {
			icon: ($$anchor, $$slotProps) => {
				GithubIcon($$anchor, { slot: 'icon' });
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Account(node_1, {
		title: 'GitLab',
		provider: 'gitlab',
		get user() {
			return gitlabUser;
		},

		$$slots: {
			icon: ($$anchor, $$slotProps) => {
				GitlabIcon($$anchor, { slot: 'icon' });
			}
		}
	});

	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
	$$cleanup();
}