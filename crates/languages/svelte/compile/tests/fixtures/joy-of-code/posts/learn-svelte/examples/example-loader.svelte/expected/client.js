import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.with_script($.from_html(`<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script> <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js"></script>`, 1));
var root_1 = $.from_html(`<div class="container"><button>Show example</button></div>`);
var root_2 = $.from_html(`<div class="content svelte-14xmduv"><!></div>`);
var root_3 = $.from_html(`<div class="example svelte-14xmduv"><!></div>`);

export default function Example_loader($$anchor, $$props) {
	$.push($$props, true);

	let status = $.state('load');
	let Component = $.state(null);

	// @ts-ignore
	const modules = import.meta.glob('./*.svelte');

	async function load() {
		const module = modules[`./${$$props.name}.svelte`];

		if (module) {
			$.set(Component, (await module()).default, true);
			$.set(status, 'loaded');
		} else {
			console.error(`${$$props.name}.svelte not found`);
		}
	}

	var div = root_3();

	$.head('14xmduv', ($$anchor) => {
		var fragment = root();

		$.next(2);
		$.append($$anchor, fragment);
	});

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var button = $.only_child(div_1);

			$.delegated('click', button, load);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_2();
			var node_1 = $.child(div_2);

			$.component(node_1, () => $.get(Component), ($$anchor, Component_1) => {
				Component_1($$anchor, {});
			});

			$.reset(div_2);
			$.transition(3, div_2, () => fade);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(status) === 'load') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);