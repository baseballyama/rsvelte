import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$.head('b1qx3e', $$renderer, ($$renderer) => {
		$$renderer.push(`<script async="" src="https://saki-production.up.railway.app/googletagmanager/gtag/js?id=G-Q3MLRXCBFT"></script>`);
		$$renderer.push(` `);

		$$renderer.push(`<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-Q3MLRXCBFT", { transport_url: "https://saki-production.up.railway.app/google-analytics" });
  </script>`);
	});

	children($$renderer);
	$$renderer.push(`<!---->`);
}