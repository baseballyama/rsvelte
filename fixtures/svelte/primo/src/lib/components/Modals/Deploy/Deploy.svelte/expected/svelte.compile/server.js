import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { page } from '$app/state';
import { onModKey } from '$lib/builder/utils/keyboard';
import { mod_key_held } from '$lib/builder/stores/app/misc';
import { instance } from '$lib/instance';

export default function Deploy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			stage = void 0,
			publish_fn,
			loading,
			site_host,
			onConnectDomain,
			onClose
		} = $$props;

		let error = null;

		async function handle_publish() {
			try {
				error = null;
				await publish_fn();
				stage = 'PUBLISHED';
			} catch(err) {
				console.error('Publish error:', err);
				error = err.message || err.toString() || 'Failed to publish site';
				stage = 'ERROR';
			}
		}

		stage = stage || 'INITIAL';

		// Set up hotkey listener for Cmd/Ctrl+P to confirm publish
		onModKey('p', () => {
			if (stage === 'INITIAL' && !loading) {
				handle_publish();
			}
		});

		$$renderer.push(`<div class="Deploy primo-reset svelte-cul2vq">`);

		if (stage === 'INITIAL') {
			$$renderer.push(`<!--[0--><div class="container svelte-cul2vq"><h3 class="title svelte-cul2vq">${$.escape(instance.dev_mode ? 'Preview Site' : 'Publish Site')}</h3> `);

			if (site_host) {
				$$renderer.push(`<!--[0--><p class="description svelte-cul2vq">${$.escape(instance.dev_mode
					? 'Your website will be previewed at'
					: 'Your website will be published to')} <a${$.attr('href', `${$.stringify(page.url.protocol)}//${$.stringify(site_host)}`)} target="_blank" class="svelte-cul2vq">${$.escape(site_host)}</a></p>`);
			} else if (instance.dev_mode) {
				$$renderer.push(`<!--[1--><p class="description svelte-cul2vq">Ready to preview your website changes?</p>`);
			} else {
				$$renderer.push(`<!--[-1--><p class="description svelte-cul2vq">Ready to publish? This site has no domain yet — publish now, then connect a domain to make it public.</p>`);
			}

			$$renderer.push(`<!--]--> <div class="buttons svelte-cul2vq"><button class="primo-button svelte-cul2vq"><span>Cancel</span></button> <button class="primo-button primary svelte-cul2vq"${$.attr('disabled', loading, true)}>`);

			Icon($$renderer, {
				icon: loading
					? 'line-md:loading-twotone-loop'
					: instance.dev_mode ? 'lucide:eye' : 'entypo:publish',
				class: $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !loading ? 'invisible' : ''
			});

			$$renderer.push(`<!----> <span${$.attr_class('', void 0, {
				'invisible': $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !loading
			})}>${$.escape(loading
				? instance.dev_mode ? 'Building...' : 'Publishing...'
				: instance.dev_mode ? 'Build Preview' : 'Publish Changes')}</span> `);

			if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !loading) {
				$$renderer.push(`<!--[0--><span class="key-hint svelte-cul2vq">⌘P</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button></div></div>`);
		} else if (stage === 'PUBLISHED') {
			$$renderer.push(`<!--[1--><div class="container svelte-cul2vq"><h3 class="title svelte-cul2vq">${$.escape(instance.dev_mode ? 'Preview Ready!' : 'Published Successfully!')}</h3> <p class="description svelte-cul2vq">`);

			if (site_host) {
				$$renderer.push(`<!--[0-->${$.escape(instance.dev_mode
					? 'Your website preview is ready at'
					: 'Your website changes have been published to')} <a${$.attr('href', `${$.stringify(page.url.protocol)}//${$.stringify(site_host)}`)} target="_blank" class="svelte-cul2vq">${$.escape(site_host)}</a>`);
			} else if (instance.dev_mode) {
				$$renderer.push(`<!--[1-->Your website preview is ready on your local server.`);
			} else {
				$$renderer.push(`<!--[-1-->Your changes are published. Connect a domain to make this site public.`);
			}

			$$renderer.push(`<!--]--></p> <div class="buttons svelte-cul2vq"><button class="primo-button primary svelte-cul2vq"><span>Done</span></button> `);

			if (site_host) {
				$$renderer.push(`<!--[0--><a${$.attr('href', `${$.stringify(page.url.protocol)}//${$.stringify(site_host)}`)} target="_blank" class="primo-button svelte-cul2vq">`);
				Icon($$renderer, { icon: 'lucide:external-link' });
				$$renderer.push(`<!----> <span>${$.escape(instance.dev_mode ? 'View Preview' : 'View Site')}</span></a>`);
			} else if (!instance.dev_mode && onConnectDomain) {
				$$renderer.push(`<!--[1--><button class="primo-button svelte-cul2vq">`);
				Icon($$renderer, { icon: 'lucide:globe' });
				$$renderer.push(`<!----> <span>Connect a domain</span></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else if (stage === 'ERROR') {
			$$renderer.push(`<!--[2--><div class="container svelte-cul2vq"><h3 class="title svelte-cul2vq">Publishing Failed</h3> <p class="error svelte-cul2vq">${$.escape(error)}</p> <div class="buttons svelte-cul2vq"><button class="primo-button svelte-cul2vq"><span>Close</span></button> <button class="primo-button primary svelte-cul2vq"><span>Try Again</span></button></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { stage });
	});
}