import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal } from "bits-ui";

var root = $.from_html(`<div data-testid="portal-content"> </div>`);
var root_1 = $.from_html(`<div data-testid="custom-target"></div> <div id="string-target" data-testid="string-target"></div> <div class="class-target" data-testid="class-target"></div> <div data-testid="fragment-host"></div>`, 1);
var root_2 = $.from_html(`<div data-testid="main-container"><!> <!></div> <div data-testid="outside-portal">Outside portal</div>`, 1);

export default function Portal_test($$anchor, $$props) {
	let includeTargets = $.prop($$props, 'includeTargets', 3, true),
		content = $.prop($$props, 'content', 3, "Portal Content");

	let customElement = $.state(null);
	let documentFragment = null;

	if (typeof document !== "undefined") {
		documentFragment = document.createDocumentFragment();

		const container = document.createElement("div");

		container.setAttribute("data-testid", "fragment-container");
		documentFragment.appendChild(container);
	}

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Portal(node, {
		get to() {
			return $$props.to;
		},

		get disabled() {
			return $$props.disabled;
		},

		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.template_effect(() => {
				$.set_attribute(div_1, 'data-content', content());
				$.set_text(text, content());
			});

			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var div_2 = $.first_child(fragment_1);

			$.bind_this(div_2, ($$value) => $.set(customElement, $$value), () => $.get(customElement));
			$.next(6);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (includeTargets()) $$render(consequent);
		});
	}

	$.reset(div);
	$.next(2);
	$.append($$anchor, fragment);
}