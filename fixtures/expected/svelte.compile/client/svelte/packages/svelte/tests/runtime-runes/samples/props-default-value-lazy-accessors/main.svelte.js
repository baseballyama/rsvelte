import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	let log = [];
	const fallback_value = 1;

	const nested = {
		get fallback_value() {
			log.push('nested.fallback_value');

			return fallback_value;
		}
	};

	const fallback_fn = () => {
		log.push('fallback_fn');

		return fallback_value;
	};

	const p0 = $.prop($$props, 'p0', 3, 1),
		p1 = $.prop($$props, 'p1', 3, fallback_value),
		p2 = $.prop($$props, 'p2', 19, () => nested.fallback_value),
		p3 = $.prop($$props, 'p3', 19, fallback_fn),
		p4 = $.prop($$props, 'p4', 3, 1),
		p5 = $.prop($$props, 'p5', 3, fallback_value),
		p6 = $.prop($$props, 'p6', 19, () => nested.fallback_value),
		p7 = $.prop($$props, 'p7', 19, fallback_fn);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);

	$.template_effect(() => {
		$.set_text(text, `props: ${p0() ?? ''} ${p1() ?? ''} ${p2() ?? ''} ${p3() ?? ''} ${p4() ?? ''} ${p5() ?? ''} ${p6() ?? ''} ${p7() ?? ''}`);
		$.set_text(text_1, `log: ${log ?? ''}`);
	});

	$.append($$anchor, fragment);
}