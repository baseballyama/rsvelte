import * as $ from 'svelte/internal/server';
import SkullIcon from '@lucide/svelte/icons/skull';
import { Portal } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	let disabled = true;
	let target = void 0;
	const cardClasses = 'card preset-outlined-surface-300-700 size-24 grid place-items-center p-4';
	const buttonClasses = 'col-span-2 btn preset-filled';

	$$renderer.push(`<div class="grid grid-cols-2 gap-4"><div${$.attr_class($.clsx(cardClasses))}>`);

	Portal($$renderer, {
		disabled,
		target,
		children: ($$renderer) => {
			SkullIcon($$renderer, { class: 'size-8' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(cardClasses))}></div> <button${$.attr_class($.clsx(buttonClasses))}>${$.escape(disabled ? 'Enable' : 'Disable')}</button></div>`);
}