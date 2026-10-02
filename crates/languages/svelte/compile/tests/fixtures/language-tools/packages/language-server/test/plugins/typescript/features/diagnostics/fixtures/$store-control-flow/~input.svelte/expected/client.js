import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

const moduleStore = writable({ a: 'hi' });
var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $moduleStore = () => $.store_get(moduleStore, '$moduleStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = writable({ a: 'hi' });

	function isBoolean(t) {
		return !!t;
	}

	let test;

	if ($store()) {
		if (typeof $store().a === 'string') {
			test = $store().a === 'string' || $store().a === true;
		} else {
			if (isBoolean($store().a.b)) {
				test = $store().a.b;
				test;
			} else {
				test = $store().a.b;
			}
		}
	}

	if ($moduleStore()) {
		if (typeof $moduleStore().a === 'string') {
			test = $moduleStore().a === 'string' || $moduleStore().a === true;
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, test = $store().a === 'string' || $store().a === true));
					$.append($$anchor, text);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					{
						var consequent_1 = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, test = $store().a.b));
							$.append($$anchor, text_1);
						};

						var d = $.derived(() => isBoolean($store().a.b));

						var alternate = ($$anchor) => {
							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, test = $store().a.b));
							$.append($$anchor, text_2);
						};

						$.if(node_2, ($$render) => {
							if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if (typeof $store().a === 'string') $$render(consequent); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($store()) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_4 = $.first_child(fragment_6);

			{
				var consequent_3 = ($$anchor) => {
					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, test = $moduleStore().a === 'string' || $moduleStore().a === true));
					$.append($$anchor, text_3);
				};

				$.if(node_4, ($$render) => {
					if (typeof $moduleStore().a === 'string') $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_6);
		};

		$.if(node_3, ($$render) => {
			if ($moduleStore()) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}