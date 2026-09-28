import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Close, Checkmark, Warning, Error } from './icons';
import { fade } from 'svelte/transition';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<section><span class="svelte-9ofd8p"><!> <b> </b> </span> <span role="button" tabindex="0" class="svelte-9ofd8p"><!></span></section>`);

export default function Toast($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, 'info'),
		open = $.prop($$props, 'open', 15, true),
		title = $.prop($$props, 'title', 3, '');

	let error = $.derived(() => type() == 'error');
	let warning = $.derived(() => type() == 'warning');
	let info = $.derived(() => type() == 'info');
	const icon = { error: Error, warning: Warning, info: Checkmark };
	const dispatch = createEventDispatcher();

	function close() {
		open(false);
		dispatch('toast-closed');
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const SvelteComponent = $.derived(() => icon[type()]);
			var section = root();
			let classes;
			var span = $.child(section);
			var node_1 = $.child(span);

			$.component(node_1, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
				SvelteComponent_1($$anchor, {});
			});

			var b = $.sibling(node_1, 2);
			var text = $.only_child(b, true);
			var text_1 = $.sibling(b, 1, true);

			$.reset(span);

			var span_1 = $.sibling(span, 2);
			var node_2 = $.child(span_1);

			Close(node_2, {});
			$.reset(span_1);
			$.reset(section);

			$.template_effect(() => {
				classes = $.set_class(section, 1, 'svelte-9ofd8p', null, classes, {
					error: $.get(error),
					warning: $.get(warning),
					info: $.get(info)
				});

				$.set_text(text, title() ? title() + ':' : '');
				$.set_text(text_1, $$props.message);
			});

			$.delegated('click', span_1, close);
			$.event('keypress', span_1, close);
			$.transition(3, section, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if (open()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);