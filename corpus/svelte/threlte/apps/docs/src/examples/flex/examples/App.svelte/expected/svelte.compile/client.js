import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { NoToneMapping } from 'three';
import { onMount } from 'svelte';
import Common from './examples/Common.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="example-view split-view svelte-1tlet67"><div class="dom svelte-1tlet67"><div><!></div></div> <div class="threlte svelte-1tlet67"><!></div></div>`);
var root_2 = $.from_html(`<option> </option>`);
var root_3 = $.from_html(`<!> <nav class="svelte-1tlet67"><select></select></nav>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.state('');
	let components = $.state($.proxy([]));

	const load = () => {
		const modules = import.meta.glob('./examples/*/*.svelte', { eager: true });

		$.set(
			components,
			Object.entries(modules).reduce(
				(acc, [key, module]) => {
					const name = key.split('/')[2];

					if (!name) throw new Error(`No name for ${key}`);

					const isDom = key.includes('Dom');
					const example = acc.find((e) => e.name === name);

					if (example) {
						if (isDom) {
							example.dom = module.default;
						} else {
							example.threlte = module.default;
						}
					} else {
						acc.push({
							name,
							dom: isDom ? module.default : undefined,
							threlte: isDom ? undefined : module.default
						});
					}

					return acc;
				},
				[]
			),
			true
		);

		$.set(selected, $.get(selected) || $.get(components)[0].name, true);
	};

	onMount(load);

	let example = $.derived(() => $.get(components).find((e) => e.name === $.get(selected)));

	$.user_effect(() => {
		if ($.get(selected).length) sessionStorage.selected = $.get(selected);
	});

	var fragment = root_3();

	$.event('keydown', $.window, (event) => {
		if (event.key === 'ArrowLeft') {
			const index = $.get(components).findIndex((e) => e.name === $.get(selected));

			$.set(selected, $.get(components)[index - 1]?.name || $.get(selected), true);
		} else if (event.key === 'ArrowRight') {
			const index = $.get(components).findIndex((e) => e.name === $.get(selected));

			$.set(selected, $.get(components)[index + 1]?.name || $.get(selected), true);
		}
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			$.component(node_1, () => $.get(example).dom, ($$anchor, example_dom) => {
				example_dom($$anchor, {});
			});

			$.reset(div_2);
			$.reset(div_1);

			var div_3 = $.sibling(div_1, 2);
			var node_2 = $.child(div_3);

			Canvas(node_2, {
				get toneMapping() {
					return NoToneMapping;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_3 = $.first_child(fragment_1);

					Common(node_3, {});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => $.get(example).threlte, ($$anchor, example_threlte) => {
						example_threlte($$anchor, {});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(example)) $$render(consequent);
		});
	}

	var nav = $.sibling(node, 2);
	var select = $.child(nav);

	$.each(select, 21, () => $.get(components), ({ name }) => name, ($$anchor, $$item) => {
		let name = () => $.get($$item).name;
		var option = root_2();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, name());

			if (option_value !== (option_value = name())) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(nav);
	$.bind_select_value(select, () => $.get(selected), ($$value) => $.set(selected, $$value));
	$.append($$anchor, fragment);
	$.pop();
}