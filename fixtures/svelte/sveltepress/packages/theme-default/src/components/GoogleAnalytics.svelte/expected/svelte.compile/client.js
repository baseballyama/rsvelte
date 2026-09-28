import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import themeOption from 'virtual:sveltepress/theme-default';

export default function GoogleAnalytics($$anchor, $$props) {
	$.push($$props, true);

	const ga = themeOption.ga;

	$.head('a5vbz7', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.html(node_1, () => `<${'script'} async src="${`https://www.googletagmanager.com/gtag/js?id=${ga}`}"></${'script'}>
    <${'script'}>
      window.dataLayer = window.dataLayer || []
      function gtag() {
        dataLayer.push(arguments)
      }
      gtag('js', new Date())

      gtag('config', '${ga}')
  </${'script'}>
  `);

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (ga) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.pop();
}