import * as $ from 'svelte/internal/server';

export default function ToastMessage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toast } = $$props;

		$$renderer.push(`<div${$.attributes({ class: '_sft-message', ...toast.ariaProps }, 'svelte-1g19uu6')}>`);

		if (typeof toast.message === 'string') {
			$$renderer.push(`<!--[0-->${$.escape(toast.message)}`);
		} else {
			$$renderer.push('<!--[-1-->');

			const Message = toast.message;

			if (Message) {
				$$renderer.push('<!--[-->');
				Message($$renderer, $.spread_props([{ toast }, toast.props]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--></div>`);
	});
}