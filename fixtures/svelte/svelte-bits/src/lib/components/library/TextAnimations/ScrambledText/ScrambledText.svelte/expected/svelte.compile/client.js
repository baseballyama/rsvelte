import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";

var root = $.from_html(`<div><p><!></p></div>`);

export default function ScrambledText($$anchor, $$props) {
	$.push($$props, true);
	gsap.registerPlugin(SplitText, ScrambleTextPlugin);

	let radius = $.prop($$props, 'radius', 3, 100),
		duration = $.prop($$props, 'duration', 3, 1.2),
		speed = $.prop($$props, 'speed', 3, 0.5),
		scrambleChars = $.prop($$props, 'scrambleChars', 3, ".:"),
		className = $.prop($$props, 'className', 3, ""),
		style = $.prop($$props, 'style', 3, "");

	let rootEl = $.state(void 0);

	$.user_effect(() => {
		void radius();
		void duration();
		void speed();
		void scrambleChars();

		if (!$.get(rootEl)) return;

		const pEl = $.get(rootEl).querySelector("p");

		if (!pEl) return;

		const split = SplitText.create(pEl, {
			type: "chars",
			charsClass: "inline-block will-change-transform"
		});

		split.chars.forEach((el) => {
			const c = el;

			gsap.set(c, { attr: { "data-content": c.innerHTML } });
		});

		const handleMove = (e) => {
			split.chars.forEach((el) => {
				const c = el;
				const { left, top, width, height } = c.getBoundingClientRect();
				const dx = e.clientX - (left + width / 2);
				const dy = e.clientY - (top + height / 2);
				const dist = Math.hypot(dx, dy);

				if (dist < radius()) {
					gsap.to(c, {
						overwrite: true,
						duration: duration() * (1 - dist / radius()),
						scrambleText: {
							text: c.dataset.content || "",
							chars: scrambleChars(),
							speed: speed()
						},
						ease: "none"
					});
				}
			});
		};

		$.get(rootEl).addEventListener("pointermove", handleMove);

		return () => {
			$.get(rootEl)?.removeEventListener("pointermove", handleMove);
			split.revert();
		};
	});

	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	$.snippet(node, () => $$props.children);
	$.reset(p);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(rootEl, $$value), () => $.get(rootEl));

	$.template_effect(() => {
		$.set_class(div, 1, `m-[7vw] max-w-200 font-mono text-[clamp(14px,4vw,32px)] text-white ${className() ?? ''}`);
		$.set_style(div, style());
	});

	$.append($$anchor, div);
	$.pop();
}