import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toaster } from "../Toaster.svelte";

const toaster = new Toaster();

export const addToast = toaster.addToast;

var root = $.from_html(`<div><h3> </h3> <div> </div> <button>X</button></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function ToastTest($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();

	$.attribute_effect(div, () => ({ ...toaster.root }));

	$.each(div, 21, () => toaster.toasts, (toast) => toast.id, ($$anchor, toast) => {
		var div_1 = root();

		$.attribute_effect(div_1, () => ({ ...$.get(toast).content }));

		var h3 = $.child(div_1);

		$.attribute_effect(h3, () => ({ ...$.get(toast).title }));

		var text = $.only_child(h3, true);
		var div_2 = $.sibling(h3, 2);

		$.attribute_effect(div_2, () => ({ ...$.get(toast).description }));

		var text_1 = $.only_child(div_2, true);
		var button = $.sibling(div_2, 2);

		$.attribute_effect(button, () => ({ ...$.get(toast).close, 'aria-label': 'dismiss alert' }));
		$.reset(div_1);

		$.template_effect(() => {
			$.set_text(text, $.get(toast).data.title);
			$.set_text(text_1, $.get(toast).data.description);
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}