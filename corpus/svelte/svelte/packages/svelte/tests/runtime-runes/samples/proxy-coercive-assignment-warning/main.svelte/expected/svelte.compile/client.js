import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

const funBind = ($$anchor, context = $.noop) => {
	var input = root();

	$.bind_this(input, (e) => context().element = e, () => {});
	$.append($$anchor, input);
};

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<button> </button> <div>x</div> <input type="checkbox"/> <input type="checkbox"/> <!> <!> <!> <!> <button>change opacity (fixed)</button> <button>change opacity (unknown)</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let opacity = $.prop($$props, 'opacity', 3, 0.5);
	let entries = $.proxy([]);
	let object = $.proxy({ items: null, group: [] });
	let elementFunBind = $.state(void 0);

	// should omit $.assign via static analysis
	const fixed = (node) => node.style.opacity = 0.5;

	// should use $.assign, but it should not warn
	const unknown = (node) => node.style.opacity = opacity();

	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var div = $.sibling(button, 2);

	$.bind_this(div, ($$value) => entries[0] = $$value, () => entries?.[0]);

	var input_1 = $.sibling(div, 2);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = '1';

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = '2';

	var node_1 = $.sibling(input_2, 2);

	$.bind_this(Test(node_1, {}), ($$value) => entries[1] = $$value, () => entries?.[1]);

	var node_2 = $.sibling(node_1, 2);

	$.bind_this(Test(node_2, {}), (v) => entries[2] = v, () => entries[2]);

	var node_3 = $.sibling(node_2, 2);

	Test(node_3, {
		get x() {
			return entries[3];
		},

		set x($$value) {
			entries[3] = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	funBind(node_4, () => ({
		set element(e) {
			$.set(elementFunBind, e, true);
		}
	}));

	var button_1 = $.sibling(node_4, 2);
	var button_2 = $.sibling(button_1, 2);

	$.template_effect(($0) => $.set_text(text, `items: ${$0 ?? ''}`), [() => JSON.stringify(object.items)]);
	$.delegated('click', button, () => (object.items ??= []).push(object.items.length));
	$.bind_group(binding_group, [], input_1, () => object.group, ($$value) => object.group = $$value);
	$.bind_group(binding_group, [], input_2, () => object.group, ($$value) => object.group = $$value);
	$.delegated('click', button_1, (e) => fixed(e.currentTarget));
	$.delegated('click', button_2, (e) => unknown(e.currentTarget));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);