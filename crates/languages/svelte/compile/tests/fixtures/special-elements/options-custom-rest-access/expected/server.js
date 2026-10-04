import * as $ from 'svelte/internal/server';

export default function Options_custom_rest_access($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, $$slots, $$events, ...rest } = $$props;
		function change() {
			rest.other = 1;
			rest.count++;
			let x;
			x = rest.other;
			return rest.other;
		}
		$$renderer.push(`<p>${$.escape(rest.other)} ${$.escape(rest.value)} ${$.escape(rest['other'])}</p>`);
	});
}
