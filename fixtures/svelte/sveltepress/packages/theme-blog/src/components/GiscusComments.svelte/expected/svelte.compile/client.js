import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { blogConfig } from 'virtual:sveltepress/blog-config';

var root = $.from_html(`<section class="sp-giscus svelte-uwwdv3" aria-label="Comments"></section>`);

export default function GiscusComments($$anchor, $$props) {
	$.push($$props, true);

	let container = $.state(void 0);

	function giscusTheme(mode) {
		return mode === 'light' ? 'light' : 'dark_dimmed';
	}

	onMount(() => {
		const cfg = blogConfig.giscus;

		if (!cfg || !$.get(container)) return;

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
		$.get(container).appendChild(s);

		const obs = new MutationObserver(() => {
			const iframe = $.get(container)?.querySelector('iframe.giscus-frame');

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var section = root();

			$.bind_this(section, ($$value) => $.set(container, $$value), () => $.get(container));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if (blogConfig.giscus) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}