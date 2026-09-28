import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><!></p>`);

export default function Text($$anchor, $$props) {
	$.push($$props, true);

	let klass = $.prop($$props, 'class', 3, ""),
		size = $.prop($$props, 'size', 3, undefined),
		variant = $.prop($$props, 'variant', 3, undefined),
		truncate = $.prop($$props, 'truncate', 3, false);

	const sizeObj = {
		10: "text-[10px] leading-[12px] tracking-normal font-normal",
		12: "text-[12px] leading-[16px] tracking-normal font-normal",
		14: "text-[14px] leading-5 tracking-normal font-normal",
		16: "text-[16px] leading-6 tracking-normal font-normal",
		20: "text-[20px] leading-6 tracking-[-0.33px] font-semibold",
		24: "text-[24px] leading-[32px] tracking-[-0.47px] font-semibold",
		32: "text-[32px] leading-[40px] tracking-[-0.79px] font-semibold",
		48: "text-[48px] leading-[56px] tracking-[-1.07px] font-bold"
	};

	const variantObj = {
		"copy-13": "text-[13px] leading-[16px] tracking-normal font-normal",
		"copy-14": "text-[14px] leading-5 tracking-normal font-normal",
		"copy-16": "text-[16px] leading-6 tracking-normal font-normal",
		"copy-18": "text-[18px] leading-[28px] tracking-normal font-normal",
		"copy-20": "text-[20px] leading-[36px] tracking-normal font-normal",
		"copy-24": "text-[24px] leading-[36px] tracking-normal font-normal",
		"label-12": "text-[12px] leading-[16px] tracking-normal font-normal",
		"label-13": "text-[13px] leading-[16px] tracking-normal font-normal",
		"label-14": "text-[14px] leading-5 tracking-normal font-normal",
		"label-16": "text-[16px] leading-5 tracking-normal font-normal",
		"label-18": "text-[18px] leading-5 tracking-normal font-normal",
		"label-20": "text-[20px] leading-[32px] tracking-normal font-normal",
		"button-12": "text-[12px] leading-[16px] tracking-normal font-medium",
		"button-14": "text-[14px] leading-5 tracking-normal font-medium",
		"button-16": "text-[16px] leading-5 tracking-normal font-medium",
		"heading-16": "text-[16px] leading-6 tracking-[-0.32px] font-semibold",
		"heading-20": "text-[20px] leading-[26px] tracking-[-0.4px] font-semibold",
		"heading-24": "text-[24px] leading-[32px] tracking-[-0.96px] font-semibold",
		"heading-32": "text-[32px] leading-[40px] tracking-[-1.28px] font-semibold",
		"heading-40": "text-[40px] leading-[48px] tracking-[-2.4px] font-semibold",
		"heading-48": "text-[48px] leading-[56px] tracking-[-2.88px] font-semibold",
		"heading-56": "text-[56px] leading-[56px] tracking-[-3.36px] font-semibold",
		"heading-64": "text-[64px] leading-[64px] tracking-[-3.84px] font-semibold",
		"heading-72": "text-[72px] leading-[72px] tracking-[-4.32px] font-semibold"
	};

	let view = $.state("mobile");

	let sizeClass = $.derived(() => {
		if (size()) {
			if (typeof size() === "number") {
				return sizeObj[size()];
			} else if (typeof size() === "object") {
				if ($.get(view) === "mobile") {
					return sizeObj[size().sm];
				} else if ($.get(view) === "tablet") {
					return sizeObj[size().md];
				} else if ($.get(view) === "desktop") {
					return sizeObj[size().lg];
				}
			}
		} else if (variant()) {
			if (typeof variant() === "string") {
				return variantObj[variant()];
			} else if (typeof variant() === "object") {
				if ($.get(view) === "mobile") {
					return variantObj[variant().sm];
				} else if ($.get(view) === "tablet") {
					return variantObj[variant().md];
				} else if ($.get(view) === "desktop") {
					return variantObj[variant().lg];
				}
			}
		}
	});

	let truncateClass = truncate() ? "truncate" : "";

	$.user_effect(() => {
		if (window.innerWidth < 767) {
			$.set(view, "mobile");
		} else if (window.innerWidth >= 767 && window.innerWidth <= 1024) {
			$.set(view, "tablet");
		} else {
			$.set(view, "desktop");
		}

		// update when the user is resizing the window
		window.addEventListener("resize", () => {
			if (window.innerWidth < 767) {
				$.set(view, "mobile");
			} else if (window.innerWidth >= 767 && window.innerWidth <= 1024) {
				$.set(view, "tablet");
			} else {
				$.set(view, "desktop");
			}
		});
	});

	var p = root();
	var node = $.child(p);

	$.snippet(node, () => $$props.children);
	$.reset(p);
	$.template_effect(() => $.set_class(p, 1, `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 ${$.get(sizeClass) ?? ''} ${truncateClass} ${klass() ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}