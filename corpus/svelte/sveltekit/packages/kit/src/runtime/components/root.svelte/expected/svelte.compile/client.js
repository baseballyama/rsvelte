import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';

var root = $.from_html(`<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	const node = ($$anchor, n = $.noop, depth = $.noop) => {
		const failed = ($$anchor, error = $.noop) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => $.get(Error), ($$anchor, Error_1) => {
				Error_1($$anchor, {
					get error() {
						return error();
					}
				});
			});

			$.append($$anchor, fragment);
		};

		const Component = $.derived(() => n().component);
		const Error = $.derived(() => n().error);
		const data = $.derived(() => n().data);
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		$.boundary(
			node_2,
			{
				get failed() {
					return $.get(Error) ? failed : undefined;
				},

				get onerror() {
					return $.get(Error) ? $$props.onerror : undefined;
				}
			},
			($$anchor) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						$.component(node_4, () => $.get(Component), ($$anchor, Component_1) => {
							$.bind_this(
								Component_1($$anchor, {
									get data() {
										return $.get(data);
									},

									get form() {
										return $$props.form;
									},

									get params() {
										return $$props.page.params;
									},

									children: ($$anchor, $$slotProps) => {
										node($$anchor, () => n().child, () => depth() + 1);
									},
									$$slots: { default: true }
								}),
								($$value) => components()[depth()] = $$value,
								() => components()?.[depth()]
							);
						});

						$.append($$anchor, fragment_3);
					};

					var alternate = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_5 = $.first_child(fragment_5);

						$.component(node_5, () => $.get(Component), ($$anchor, Component_2) => {
							$.bind_this(
								Component_2($$anchor, {
									get data() {
										return $.get(data);
									},

									get form() {
										return $$props.form;
									},

									get params() {
										return $$props.page.params;
									},

									get error() {
										return $$props.error;
									}
								}),
								($$value) => components()[depth()] = $$value,
								() => components()?.[depth()]
							);
						});

						$.append($$anchor, fragment_5);
					};

					$.if(node_3, ($$render) => {
						if (n().child) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			}
		);

		$.append($$anchor, fragment_1);
	};

	const components = $.prop($$props, 'components', 7);
	let mounted = $.state(false);
	let navigated = $.state(false);
	let title = $.state('');

	afterNavigate(() => {
		if ($.get(mounted)) {
			$.set(navigated, true);
			$.set(title, document.title || 'untitled page', true);
		} else {
			$.set(mounted, true);
		}
	});

	var fragment_6 = root_1();
	var node_6 = $.first_child(fragment_6);

	node(node_6, () => $$props.tree, () => 0);

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div = root();
			var node_8 = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(title)));
					$.append($$anchor, text);
				};

				$.if(node_8, ($$render) => {
					if ($.get(navigated)) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_7, ($$render) => {
			if ($.get(mounted)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment_6);
	$.pop();
}