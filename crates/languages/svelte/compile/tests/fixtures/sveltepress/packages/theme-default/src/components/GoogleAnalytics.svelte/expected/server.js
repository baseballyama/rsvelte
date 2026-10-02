import * as $ from 'svelte/internal/server';
import themeOption from 'virtual:sveltepress/theme-default';

export default function GoogleAnalytics($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ga = themeOption.ga;

		$.head('a5vbz7', $$renderer, ($$renderer) => {
			if (ga) {
				$$renderer.push(`<!--[0-->${$.html(`<${'script'} async src="${`https://www.googletagmanager.com/gtag/js?id=${ga}`}"></${'script'}>
    <${'script'}>
      window.dataLayer = window.dataLayer || []
      function gtag() {
        dataLayer.push(arguments)
      }
      gtag('js', new Date())

      gtag('config', '${ga}')
  </${'script'}>
  `)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});
	});
}