import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import { processCode } from '$lib/builder/utils';
import * as Components from '$lib/builder/components';

var root = $.from_html(`<div class="check svelte-1w96kt8"><!></div>`);
var root_1 = $.from_html(`<div class="error svelte-1w96kt8"><!></div>`);
var root_2 = $.from_html(`<button class="sidebar-symbol svelte-1w96kt8"><div class="symbol svelte-1w96kt8"><!> <!></div></button>`);

export default function Site_Symbol($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {any} symbol
	 * @property {any} site
	 * @property {string} [append]
	 * @property {boolean} [checked]
	 * @property {() => void} onclick
	 * @property {() => void} onmousedown
	 * @property {() => void} onmouseup
	 */
	/** @type {Props} */
	let symbol = $.prop($$props, 'symbol', 15),
		append = $.prop($$props, 'append', 3, ''),
		checked = $.prop($$props, 'checked', 3, false);

	let name_el;
	let renaming = false;

	async function toggle_name_input() {
		renaming = !renaming;

		// workaround for inability to see cursor when div empty
		if (symbol().name === '') {
			symbol(symbol().name = 'Block', true);
		}
	}

	let height = $.state(0);
	let componentCode = $.state(void 0);
	let cachedSymbol = {};
	let component_error = $.state(void 0);

	async function compile_component_code(symbol, language) {
		if (_.isEqual(cachedSymbol.code, symbol.code) && _.isEqual(cachedSymbol.entries, symbol.entries)) {
			return;
		}

		let res = await processCode({
			component: {
				head: $$props.site.code.head,
				css: symbol.code.css,
				html: symbol.code.html,
				data: symbol.entries[language]
			},
			buildStatic: true,
			hydrated: true
		});

		if (res.error) {
			$.set(component_error, res.error, true);
		} else {
			$.set(component_error, null);
			res.css = res.css;
			$.set(componentCode, res, true);
			cachedSymbol = _.cloneDeep({ code: symbol.code, entries: symbol.entries });
		}
	}

	// move cursor to end of name
	$.user_effect(() => {
		if (name_el) {
			const range = document.createRange();
			const sel = window.getSelection();

			range.setStart(name_el, 1);
			range.collapse(true);
			sel?.removeAllRanges();
			sel?.addRange(range);
		}
	});

	$.user_pre_effect(() => {
		compile_component_code(symbol(), 'en');
	});

	var button = root_2();
	var div = $.child(button);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Icon(node_1, { icon: 'material-symbols:check' });
			$.reset(div_1);
			$.transition(1, div_1, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (checked()) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var node_3 = $.child(div_2);

			Icon(node_3, { icon: 'bxs:error' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var fragment = $.comment();
			var node_4 = $.first_child(fragment);

			$.key(node_4, () => $.get(componentCode), ($$anchor) => {
				var fragment_1 = $.comment();
				var node_5 = $.first_child(fragment_1);

				$.component(node_5, () => Components.IFrame, ($$anchor, Components_IFrame) => {
					Components_IFrame($$anchor, {
						get append() {
							return append();
						},

						get componentCode() {
							return $.get(componentCode);
						},

						get height() {
							return $.get(height);
						},

						set height($$value) {
							$.set(height, $$value, true);
						}
					});
				});

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node_2, ($$render) => {
			if ($.get(component_error)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.reset(button);

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.delegated('mousedown', div, function (...$$args) {
		$$props.onmousedown?.apply(this, $$args);
	});

	$.delegated('mouseup', div, function (...$$args) {
		$$props.onmouseup?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click', 'mousedown', 'mouseup']);