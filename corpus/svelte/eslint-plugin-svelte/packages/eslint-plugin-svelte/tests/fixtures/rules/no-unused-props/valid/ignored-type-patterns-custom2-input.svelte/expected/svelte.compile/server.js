import * as $ from 'svelte/internal/server';

export default function Ignored_type_patterns_custom2_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { config, value } = $$props;

		console.log(value, config.secretKey);
	});
}