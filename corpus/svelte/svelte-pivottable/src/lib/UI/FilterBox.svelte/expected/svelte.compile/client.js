import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

let zIndexGlobal = 1000;
var root = $.from_html(`<em>null</em>`);
var root_1 = $.from_html(`<p><a class="pvtOnly" role="presentation">only</a> <span class="pvtOnlySpacer">&nbsp;</span> <!></p>`);
var root_2 = $.from_html(`<p><input type="text" placeholder="Filter values" class="pvtSearch"/> <br/> <button class="pvtButton"> </button> <button class="pvtButton"> </button></p> <div class="pvtCheckContainer"></div>`, 1);
var root_3 = $.from_html(`<p>(too many values to show)</p>`);
var root_4 = $.from_html(`<div class="pvtFilterBox"><span class="pvtCloseX">×</span> <span class="pvtDragHandle">☰</span> <h4> </h4> <!></div>`);

export default function FilterBox($$anchor, $$props) {
	$.push($$props, true);

	let menuLimit = $.prop($$props, 'menuLimit', 3, 500);
	let globalFilter = getContext("valueFilter");
	let valueFilter = $.proxy(globalFilter[$$props.name] ?? {});
	let filterText = $.state("");

	let shown = $.derived(() => $$props.values.filter(
		matchesFilter, // filterText only to trigger reactivity
		$.get(filterText)
	));

	function toggleValue(value) {
		value in valueFilter
			? removeValuesFromFilter([value])
			: addValuesToFilter([value]);
	}

	function setValuesInFilter(values) {
		Object.keys(valueFilter).forEach((key) => delete valueFilter[key]);
		addValuesToFilter(values);

		// values.forEach((v) => (valueFilter[v] = true));
	}

	function addValuesToFilter(values) {
		values.forEach((v) => valueFilter[v] = true);
		globalFilter[$$props.name] = valueFilter;
	}

	function removeValuesFromFilter(values) {
		values.forEach((v) => delete valueFilter[v]);
		globalFilter[$$props.name] = valueFilter;
	}

	function matchesFilter(x) {
		return x.toLowerCase().trim().includes($.get(filterText).toLowerCase().trim());
	}

	function selectOnly(ev, value) {
		ev.preventDefault();
		ev.stopPropagation();
		setValuesInFilter($$props.values.filter((y) => y !== value));
	}

	function select(all) {
		const func = all ? removeValuesFromFilter : addValuesToFilter;

		return function (ev) {
			ev.stopPropagation();
			func($$props.values.filter(matchesFilter));
		};
	}

	function init(node) {
		node.style.zIndex = "" + zIndexGlobal++;
	}

	var div = root_4();

	$.set_style(div, '', {}, { display: 'block', cursor: 'initial' });

	var h4 = $.sibling($.child(div), 4);
	var text = $.only_child(h4, true);
	var node_1 = $.sibling(h4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_2();
			var p = $.first_child(fragment);
			var input = $.child(p);

			$.remove_input_defaults(input);

			var button = $.sibling(input, 4);
			var event_handler = $.derived(() => select(true));
			var text_1 = $.only_child(button);
			var text_2 = $.sibling(button);

			text_2.nodeValue = '  ';

			var button_1 = $.sibling(text_2);
			var event_handler_1 = $.derived(() => select(false));
			var text_3 = $.only_child(button_1);

			$.reset(p);

			var div_1 = $.sibling(p, 2);

			$.each(div_1, 20, () => $.get(shown), (x) => x, ($$anchor, x) => {
				var p_1 = root_1();
				var a = $.child(p_1);
				var node_2 = $.sibling(a, 4);

				{
					var consequent = ($$anchor) => {
						var em = root();

						$.append($$anchor, em);
					};

					var alternate = ($$anchor) => {
						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, x));
						$.append($$anchor, text_4);
					};

					$.if(node_2, ($$render) => {
						if (x === "") $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(p_1);
				$.template_effect(() => $.set_class(p_1, 1, $.clsx(x in valueFilter ? "" : "selected")));
				$.delegated('click', p_1, () => toggleValue(x));
				$.delegated('click', a, (ev) => selectOnly(ev, x));
				$.append($$anchor, p_1);
			});

			$.reset(div_1);

			$.template_effect(() => {
				$.set_text(text_1, `Select ${($$props.values.length === $.get(shown).length ? "All" : $.get(shown).length) ?? ''}`);
				$.set_text(text_3, `Deselect ${($$props.values.length === $.get(shown).length ? "All" : $.get(shown).length) ?? ''}`);
			});

			$.bind_value(input, () => $.get(filterText), ($$value) => $.set(filterText, $$value));

			$.delegated('click', button, function (...$$args) {
				$.get(event_handler)?.apply(this, $$args);
			});

			$.delegated('click', button_1, function (...$$args) {
				$.get(event_handler_1)?.apply(this, $$args);
			});

			$.append($$anchor, fragment);
		};

		var alternate_1 = ($$anchor) => {
			var p_2 = root_3();

			$.append($$anchor, p_2);
		};

		$.if(node_1, ($$render) => {
			if ($$props.values.length < menuLimit()) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.action(div, ($$node) => init?.($$node));
	$.template_effect(() => $.set_text(text, $$props.name));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);