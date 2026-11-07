import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!><!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var text = $.text('asd');

					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if (bla) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1);

			{
				var consequent_1 = ($$anchor) => {
					var text_1 = $.text('asd');

					$.append($$anchor, text_1);
				};

				$.if(node_2, ($$render) => {
					if (bla) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			{
				var consequent_3 = ($$anchor) => {
					var text_2 = $.text('asd');

					$.append($$anchor, text_2);
				};

				var alternate = ($$anchor) => {
					var text_3 = $.text('bar');

					$.append($$anchor, text_3);
				};

				$.if(node_3, ($$render) => {
					if (bla) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_2);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			{
				var consequent_5 = ($$anchor) => {
					var text_4 = $.text('asd');

					$.append($$anchor, text_4);
				};

				var consequent_6 = ($$anchor) => {
					var text_5 = $.text('asd');

					$.append($$anchor, text_5);
				};

				$.if(node_4, ($$render) => {
					if (bla) $$render(consequent_5); else if (blubb) $$render(consequent_6, 1);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (name == "world") $$render(consequent_2); else if (foo) $$render(consequent_4, 1); else $$render(alternate_1, -1);
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		var consequent_13 = ($$anchor) => {
			var fragment_4 = root_1();
			var node_6 = $.first_child(fragment_4);

			{
				var consequent_7 = ($$anchor) => {
					var text_6 = $.text('asd');

					$.append($$anchor, text_6);
				};

				$.if(node_6, ($$render) => {
					if (bla) $$render(consequent_7);
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				var consequent_8 = ($$anchor) => {
					var text_7 = $.text('asd');

					$.append($$anchor, text_7);
				};

				var alternate_2 = ($$anchor) => {
					var text_8 = $.text('bar');

					$.append($$anchor, text_8);
				};

				$.if(node_7, ($$render) => {
					if (bla) $$render(consequent_8); else $$render(alternate_2, -1);
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_9 = ($$anchor) => {
					var text_9 = $.text('asd');

					$.append($$anchor, text_9);
				};

				var consequent_10 = ($$anchor) => {
					var text_10 = $.text('bar');

					$.append($$anchor, text_10);
				};

				$.if(node_8, ($$render) => {
					if (bla) $$render(consequent_9); else if (blubb) $$render(consequent_10, 1);
				});
			}

			var node_9 = $.sibling(node_8, 2);

			{
				var consequent_11 = ($$anchor) => {
					var text_11 = $.text('asd');

					$.append($$anchor, text_11);
				};

				var consequent_12 = ($$anchor) => {
					var text_12 = $.text('bar');

					$.append($$anchor, text_12);
				};

				var alternate_3 = ($$anchor) => {
					var text_13 = $.text('foo');

					$.append($$anchor, text_13);
				};

				$.if(node_9, ($$render) => {
					if (bla) $$render(consequent_11); else if (blubb) $$render(consequent_12, 1); else $$render(alternate_3, -1);
				});
			}

			$.append($$anchor, fragment_4);
		};

		var consequent_20 = ($$anchor) => {
			var fragment_5 = root_1();
			var node_10 = $.first_child(fragment_5);

			{
				var consequent_14 = ($$anchor) => {
					var text_14 = $.text('asd');

					$.append($$anchor, text_14);
				};

				$.if(node_10, ($$render) => {
					if (bla) $$render(consequent_14);
				});
			}

			var node_11 = $.sibling(node_10, 2);

			{
				var consequent_15 = ($$anchor) => {
					var text_15 = $.text('asd');

					$.append($$anchor, text_15);
				};

				var alternate_4 = ($$anchor) => {
					var text_16 = $.text('bar');

					$.append($$anchor, text_16);
				};

				$.if(node_11, ($$render) => {
					if (bla) $$render(consequent_15); else $$render(alternate_4, -1);
				});
			}

			var node_12 = $.sibling(node_11, 2);

			{
				var consequent_16 = ($$anchor) => {
					var text_17 = $.text('asd');

					$.append($$anchor, text_17);
				};

				var consequent_17 = ($$anchor) => {
					var text_18 = $.text('bar');

					$.append($$anchor, text_18);
				};

				$.if(node_12, ($$render) => {
					if (bla) $$render(consequent_16); else if (blubb) $$render(consequent_17, 1);
				});
			}

			var node_13 = $.sibling(node_12, 2);

			{
				var consequent_18 = ($$anchor) => {
					var text_19 = $.text('asd');

					$.append($$anchor, text_19);
				};

				var consequent_19 = ($$anchor) => {
					var text_20 = $.text('bar');

					$.append($$anchor, text_20);
				};

				var alternate_5 = ($$anchor) => {
					var text_21 = $.text('foo');

					$.append($$anchor, text_21);
				};

				$.if(node_13, ($$render) => {
					if (bla) $$render(consequent_18); else if (blubb) $$render(consequent_19, 1); else $$render(alternate_5, -1);
				});
			}

			$.append($$anchor, fragment_5);
		};

		var alternate_8 = ($$anchor) => {
			var fragment_6 = root_1();
			var node_14 = $.first_child(fragment_6);

			{
				var consequent_21 = ($$anchor) => {
					var text_22 = $.text('asd');

					$.append($$anchor, text_22);
				};

				$.if(node_14, ($$render) => {
					if (bla) $$render(consequent_21);
				});
			}

			var node_15 = $.sibling(node_14, 2);

			{
				var consequent_22 = ($$anchor) => {
					var text_23 = $.text('asd');

					$.append($$anchor, text_23);
				};

				var alternate_6 = ($$anchor) => {
					var text_24 = $.text('bar');

					$.append($$anchor, text_24);
				};

				$.if(node_15, ($$render) => {
					if (bla) $$render(consequent_22); else $$render(alternate_6, -1);
				});
			}

			var node_16 = $.sibling(node_15, 2);

			{
				var consequent_23 = ($$anchor) => {
					var text_25 = $.text('asd');

					$.append($$anchor, text_25);
				};

				var consequent_24 = ($$anchor) => {
					var text_26 = $.text('bar');

					$.append($$anchor, text_26);
				};

				$.if(node_16, ($$render) => {
					if (bla) $$render(consequent_23); else if (blubb) $$render(consequent_24, 1);
				});
			}

			var node_17 = $.sibling(node_16, 2);

			{
				var consequent_25 = ($$anchor) => {
					var text_27 = $.text('asd');

					$.append($$anchor, text_27);
				};

				var consequent_26 = ($$anchor) => {
					var text_28 = $.text('bar');

					$.append($$anchor, text_28);
				};

				var alternate_7 = ($$anchor) => {
					var text_29 = $.text('foo');

					$.append($$anchor, text_29);
				};

				$.if(node_17, ($$render) => {
					if (bla) $$render(consequent_25); else if (blubb) $$render(consequent_26, 1); else $$render(alternate_7, -1);
				});
			}

			$.append($$anchor, fragment_6);
		};

		$.if(node_5, ($$render) => {
			if (name == "world") $$render(consequent_13); else if (foo) $$render(consequent_20, 1); else $$render(alternate_8, -1);
		});
	}

	$.append($$anchor, fragment);
}