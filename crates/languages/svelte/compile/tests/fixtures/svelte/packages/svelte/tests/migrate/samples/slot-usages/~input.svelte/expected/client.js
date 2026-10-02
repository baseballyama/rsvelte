import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div slot="named">x</div>`);
var root_2 = $.from_html(`<div slot="named"><p>multi</p> <p>line</p></div>`);
var root_3 = $.from_html(`<div slot="foo"> </div>`);
var root_4 = $.from_html(`<div slot="bar"> </div>`);
var root_5 = $.from_html(`<div slot="foo">foo</div>`);
var root_6 = $.from_html(`<div slot="bar">bar</div>`);
var root_7 = $.from_html(`If you do mix slots like this you're a monster`, 1);
var root_8 = $.from_html(`<span slot="default">should be children</span>`);
var root_9 = $.from_html(`<span slot="default"> </span>`);
var root_10 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <c-e><div slot="named">unchanged</div></c-e>`, 3);

export default function Input($$anchor) {
	var fragment = root_10();
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

	$.component(node_1, () => Component, ($$anchor, $$component) => {
		$$component($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('unchanged');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	Component(node_2, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				var div = root();
				var text_2 = $.only_child(div, true);

				$.template_effect(() => $.set_text(text_2, $.get(foo)));
				$.append($$anchor, div);
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Component(node_3, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const bar = $.derived(() => $$slotProps.foo);
				var div_1 = root();
				var text_3 = $.only_child(div_1, true);

				$.template_effect(() => $.set_text(text_3, $.get(bar)));
				$.append($$anchor, div_1);
			}
		}
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => Component, ($$anchor, $$component) => {
		$$component($$anchor, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const foo = $.derived(() => $$slotProps.foo);
					var div_2 = root();
					var text_4 = $.only_child(div_2, true);

					$.template_effect(() => $.set_text(text_4, $.get(foo)));
					$.append($$anchor, div_2);
				}
			}
		});
	});

	var node_5 = $.sibling(node_4, 2);

	Component(node_5, {
		$$slots: {
			named: ($$anchor, $$slotProps) => {
				var div_3 = root_1();

				$.append($$anchor, div_3);
			}
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Component(node_6, {
		$$slots: {
			named: ($$anchor, $$slotProps) => {
				var div_4 = root_2();

				$.append($$anchor, div_4);
			}
		}
	});

	var node_7 = $.sibling(node_6, 2);

	Component(node_7, {
		$$slots: {
			named: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_8 = $.first_child(fragment_1);

				$.element(node_8, () => 'div', false, ($$element, $$anchor) => {
					$.attribute_effect($$element, () => ({ slot: 'named' }));

					var text_5 = $.text('x');

					$.append($$anchor, text_5);
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_9 = $.sibling(node_7, 2);

	Component(node_9, {
		$$slots: {
			foo: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				var div_5 = root_3();
				var text_6 = $.only_child(div_5, true);

				$.template_effect(() => $.set_text(text_6, $.get(foo)));
				$.append($$anchor, div_5);
			},

			bar: ($$anchor, $$slotProps) => {
				const bar = $.derived(() => $$slotProps.foo);
				var div_6 = root_4();
				var text_7 = $.only_child(div_6, true);

				$.template_effect(() => $.set_text(text_7, $.get(bar)));
				$.append($$anchor, div_6);
			}
		}
	});

	var node_10 = $.sibling(node_9, 2);

	Component(node_10, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);

				$.next();

				var text_8 = $.text();

				$.template_effect(() => $.set_text(text_8, $.get(foo)));
				$.append($$anchor, text_8);
			},

			named: ($$anchor, $$slotProps) => {
				var div_7 = root_1();

				$.append($$anchor, div_7);
			}
		}
	});

	var node_11 = $.sibling(node_10, 2);

	Component(node_11, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				var text_9 = $.text();

				$.template_effect(() => $.set_text(text_9, $.get(foo)));
				$.append($$anchor, text_9);
			}
		}
	});

	var node_12 = $.sibling(node_11, 2);

	Component(node_12, {
		$$slots: {
			named: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				var text_10 = $.text();

				$.template_effect(() => $.set_text(text_10, $.get(foo)));
				$.append($$anchor, text_10);
			}
		}
	});

	var node_13 = $.sibling(node_12, 2);

	Component(node_13, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('OMG WHY');

			$.append($$anchor, text_11);
		},

		$$slots: {
			default: true,
			foo: ($$anchor, $$slotProps) => {
				var div_8 = root_5();

				$.append($$anchor, div_8);
			},

			bar: ($$anchor, $$slotProps) => {
				var div_9 = root_6();

				$.append($$anchor, div_9);
			}
		}
	});

	var node_14 = $.sibling(node_13, 2);

	Component(node_14, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_5 = root_7();

			$.append($$anchor, fragment_5);
		},

		$$slots: {
			default: true,
			foo: ($$anchor, $$slotProps) => {
				var div_10 = root_5();

				$.append($$anchor, div_10);
			},

			bar: ($$anchor, $$slotProps) => {
				var div_11 = root_6();

				$.append($$anchor, div_11);
			}
		}
	});

	var node_15 = $.sibling(node_14, 2);

	Component(node_15, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const omg = $.derived(() => $$slotProps.omg);

				$.next();

				var text_12 = $.text();

				$.template_effect(() => $.set_text(text_12, `${$.get(omg) ?? ''} WHY`));
				$.append($$anchor, text_12);
			},

			foo: ($$anchor, $$slotProps) => {
				var div_12 = root_5();

				$.append($$anchor, div_12);
			},

			bar: ($$anchor, $$slotProps) => {
				var div_13 = root_6();

				$.append($$anchor, div_13);
			}
		}
	});

	var node_16 = $.sibling(node_15, 2);

	Component(node_16, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const monster = $.derived(() => $$slotProps.monster);

				$.next();

				var text_13 = $.text();

				$.template_effect(() => $.set_text(text_13, `If you do mix slots like this you're a ${$.get(monster) ?? ''}`));
				$.append($$anchor, text_13);
			},

			foo: ($$anchor, $$slotProps) => {
				var div_14 = root_5();

				$.append($$anchor, div_14);
			},

			bar: ($$anchor, $$slotProps) => {
				var div_15 = root_6();

				$.append($$anchor, div_15);
			}
		}
	});

	var node_17 = $.sibling(node_16, 2);

	Component(node_17, {
		children: ($$anchor, $$slotProps) => {
			var span = root_8();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Component(node_18, {
		children: ($$anchor, $$slotProps) => {
			const with_prop = $.derived(() => $$slotProps.with_prop);
			var span_1 = root_9();
			var text_14 = $.only_child(span_1);

			$.template_effect(() => $.set_text(text_14, `should be children ${$.get(with_prop) ?? ''} too`));
			$.append($$anchor, span_1);
		},
		$$slots: { default: true }
	});

	var c_e = $.sibling(node_18, 2);

	$.append($$anchor, fragment);
}