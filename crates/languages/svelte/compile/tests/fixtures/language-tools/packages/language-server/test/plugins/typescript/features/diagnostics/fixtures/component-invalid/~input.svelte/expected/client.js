import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Imported from './imported.svelte';
import { Works, Works2, Works3, Works4, DoesntWork } from './components';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Works(node, {});

	var node_1 = $.sibling(node, 2);

	Imported(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Works2(node_2, {
		hi: 'hi',
		$$events: { click: (e) => console.log(e.movementX) },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);

				$.next();

				var text = $.text();

				$.template_effect(($0) => $.set_text(text, $0), [() => $.get(foo).toLocaleLowerCase()]);
				$.append($$anchor, text);
			}
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Works3(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => Works, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => Works2, ($$anchor, $$component) => {
		$$component($$anchor, {
			hi: 'hi',
			$$events: { click: (e) => console.log(e.movementX) },
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const foo = $.derived(() => $$slotProps.foo);

					$.next();

					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(foo).toLocaleLowerCase()]);
					$.append($$anchor, text_1);
				}
			}
		});
	});

	var node_6 = $.sibling(node_5, 2);

	$.component(node_6, () => Works3, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	var node_7 = $.sibling(node_6, 2);

	DoesntWork(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	Imported(node_8, { propDoesntExist: true });

	var node_9 = $.sibling(node_8, 2);

	$.component(node_9, () => DoesntWork, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	var node_10 = $.sibling(node_9, 2);

	DoesntWork(node_10, {
		foo: 'bar',
		$$events: { click: () => '' },
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const etc = $.derived(() => $$slotProps.etc);

				$.next();

				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, $.get(etc)));
				$.append($$anchor, text_2);
			}
		}
	});

	var node_11 = $.sibling(node_10, 2);

	$.component(node_11, () => DoesntWork, ($$anchor, $$component) => {
		$$component($$anchor, {
			foo: 'bar',
			$$events: { click: () => '' },
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const etc = $.derived(() => $$slotProps.etc);

					$.next();

					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, $.get(etc)));
					$.append($$anchor, text_3);
				}
			}
		});
	});

	var node_12 = $.sibling(node_11, 2);

	Works4(node_12, { foo: 'bar' });

	var node_13 = $.sibling(node_12, 2);

	$.component(node_13, () => Works4, ($$anchor, $$component) => {
		$$component($$anchor, { foo: 'bar' });
	});

	$.append($$anchor, fragment);
}