import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(
	`<script async="" src="https://saki-production.up.railway.app/googletagmanager/gtag/js?id=G-Q3MLRXCBFT"></script> <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-Q3MLRXCBFT", { transport_url: "https://saki-production.up.railway.app/google-analytics" });
  </script>`,
	1
));

export default function _layout($$anchor, $$props) {
	var fragment_1 = $.comment();

	$.head('b1qx3e', ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment_1);
}