import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<strong class="tabs svelte-1yb6ciw"></strong>`);
var root_2 = $.from_html(`<!> <p><code><!></code></p>`, 1);

export default function CodeBlock($$anchor, $$props) {
	const tabs = ["Svelte 4", "Svelte 5"];
	let currentTab = $.state("Svelte 5");
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var strong = root_1();

			$.each(strong, 21, () => tabs, $.index, ($$anchor, tab) => {
				var button = root();
				let classes;
				var text = $.only_child(button, true);

				$.template_effect(() => {
					classes = $.set_class(button, 1, 'tab svelte-1yb6ciw', null, classes, { active: $.get(currentTab) === $.get(tab) });
					$.set_text(text, $.get(tab));
				});

				$.delegated('click', button, () => $.set(currentTab, $.get(tab), true));
				$.append($$anchor, button);
			});

			$.reset(strong);
			$.append($$anchor, strong);
		};

		$.if(node, ($$render) => {
			if ($$props.svelte4 && $$props.svelte5) $$render(consequent);
		});
	}

	var p = $.sibling(node, 2);
	var code = $.child(p);
	let classes_1;
	var node_1 = $.child(code);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.svelte4 ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.snippet(node_3, () => $$props.svelte5 ?? $.noop);
			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(currentTab) === "Svelte 4") $$render(consequent_1); else if ($.get(currentTab) === "Svelte 5") $$render(consequent_2, 1);
		});
	}

	$.reset(code);
	$.reset(p);
	$.template_effect(() => classes_1 = $.set_class(code, 1, 'well svelte-1yb6ciw', null, classes_1, { 'has-tabs': $$props.svelte4 && $$props.svelte5 }));
	$.append($$anchor, fragment);
}

$.delegate(['click']);