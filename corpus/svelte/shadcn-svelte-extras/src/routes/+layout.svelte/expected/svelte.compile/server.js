import * as $ from 'svelte/internal/server';
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

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const REGISTRY_OPTIONS = ['@ieedan/shadcn-svelte-extras'];
		let { data, children } = $$props;
		let metaTags = $.derived(() => deepMerge(data.baseMetaTags, page.data.pageMetaTags ?? {}));
		const agent = new PersistedState('user-agent-preference', 'npm');
		const installer = new PersistedState('user-installer-preference', 'jsrepo');
		const registry = new PersistedState('user-registry-preference', '@ieedan/shadcn-svelte-extras');

		// svelte-ignore state_referenced_locally
		UserConfigContext.set(new UserConfig(data.userConfig));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTags($$renderer, $.spread_props([metaTags()]));
			$$renderer.push(`<!----> `);

			if (!dev) {
				$$renderer.push('<!--[0-->');

				UmamiAnalytics($$renderer, {
					srcURL: 'https://cloud.umami.is/script.js',
					websiteID: '07b288db-9239-4fbf-9d68-4f2ca9b63f89'
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			ModeWatcher($$renderer, {});
			$$renderer.push(`<!----> `);
			Toaster($$renderer, {});
			$$renderer.push(`<!----> `);

			if (Add.Provider) {
				$$renderer.push('<!--[-->');

				Add.Provider($$renderer, {
					registryOptions: REGISTRY_OPTIONS,
					get agent() {
						return agent.current;
					},

					set agent($$value) {
						agent.current = $$value;
						$$settled = false;
					},

					get installer() {
						return installer.current;
					},

					set installer($$value) {
						installer.current = $$value;
						$$settled = false;
					},

					get registry() {
						return registry.current;
					},

					set registry($$value) {
						registry.current = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}