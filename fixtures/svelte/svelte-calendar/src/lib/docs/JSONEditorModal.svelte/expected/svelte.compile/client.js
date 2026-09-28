import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CrossfadeProvider from '$lib/components/generic/crossfade/CrossfadeProvider.svelte';
import { storeContextKey } from '$lib/context';
import autofocus from '$lib/directives/autofocus';
import blurr from '$lib/directives/blurr';
import { getContext } from 'svelte';

var root = $.from_html(`<form><div class="default-editor svelte-xa8skv"><div class="heading svelte-xa8skv"><span class="label"> </span> <span class="value svelte-xa8skv"> </span></div> <div class="form svelte-xa8skv"><input type="text" class="svelte-xa8skv"/> <button type="submit" class="svelte-xa8skv">save</button> <button class="secondary svelte-xa8skv">revert</button></div></div></form>`);

export default function JSONEditorModal($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = getContext(storeContextKey);
	const originalValue = $store().editing.value;
	const path = $store().editing.mapping.path;
	let newValue = $store().editing.newValue;

	CrossfadeProvider($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const key = $.derived(() => $$slotProps.key);
				const send = $.derived(() => $$slotProps.send);
				const receive = $.derived(() => $$slotProps.receive);
				var form = root();
				var div = $.child(form);
				var div_1 = $.child(div);
				var span = $.child(div_1);
				var text = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_1 = $.only_child(span_1, true);

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var input = $.child(div_2);

				$.remove_input_defaults(input);
				$.effect(() => $.bind_value(input, () => newValue, ($$value) => newValue = $$value));
				$.action(input, ($$node, $$action_arg) => autofocus?.($$node, $$action_arg), () => ({ delay: 150 }));

				var button = $.sibling(input, 4);

				$.reset(div_2);
				$.reset(div);
				$.action(div, ($$node) => blurr?.($$node));
				$.effect(() => $.event('blurr', div, () => store.cancelEdit()));

				$.effect(() => $.event('keydown', div, $.stopPropagation(function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				})));

				$.reset(form);

				$.template_effect(() => {
					$.set_text(text, path);
					$.set_text(text_1, originalValue);
				});

				$.event('click', button, $.preventDefault(() => store.cancelEdit()));
				$.transition(1, div, () => $.get(receive), () => ({ key: $.get(key) }));
				$.transition(2, div, () => $.get(send), () => ({ key: $.get(key) }));
				$.event('submit', form, $.preventDefault($.stopPropagation(() => store.commit(newValue))));
				$.append($$anchor, form);
			}
		}
	});

	$.pop();
	$$cleanup();
}