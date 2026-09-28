import * as $ from 'svelte/internal/server';
import { Toaster } from "../Toaster.svelte";

const toaster = new Toaster();

export const addToast = toaster.addToast;

export default function ToastTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div${$.attributes({ ...toaster.root })}><!--[-->`);

		const each_array = $.ensure_array_like(toaster.toasts);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let toast = each_array[$$index];

			$$renderer.push(`<div${$.attributes({ ...toast.content })}><h3${$.attributes({ ...toast.title })}>${$.escape(toast.data.title)}</h3> <div${$.attributes({ ...toast.description })}>${$.escape(toast.data.description)}</div> <button${$.attributes({ ...toast.close, 'aria-label': 'dismiss alert' })}>X</button></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}