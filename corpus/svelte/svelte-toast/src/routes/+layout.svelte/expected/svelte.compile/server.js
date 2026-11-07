import * as $ from 'svelte/internal/server';
import '@fontsource-variable/inter';
import 'prismjs/themes/prism-tomorrow.css';
import '../app.css';
import { dev } from '$app/environment';

export default function _layout($$renderer, $$props) {
	$.head('12qhfyh', $$renderer, ($$renderer) => {
		if (!dev) {
			$$renderer.push(`<!--[0--><script async="" src="https://www.googletagmanager.com/gtag/js?id=G-G9JC5N7N1H"></script>`);
			$$renderer.push(` `);

			$$renderer.push(`<script>
    window.dataLayer = window.dataLayer || []
    function gtag() {
      dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', 'G-G9JC5N7N1H')
    </script>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}