import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EditableValue from './EditableValue.svelte';

var root = $.from_html(`<span class="c-punc"></span><!><span class="c-punc"></span>`, 1);
var root_1 = $.from_html(` <span class="c-attr"> </span><span class="c-punc">=</span><!>`, 1);
var root_2 = $.from_html(`<pre class="ln-hero-code-pre"><code><span class="c-kw">import</span><span class="c-punc"></span><span class="c-comp"> </span><span class="c-punc"></span><span class="c-kw">from</span><span class="c-str"> '@components/</span><span class="c-str"> </span><span class="c-str">';</span> <span class="c-kw">function</span><span class="c-fn"> App</span><span class="c-punc"></span> <span class="c-kw">return</span><span class="c-punc"> (</span> <span class="c-comp"></span><span class="c-comp"> </span><!> <span class="c-comp">/&gt;</span> <span class="c-punc">)</span> <span class="c-punc"></span></code></pre>`);

export default function InteractiveCode($$anchor, $$props) {
	$.push($$props, true);

	const importOpen = ' { ';
	const importClose = ' } ';
	const newline2 = '\n\n';
	const newlineReturn = '\n  ';
	const newlineComponent = '\n    ';
	const newline = '\n';
	const newlineProp = '\n      ';
	const openBrace = '{';
	const closeBrace = '}';
	const openTag = '<';
	var pre = root_2();
	var code = $.child(pre);
	var span = $.sibling($.child(code));

	span.textContent = ' { ';

	var span_1 = $.sibling(span);
	var text = $.only_child(span_1, true);
	var span_2 = $.sibling(span_1);

	span_2.textContent = ' } ';

	var span_3 = $.sibling(span_2, 3);
	var text_1 = $.only_child(span_3, true);
	var text_2 = $.sibling(span_3, 2, true);

	text_2.nodeValue = '\n\n';

	var span_4 = $.sibling(text_2, 3);

	span_4.textContent = '() {';

	var text_3 = $.sibling(span_4, 1, true);

	text_3.nodeValue = '\n  ';

	var text_4 = $.sibling(text_3, 3, true);

	text_4.nodeValue = '\n    ';

	var span_5 = $.sibling(text_4);

	span_5.textContent = '<';

	var span_6 = $.sibling(span_5);
	var text_5 = $.only_child(span_6, true);
	var node = $.sibling(span_6);

	$.each(node, 17, () => $$props.def.props, (prop) => prop.name, ($$anchor, prop) => {
		$.next();

		var fragment = root_1();
		var text_6 = $.first_child(fragment, true);

		text_6.nodeValue = '\n      ';

		var span_7 = $.sibling(text_6);
		var text_7 = $.only_child(span_7, true);
		var node_1 = $.sibling(span_7, 2);

		{
			var consequent = ($$anchor) => {
				EditableValue($$anchor, {
					type: 'color',
					get value() {
						return $$props.values[$.get(prop).name];
					},
					onChange: (v) => $$props.onChange($.get(prop).name, v)
				});
			};

			var alternate = ($$anchor) => {
				var fragment_2 = root();
				var span_8 = $.first_child(fragment_2);

				span_8.textContent = '{';

				var node_2 = $.sibling(span_8);

				EditableValue(node_2, {
					get type() {
						return $.get(prop).type;
					},

					get value() {
						return $$props.values[$.get(prop).name];
					},
					onChange: (v) => $$props.onChange($.get(prop).name, v),
					get min() {
						return $.get(prop).min;
					},

					get max() {
						return $.get(prop).max;
					},

					get step() {
						return $.get(prop).step;
					}
				});

				var span_9 = $.sibling(node_2);

				span_9.textContent = '}';
				$.append($$anchor, fragment_2);
			};

			$.if(node_1, ($$render) => {
				if ($.get(prop).type === 'color') $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.template_effect(() => $.set_text(text_7, $.get(prop).name));
		$.append($$anchor, fragment);
	});

	var text_8 = $.sibling(node, 1, true);

	text_8.nodeValue = '\n    ';

	var text_9 = $.sibling(text_8, 2, true);

	text_9.nodeValue = '\n  ';

	var text_10 = $.sibling(text_9, 2, true);

	text_10.nodeValue = '\n';

	var span_10 = $.sibling(text_10);

	span_10.textContent = '}';
	$.reset(code);
	$.reset(pre);

	$.template_effect(() => {
		$.set_text(text, $$props.def.component);
		$.set_text(text_1, $$props.def.component);
		$.set_text(text_5, $$props.def.component);
	});

	$.append($$anchor, pre);
	$.pop();
}