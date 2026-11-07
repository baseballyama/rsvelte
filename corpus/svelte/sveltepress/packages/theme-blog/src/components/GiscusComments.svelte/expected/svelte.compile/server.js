import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { blogConfig } from 'virtual:sveltepress/blog-config';

export default function GiscusComments($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let container = void 0;

		function giscusTheme(mode) {
			return mode === 'light' ? 'light' : 'dark_dimmed';
		}

		onMount(() => {
			const cfg = blogConfig.giscus;

			if (!cfg || !container) return;

			const s = document.createElement('script');

			s.src = 'https://giscus.app/client.js';
			s.async = true;
			s.crossOrigin = 'anonymous';
			s.setAttribute('data-repo', cfg.repo);
			s.setAttribute('data-repo-id', cfg.repoId);
			s.setAttribute('data-category', cfg.category);
			s.setAttribute('data-category-id', cfg.categoryId);
			s.setAttribute('data-mapping', cfg.mapping ?? 'pathname');
			s.setAttribute('data-strict', '0');
			s.setAttribute('data-reactions-enabled', cfg.reactionsEnabled === false ? '0' : '1');
			s.setAttribute('data-emit-metadata', '0');
			s.setAttribute('data-input-position', cfg.inputPosition ?? 'bottom');
			s.setAttribute('data-theme', giscusTheme(document.documentElement.dataset.theme));
			s.setAttribute('data-lang', cfg.lang ?? 'en');
			container.appendChild(s);

			const obs = new MutationObserver(() => {
				const iframe = container?.querySelector('iframe.giscus-frame');

				iframe?.contentWindow?.postMessage(
					{
						giscus: {
							setConfig: { theme: giscusTheme(document.documentElement.dataset.theme) }
						}
					},
					'https://giscus.app'
				);
			});

			obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

			return () => obs.disconnect();
		});

		if (blogConfig.giscus) {
			$$renderer.push(`<!--[0--><section class="sp-giscus svelte-uwwdv3" aria-label="Comments"></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}