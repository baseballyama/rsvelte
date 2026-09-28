import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import dayjs from 'dayjs';
import { Datepicker } from '../../index';

var root = $.from_html(`<button class="svelte-wm2vmo"><!></button>`);

export default function CustomTrigger($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store;

	Datepicker($$anchor, {
		get store() {
			return store;
		},

		set store($$value) {
			store = $$value;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const key = $.derived(() => $$slotProps.key);
				const send = $.derived(() => $$slotProps.send);
				const receive = $.derived(() => $$slotProps.receive);
				var button = root();
				var node = $.child(button);

				{
					var consequent = ($$anchor) => {
						var text = $.text();

						$.template_effect(($0) => $.set_text(text, $0), [() => dayjs($store().selected).format('ddd MMM D, YYYY')]);
						$.append($$anchor, text);
					};

					var alternate = ($$anchor) => {
						var text_1 = $.text('Pick a Date');

						$.append($$anchor, text_1);
					};

					$.if(node, ($$render) => {
						if ($store()?.hasChosen) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(button);
				$.transition(1, button, () => $.get(receive), () => ({ key: $.get(key) }));
				$.transition(2, button, () => $.get(send), () => ({ key: $.get(key) }));
				$.append($$anchor, button);
			}
		}
	});

	$.pop();
	$$cleanup();
}