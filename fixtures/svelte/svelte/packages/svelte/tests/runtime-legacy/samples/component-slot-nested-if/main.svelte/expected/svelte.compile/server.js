import * as $ from 'svelte/internal/server';
import Input from "./Input.svelte";
import Display from "./Display.svelte";

export default function Main($$renderer) {
	Input($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { val: foo }) => {
				if (foo) {
					$$renderer.push('<!--[0-->');

					Display($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(foo)}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		}
	});
}