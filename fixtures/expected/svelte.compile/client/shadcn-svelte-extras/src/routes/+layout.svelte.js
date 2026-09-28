import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ModeWatcher } from 'mode-watcher';
import '../app.css';
import { page } from '$app/state';
import { Toaster } from '$lib/components/ui/sonner/index.js';
import { MetaTags, deepMerge } from 'svelte-meta-tags';
import * as Add from '$lib/components/ui/add';
import { PersistedState } from 'runed';
import { dev } from '$app/environment';
import { UmamiAnalytics } from '@lukulent/svelte-umami';
import { UserConfig, UserConfigContext } from '$lib/user-config.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const REGISTRY_OPTIONS = ['@ieedan/shadcn-svelte-extras'];
	let metaTags = $.derived(() => deepMerge($$props.data.baseMetaTags, page.data.pageMetaTags ?? {}));
	const agent = new PersistedState('user-agent-preference', 'npm');
	const installer = new PersistedState('user-installer-preference', 'jsrepo');
	const registry = new PersistedState('user-registry-preference', '@ieedan/shadcn-svelte-extras');

	// svelte-ignore state_referenced_locally
	UserConfigContext.set(new UserConfig($$props.data.userConfig));

	var fragment = root();
	var node = $.first_child(fragment);

	MetaTags(node, $.spread_props(() => $.get(metaTags)));

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			UmamiAnalytics($$anchor, {
				srcURL: 'https://cloud.umami.is/script.js',
				websiteID: '07b288db-9239-4fbf-9d68-4f2ca9b63f89'
			});
		};

		$.if(node_1, ($$render) => {
			if (!dev) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	ModeWatcher(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Toaster(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => Add.Provider, ($$anchor, Add_Provider) => {
		Add_Provider($$anchor, {
			get registryOptions() {
				return REGISTRY_OPTIONS;
			},

			get agent() {
				return agent.current;
			},

			set agent($$value) {
				agent.current = $$value;
			},

			get installer() {
				return installer.current;
			},

			set installer($$value) {
				installer.current = $$value;
			},

			get registry() {
				return registry.current;
			},

			set registry($$value) {
				registry.current = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				$.snippet(node_5, () => $$props.children);
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}