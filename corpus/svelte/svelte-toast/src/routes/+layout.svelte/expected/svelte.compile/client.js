import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '@fontsource-variable/inter';
import 'prismjs/themes/prism-tomorrow.css';
import '../app.css';
import { dev } from '$app/environment';

var root = $.with_script($.from_html(
	`<script async="" src="https://www.googletagmanager.com/gtag/js?id=G-G9JC5N7N1H"></script> <script>
    window.dataLayer = window.dataLayer || []
    function gtag() {
      dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', 'G-G9JC5N7N1H')
    </script>`,
	1
));

export default function _layout($$anchor, $$props) {
	var fragment_2 = $.comment();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();

				$.next(2);
				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (!dev) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	var node_1 = $.first_child(fragment_2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.append($$anchor, fragment_2);
}