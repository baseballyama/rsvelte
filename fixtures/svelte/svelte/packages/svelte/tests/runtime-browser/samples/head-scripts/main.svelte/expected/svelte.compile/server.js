import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function jssrc(src) {
			return 'data:text/javascript;base64, ' + btoa(src);
		}

		const scriptSrcs = [1, 2, 3].map((n) => jssrc(`document.getElementById('r${n}').innerText = '${n}';`));

		$.head('1m15e9h', $$renderer, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(scriptSrcs);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let src = each_array[$$index];

				$$renderer.push(`<script${$.attr('src', src)} async="" defer=""></script>`);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<b id="r1">?</b><b id="r2">?</b><b id="r3">?</b>`);
	});
}