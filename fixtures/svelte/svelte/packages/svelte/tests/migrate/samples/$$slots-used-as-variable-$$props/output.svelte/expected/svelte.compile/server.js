import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {import('svelte').Snippet} [message]
		 * @property {import('svelte').Snippet<[any]>} [extra]
		 */
		/** @type {Props & { [key: string]: any }} */
		let { $$slots, $$events, ...props } = $$props;

		let showMessage = props.message;
		let extraTitle = $.derived(() => props.extra);

		if (showMessage) {
			$$renderer.push('<!--[0-->');
			props.message?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> ${$.escape(props)}`);
	});
}