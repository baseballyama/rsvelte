import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Button from '../Button/Button.svelte';
import { Toast } from './toast';
import { Fieldset } from './fields';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M223.69,42.18l-58.22,192a8,8,0,0,1-14.92,1.25L110,149.81a8,8,0,0,0-3.8-3.8L20.58,105.45a8,8,0,0,1,1.25-14.92l192-58.22A8,8,0,0,1,223.69,42.18Z" opacity="0.2"></path><path d="M227.32,28.68a16,16,0,0,0-15.66-4.08l-.15,0L19.57,82.84a16,16,0,0,0-2.42,29.84l85.62,40.55,40.55,85.62A15.86,15.86,0,0,0,157.74,248q.69,0,1.38-.06a15.88,15.88,0,0,0,14-11.51l58.2-191.94c0-.05,0-.1,0-.15A16,16,0,0,0,227.32,28.68ZM157.83,231.85l-.05.14L118.42,148.9l47.24-47.25a8,8,0,0,0-11.31-11.31L107.1,137.58,24,98.22l.14,0L216,40Z"></path></svg> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<form class="svelte-6t7hek"><!> <!></form>`);

export default function Form($$anchor, $$props) {
	$.push($$props, true);

	const $open = () => $.store_get(open, '$open', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let submitButton = $.prop($$props, 'submitButton', 3, 'submit'),
		method = $.prop($$props, 'method', 3, 'post'),
		id = $.prop($$props, 'id', 19, () => $$props.action);

	let open = writable(false);
	let type = 'info';
	let title = '';
	let message = '';
	var form = root_2();
	var node = $.child(form);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	Fieldset(node_1, {
		align: 'right',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Button(node_2, {
				class: 'pl-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var text = $.sibling($.first_child(fragment_1), 1, true);

					$.template_effect(() => $.set_text(text, submitButton()));
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Toast(node_3, {
				type,
				title,
				message,
				get open() {
					$.mark_store_binding();

					return $open();
				},

				set open($$value) {
					$.store_set(open, $$value);
				}
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	$.template_effect(() => {
		$.set_attribute(form, 'id', id());
		$.set_attribute(form, 'method', method());
	});

	$.event('submit', form, function (...$$args) {
		$$props.onsubmit?.apply(this, $$args);
	});

	$.append($$anchor, form);
	$.pop();
	$$cleanup();
}