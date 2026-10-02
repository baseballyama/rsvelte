import * as $ from 'svelte/internal/server';

export default function ModalDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			showModal = void 0,
			stopPropagation = true,
			onclick,
			children
		} = $$props;

		let dialog = void 0;

		function handleDialogClick(event) {
			if (event.target === event.currentTarget) {
				dialog?.close();
			}
		}

		function handleContentClick(event) {
			if (stopPropagation) {
				event.stopPropagation();
			}

			onclick?.(event);
		}

		if (showModal) {
			$$renderer.push(`<!--[0--><dialog class="svelte-fampxd"><div class="svelte-fampxd">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div></dialog>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { showModal });
	});
}