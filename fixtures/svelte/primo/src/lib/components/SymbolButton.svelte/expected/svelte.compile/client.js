import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IFrame from '$lib/builder/components/IFrame.svelte';
import { LibrarySymbols } from '$lib/pocketbase/collections';
import { block_html } from '$lib/builder/code_generators';
import { locale } from '$lib/builder/stores/app';
import { useContent } from '$lib/Content.svelte';
import * as _ from 'lodash-es';

var root = $.from_html(`<div class="text-xs leading-none truncate"> </div>`);
var root_1 = $.from_html(`<div class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Free</div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<div class="w-full p-3 pt-2 bg-gray-900 truncate flex items-center justify-between"><div class="flex items-center gap-2" style="width: calc(100% - 2rem)"><!> <!></div> <!></div>`);
var root_4 = $.from_html(`<div class="relative w-full bg-gray-900 rounded-bl rounded-br"><button><!></button> <!></div>`);

export default function SymbolButton($$anchor, $$props) {
	$.push($$props, true);

	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/** @type {Props} */
	let children = $.prop($$props, 'children', 3, null),
		show_price = $.prop($$props, 'show_price', 3, false);

	const code = $.derived(() => $$props.symbol && {
		html: $$props.symbol.html,
		css: $$props.symbol.css,
		js: $$props.symbol.js
	});

	const _data = $.derived(() => useContent($$props.symbol, { target: 'cms' }));
	const data = $.derived(() => $.get(_data) && ($.get(_data)[$locale()] ?? {}));
	let last_input;
	let generated_code = $.state(void 0);

	$.user_effect(() => {
		if (!$.get(code) || !$.get(data)) {
			return;
		}

		// Skip recompilation if data is effectively unchanged
		const input = { code: $.get(code), data: $.get(data) };

		if (_.isEqual(last_input, input)) return;

		last_input = _.cloneDeep(input);

		block_html(input).then((res) => {
			$.set(generated_code, res, true);
		}).catch((error) => {
			console.error('Failed to generate symbol preview:', error);
		});
	});

	const showing_footer = $.derived(() => $$props.symbol?.name || children() || show_price());
	var div = root_4();
	var button = $.child(div);
	let classes;
	var node = $.child(button);

	IFrame(node, {
		get componentCode() {
			return $.get(generated_code);
		}
	});

	$.reset(button);

	var node_1 = $.sibling(button, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_3();
			var div_2 = $.child(div_1);
			var node_2 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var div_3 = root();
					var text = $.only_child(div_3, true);

					$.template_effect(() => $.set_text(text, $$props.symbol?.name));
					$.append($$anchor, div_3);
				};

				$.if(node_2, ($$render) => {
					if ($$props.symbol?.name) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_4 = root_1();

					$.append($$anchor, div_4);
				};

				$.if(node_3, ($$render) => {
					if (show_price()) $$render(consequent_1);
				});
			}

			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_5 = root_2();
					var node_5 = $.child(div_5);

					$.snippet(node_5, children);
					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				$.if(node_4, ($$render) => {
					if (children()) $$render(consequent_2);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(showing_footer)) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.template_effect(() => classes = $.set_class(button, 1, 'w-full rounded-tl rounded-tr overflow-hidden', null, classes, { rounded: !$.get(showing_footer) }));

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);