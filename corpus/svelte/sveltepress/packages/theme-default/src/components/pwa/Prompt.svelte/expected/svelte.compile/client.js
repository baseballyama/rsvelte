import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import themeOptions from 'virtual:sveltepress/theme-default';
import Close from '../icons/Close.svelte';
import Btn from './Btn.svelte';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div class="pwa-toast svelte-c4cnpn" role="alert"><div class="pwa-title svelte-c4cnpn"> </div> <div class="message svelte-c4cnpn"><span> </span></div> <div class="actions svelte-c4cnpn"><!> <!></div></div>`);

export default function Prompt($$anchor, $$props) {
	$.push($$props, true);

	const dispatcher = createEventDispatcher();

	function handleClose() {
		dispatcher('close');
	}

	const DEFAULT_TIP = 'Tip';
	const DEFAULT_CLOSE = 'Close';
	var div = root_1();
	var div_1 = $.child(div);
	var text = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var span = $.child(div_2);
	var text_1 = $.only_child(span, true);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node = $.child(div_3);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	Btn(node_1, {
		onclick: handleClose,
		flat: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var text_2 = $.first_child(fragment);
			var node_2 = $.sibling(text_2);

			Close(node_2, {});
			$.template_effect(() => $.set_text(text_2, `${(themeOptions?.i18n?.pwa?.close || DEFAULT_CLOSE) ?? ''} `));
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, themeOptions?.i18n?.pwa?.tip || DEFAULT_TIP);
		$.set_text(text_1, $$props.message);
	});

	$.transition(1, div, () => fade);
	$.append($$anchor, div);
	$.pop();
}