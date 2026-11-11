import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.with_script($.from_html(`<script async="" src="https://x/y.js"></script> <script>window.a = 1;</script>`, 1));
var root_1 = $.with_script($.from_html(`<script>a\`\${1}\\n</script><!>`, 1));
var root_2 = $.with_script($.from_html(`<div><script type="text/javascript">console.log("{v}");</script> <p>after</p></div> <span><script src="/z.js"></script><!></span> <div><style>p { color: red }</style><template><b>t</b></template></div> <!> <span><script></script><!></span> <p><script></script><!></p>`, 1));
export default function Template_script($$anchor) {
	let v = 1;
	var fragment_1 = root_2();
	$.head("ae43zg", ($$anchor) => {
		var fragment = root();
		var script = $.first_child(fragment);
		$.set_attribute(script, "data-v", v);
		$.next(2);
		$.append($$anchor, fragment);
	});
	var node_1 = $.sibling($.first_child(fragment_1), 6);
	{
		var consequent = ($$anchor) => {
			var fragment_2 = root_1();
			var node_2 = $.sibling($.first_child(fragment_2));
			$.append($$anchor, fragment_2);
		};
		$.if(node_1, ($$render) => {
			if (v) $$render(consequent);
		});
	}
	var span = $.sibling(node_1, 2);
	var script_1 = $.child(span);
	$.set_attribute(script_1, "src", v);
	var node_3 = $.sibling(script_1);
	$.reset(span);
	$.next(2);
	$.append($$anchor, fragment_1);
}
