import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer, $$props) {
	let nested;

	function show() {
		nested.show();
	}

	function hide() {
		nested.hide();
	}

	Nested($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { data }) => {
				$$renderer.push(`<!---->${$.escape(data)}`);
			}
		}
	});

	$.bind_props($$props, { show, hide });
}