import * as $ from 'svelte/internal/server';

export default function RunesGeneric($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { readonly, can_bind = void 0 } = $$props;

		function only_bind() {
			return true;
		}

		$.bind_props($$props, { can_bind, only_bind });
	});
}