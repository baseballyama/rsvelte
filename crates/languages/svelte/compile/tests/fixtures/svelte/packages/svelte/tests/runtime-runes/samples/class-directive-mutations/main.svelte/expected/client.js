import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<main id="main"><div title="a title"></div> <span></span> <b></b> <i></i> <div></div> <span></span> <b></b> <i></i></main>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let classname = $.prop($$props, 'classname', 3, 'custom'),
		foo = $.prop($$props, 'foo', 3, true),
		bar = $.prop($$props, 'bar', 3, true);

	let mutations = [];
	let observer;

	if ($$props.browser) {
		observer = new MutationObserver(update_mutation_records);
		observer.observe(document.querySelector('#main'), { attributes: true, subtree: true });

		$.user_effect(() => {
			return () => observer.disconnect();
		});
	}

	function update_mutation_records(results) {
		for (const r of results) {
			mutations.push(r.target.nodeName);
		}
	}

	function get_and_clear_mutations() {
		update_mutation_records(observer.takeRecords());

		const result = mutations;

		mutations = [];

		return result;
	}

	var $$exports = { get_and_clear_mutations };
	var main = root();
	let classes;
	var div = $.child(main);
	let classes_1;
	var span = $.sibling(div, 2);
	let classes_2;
	var b = $.sibling(span, 2);
	let classes_3;
	var i = $.sibling(b, 2);
	let classes_4;
	var div_1 = $.sibling(i, 2);

	$.attribute_effect(
		div_1,
		() => ({
			...{ class: classname(), title: "a title" },
			[$.CLASS]: { foo: foo(), bar: bar() }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1ajf1u2'
	);

	var span_1 = $.sibling(div_1, 2);

	$.attribute_effect(span_1, () => ({ ...{}, [$.CLASS]: { foo: foo(), bar: bar() } }), void 0, void 0, void 0, 'svelte-1ajf1u2');

	var b_1 = $.sibling(span_1, 2);

	$.attribute_effect(b_1, () => ({
		...{ class: classname() },
		[$.CLASS]: { foo: foo(), bar: bar() }
	}));

	var i_1 = $.sibling(b_1, 2);

	$.attribute_effect(i_1, () => ({ ...{}, [$.CLASS]: { foo: foo(), bar: bar() } }));
	$.reset(main);

	$.template_effect(() => {
		classes = $.set_class(main, 1, '', null, classes, { browser: $$props.browser });
		classes_1 = $.set_class(div, 1, $.clsx(classname()), 'svelte-1ajf1u2', classes_1, { foo: foo(), bar: bar() });
		classes_2 = $.set_class(span, 1, 'svelte-1ajf1u2', null, classes_2, { foo: foo(), bar: bar() });
		classes_3 = $.set_class(b, 1, $.clsx(classname()), null, classes_3, { foo: foo(), bar: bar() });
		classes_4 = $.set_class(i, 1, '', null, classes_4, { foo: foo(), bar: bar() });
	});

	$.append($$anchor, main);

	return $.pop($$exports);
}