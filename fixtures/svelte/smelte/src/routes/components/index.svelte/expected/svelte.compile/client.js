import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "components/Button";
import Code from "docs/Code.svelte";

var root = $.from_html(
	`<h4 class="pb-8">Smelte components</h4> <p>Smelte components are built almost exclusively using Tailwind's utility classes
  keeping CSS bundle size as minimal as possible. UI frameworks are notorious for
  being hard to customize and we're still looking for appropriate solution given
  utility-first nature of Tailwind. So for the most part components expose all of
  their elements' classes as strings like, for instance, Button component has
  "disabledClasses" prop defaulting to<br/> <span class="code-inline">bg-gray-300 text-gray-500 dark:bg-dark-400 pointer-events-none hover:bg-gray-300 cursor-default</span></p> <!> <div class="pt-8 pb-16"><!></div> <p>Say you need to adjust that background color, you may the "disabledClasses" prop<br/> <span class="code-inline">bg-gray-100 text-gray-700 dark:bg-dark-100 pointer-events-none hover:bg-gray-300 cursor-default</span></p> <!> <div class="pt-8 pb-16"><!></div> <p>This feels bulky to say the least but may still be the case if you need to modify those classes heavily.
  Same prop also allows you to pass a function which accepts the same string as argument and returns your modified classes string:</p> <!> <div class="pt-8 pb-16"><!></div> <p>Using this approach Smelte is also able to imply which classes are actually being used
  even dynamically which helps Purge CSS to get rid of unused classes at build time automatically.
  Still it feels like this is a rather naive way of customizing components so please create an <a href="https://github.com/matyunya/smelte/issues/new">issue</a> on Github or <a href="mailto:matyunya@gmail.com">contact me directly</a> if you have an idea how to improve on this.</p>`,
	1
);

export default function Components($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Code(node, { code: '<Button disabled>Disabled button</Button>' });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Disabled button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_2 = $.sibling(div, 4);

	Code(node_2, {
		code: `<Button
  disabledClasses="bg-gray-100 text-gray-500 dark:bg-dark-100 pointer-events-none hover:bg-gray-300 cursor-default"
  disabled>Disabled button
</Button>`
	});

	var div_1 = $.sibling(node_2, 2);
	var node_3 = $.child(div_1);

	Button(node_3, {
		disabledClasses: 'bg-gray-100 text-gray-500 dark:bg-dark-100 pointer-events-none hover:bg-gray-300 cursor-default',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Disabled button');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_4 = $.sibling(div_1, 4);

	Code(node_4, {
		code: `<Button
  disabledClasses={i => i.replace(/(3|4)00/g, "100")}
  disabled>Disabled button
</Button>`
	});

	var div_2 = $.sibling(node_4, 2);
	var node_5 = $.child(div_2);

	Button(node_5, {
		disabledClasses: (i) => i.replace(/(3|4)00/g, "100"),
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Disabled button');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.next(2);
	$.append($$anchor, fragment);
}