import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { motion } from '$lib/Stores';
import { fade } from 'svelte/transition';
import { Modals, closeModal } from 'svelte-modals';
import Loader from '$lib/Components/Loader.svelte';
import '@fontsource-variable/inter';
import { expoOut } from 'svelte/easing';

var root = $.from_html(`<meta name="description" content="fusion"/> <meta charset="utf-8"/>`, 1);
var root_1 = $.from_html(`<div slot="backdrop" class="backdrop svelte-12qhfyh" role="button" tabindex="0"></div>`);
var root_2 = $.from_html(`<div slot="loading"><!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $motion = () => $.store_get(motion, '$motion', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment_1 = root_3();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'FUSION';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	Modals(node, {
		$$slots: {
			backdrop: ($$anchor, $$slotProps) => {
				var div = root_1();

				$.event('click', div, () => {
					closeModal();
				});

				$.transition(1, div, () => fade, () => ({ duration: $motion(), easing: expoOut }));
				$.transition(2, div, () => fade, () => ({ duration: $motion() / 2 }));

				$.event('keydown', div, function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				});

				$.append($$anchor, div);
			},

			loading: ($$anchor, $$slotProps) => {
				var div_1 = root_2();
				var node_1 = $.child(div_1);

				Loader(node_1, {});
				$.reset(div_1);
				$.append($$anchor, div_1);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	$.slot(node_2, $$props, 'default', {}, null);
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}