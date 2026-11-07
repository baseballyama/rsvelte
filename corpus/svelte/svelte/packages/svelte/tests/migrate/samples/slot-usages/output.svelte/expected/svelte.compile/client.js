import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div>x</div>`);
var root_2 = $.from_html(`<div><p>multi</p> <p>line</p></div>`);
var root_3 = $.from_html(`<div>foo</div>`);
var root_4 = $.from_html(`<div>bar</div>`);
var root_5 = $.from_html(`If you do mix slots like this you're a monster`, 1);
var root_6 = $.from_html(`<span>should be children</span>`);
var root_7 = $.from_html(`<span></span>`);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <c-e><div slot="named">unchanged</div></c-e>`, 3);

export default function Output($$anchor) {
	var fragment = root_8();
	var node = $.first_child(fragment);

	Component(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('unchanged');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('unchanged');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let foo = () => ($$arg0?.()).foo;
			var div = root();
			var text_2 = $.only_child(div, true);

			$.template_effect(() => $.set_text(text_2, foo()));
			$.append($$anchor, div);
		};

		Component(node_2, { children, $$slots: { default: true } });
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let bar = () => ($$arg0?.()).foo;
			var div_1 = root();
			var text_3 = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text_3, bar()));
			$.append($$anchor, div_1);
		};

		Component(node_3, { children, $$slots: { default: true } });
	}

	var node_4 = $.sibling(node_3, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let foo = () => ($$arg0?.()).foo;
			var div_2 = root();
			var text_4 = $.only_child(div_2, true);

			$.template_effect(() => $.set_text(text_4, foo()));
			$.append($$anchor, div_2);
		};

		Component(node_4, { children, $$slots: { default: true } });
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const named = ($$anchor) => {
			var div_3 = root_1();

			$.append($$anchor, div_3);
		};

		Component(node_5, { named, $$slots: { named: true } });
	}

	var node_6 = $.sibling(node_5, 2);

	{
		const named = ($$anchor) => {
			var div_4 = root_2();

			$.append($$anchor, div_4);
		};

		Component(node_6, { named, $$slots: { named: true } });
	}

	var node_7 = $.sibling(node_6, 2);

	{
		const named = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_8 = $.first_child(fragment_1);

			$.element(node_8, () => 'div', false, ($$element, $$anchor) => {
				var text_5 = $.text('x');

				$.append($$anchor, text_5);
			});

			$.append($$anchor, fragment_1);
		};

		Component(node_7, { named, $$slots: { named: true } });
	}

	var node_9 = $.sibling(node_7, 2);

	{
		const foo = ($$anchor, $$arg0) => {
			let foo = () => ($$arg0?.()).foo;
			var div_5 = root();
			var text_6 = $.only_child(div_5, true);

			$.template_effect(() => $.set_text(text_6, foo()));
			$.append($$anchor, div_5);
		};

		const bar = ($$anchor, $$arg0) => {
			let bar = () => ($$arg0?.()).foo;
			var div_6 = root();
			var text_7 = $.only_child(div_6, true);

			$.template_effect(() => $.set_text(text_7, bar()));
			$.append($$anchor, div_6);
		};

		Component(node_9, { foo, bar, $$slots: { foo: true, bar: true } });
	}

	var node_10 = $.sibling(node_9, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let foo = () => ($$arg0?.()).foo;

			$.next();

			var text_8 = $.text();

			$.template_effect(() => $.set_text(text_8, foo()));
			$.append($$anchor, text_8);
		};

		const named = ($$anchor) => {
			var div_7 = root_1();

			$.append($$anchor, div_7);
		};

		Component(node_10, { children, named, $$slots: { default: true, named: true } });
	}

	var node_11 = $.sibling(node_10, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let foo = () => ($$arg0?.()).foo;

			$.next();

			var text_9 = $.text();

			$.template_effect(() => $.set_text(text_9, foo()));
			$.append($$anchor, text_9);
		};

		Component(node_11, { children, $$slots: { default: true } });
	}

	var node_12 = $.sibling(node_11, 2);

	{
		const named = ($$anchor, $$arg0) => {
			let foo = () => ($$arg0?.()).foo;

			$.next();

			var text_10 = $.text();

			$.template_effect(() => $.set_text(text_10, foo()));
			$.append($$anchor, text_10);
		};

		Component(node_12, { named, $$slots: { named: true } });
	}

	var node_13 = $.sibling(node_12, 2);

	{
		const foo = ($$anchor) => {
			var div_8 = root_3();

			$.append($$anchor, div_8);
		};

		const bar = ($$anchor) => {
			var div_9 = root_4();

			$.append($$anchor, div_9);
		};

		Component(node_13, {
			foo,
			bar,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_11 = $.text('OMG WHY');

				$.append($$anchor, text_11);
			},
			$$slots: { foo: true, bar: true, default: true }
		});
	}

	var node_14 = $.sibling(node_13, 2);

	{
		const foo = ($$anchor) => {
			var div_10 = root_3();

			$.append($$anchor, div_10);
		};

		const bar = ($$anchor) => {
			var div_11 = root_4();

			$.append($$anchor, div_11);
		};

		Component(node_14, {
			foo,
			bar,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_5 = root_5();

				$.append($$anchor, fragment_5);
			},
			$$slots: { foo: true, bar: true, default: true }
		});
	}

	var node_15 = $.sibling(node_14, 2);

	{
		const foo = ($$anchor) => {
			var div_12 = root_3();

			$.append($$anchor, div_12);
		};

		const children = ($$anchor, $$arg0) => {
			let omg = () => ($$arg0?.()).omg;

			$.next();

			var text_12 = $.text();

			$.template_effect(() => $.set_text(text_12, `${omg() ?? ''} WHY`));
			$.append($$anchor, text_12);
		};

		const bar = ($$anchor) => {
			var div_13 = root_4();

			$.append($$anchor, div_13);
		};

		Component(node_15, {
			foo,
			children,
			bar,
			$$slots: { foo: true, default: true, bar: true }
		});
	}

	var node_16 = $.sibling(node_15, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let monster = () => ($$arg0?.()).monster;

			$.next();

			var text_13 = $.text();

			$.template_effect(() => $.set_text(text_13, `If you do mix slots like this
         
    you're a ${monster() ?? ''}`));

			$.append($$anchor, text_13);
		};

		const foo = ($$anchor) => {
			var div_14 = root_3();

			$.append($$anchor, div_14);
		};

		const bar = ($$anchor) => {
			var div_15 = root_4();

			$.append($$anchor, div_15);
		};

		Component(node_16, {
			children,
			foo,
			bar,
			$$slots: { default: true, foo: true, bar: true }
		});
	}

	var node_17 = $.sibling(node_16, 2);

	Component(node_17, {
		children: ($$anchor, $$slotProps) => {
			var span = root_6();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Component(node_18, {
		children: ($$anchor, $$slotProps) => {
			var span_1 = root_7();

			{
				const children = ($$anchor, $$arg0) => {
					let with_prop = () => ($$arg0?.()).with_prop;

					$.next();

					var text_14 = $.text();

					$.template_effect(() => $.set_text(text_14, `should be children ${with_prop() ?? ''} too`));
					$.append($$anchor, text_14);
				};
			}

			$.append($$anchor, span_1);
		},
		$$slots: { default: true }
	});

	var c_e = $.sibling(node_18, 2);

	$.append($$anchor, fragment);
}