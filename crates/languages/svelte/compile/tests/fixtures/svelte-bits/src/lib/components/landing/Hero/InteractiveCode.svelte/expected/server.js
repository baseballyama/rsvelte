import * as $ from 'svelte/internal/server';
import EditableValue from './EditableValue.svelte';

export default function InteractiveCode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { def, values, onChange } = $$props;
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

		$$renderer.push(`<pre class="ln-hero-code-pre"><code><span class="c-kw">import</span><span class="c-punc"> { </span><span class="c-comp">${$.escape(def.component)}</span><span class="c-punc"> } </span><span class="c-kw">from</span><span class="c-str"> '@components/</span><span class="c-str">${$.escape(def.component)}</span><span class="c-str">';</span>

<span class="c-kw">function</span><span class="c-fn"> App</span><span class="c-punc">() {</span>
  <span class="c-kw">return</span><span class="c-punc"> (</span>
    <span class="c-comp">&lt;</span><span class="c-comp">${$.escape(def.component)}</span><!--[-->`);

		const each_array = $.ensure_array_like(def.props);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let prop = each_array[$$index];

			$$renderer.push(`<!---->
      <span class="c-attr">${$.escape(prop.name)}</span><span class="c-punc">=</span>`);

			if (prop.type === 'color') {
				$$renderer.push('<!--[0-->');

				EditableValue($$renderer, {
					type: 'color',
					value: values[prop.name],
					onChange: (v) => onChange(prop.name, v)
				});
			} else {
				$$renderer.push(`<!--[-1--><span class="c-punc">{</span>`);

				EditableValue($$renderer, {
					type: prop.type,
					value: values[prop.name],
					onChange: (v) => onChange(prop.name, v),
					min: prop.min,
					max: prop.max,
					step: prop.step
				});

				$$renderer.push(`<!----><span class="c-punc">}</span>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->
    <span class="c-comp">/></span>
  <span class="c-punc">)</span>
<span class="c-punc">}</span></code></pre>`);
	});
}