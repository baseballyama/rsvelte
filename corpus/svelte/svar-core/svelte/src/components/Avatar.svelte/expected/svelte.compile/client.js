import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img alt="" loading="lazy" class="svelte-kjji69"/>`);
var root_1 = $.from_html(`<span class="svelte-kjji69"> </span>`);
var root_2 = $.from_html(`<span class="wx-avatar-overflow-badge svelte-kjji69"> </span>`);
var root_3 = $.from_html(`<div><!> <!></div>`);
var root_4 = $.from_html(`<div class="wx-avatar-stack svelte-kjji69"></div>`);
var root_5 = $.from_html(`<div><!></div>`);

export default function Avatar($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, 32),
		css = $.prop($$props, 'css', 3, "");

	const DEFAULT_BG = "#dfe2e6";
	const DEFAULT_FONT = "#2c2f3c";

	/** Overlap factor: each avatar after the first adds 75% of size (25% overlap). */
	const OVERLAP_FACTOR = 0.75;

	let containerEl = $.state(null);
	let containerWidth = $.state(null);

	const users = $.derived(() => {
		if (!$$props.value) return [];

		return Array.isArray($$props.value) ? $$props.value : [$$props.value];
	});

	/** Max avatars that fit in container. Formula: width = size + (n-1) * size * 0.75. */
	const maxFitting = $.derived(() => {
		if ($.get(containerWidth) == null || $.get(containerWidth) <= 0) {
			return null;
		}

		const n = 1 + ($.get(containerWidth) / size() - 1) / OVERLAP_FACTOR;

		return Math.max(1, Math.floor(n));
	});

	const displayCount = $.derived(() => {
		const cap = $$props.limit != null
			? Math.min($.get(users).length, $$props.limit)
			: $.get(users).length;

		if ($.get(maxFitting) != null) {
			return Math.min(cap, $.get(maxFitting));
		}

		return cap;
	});

	const displayUsers = $.derived(() => $.get(users).slice(0, $.get(displayCount)));
	const overflowCount = $.derived(() => Math.max(0, $.get(users).length - $.get(displayCount)));

	$.user_effect(() => {
		const el = $.get(containerEl);

		if (!el) return;

		const ro = new ResizeObserver((entries) => {
			const entry = entries[0];

			if (entry) $.set(containerWidth, entry.contentRect.width, true);
		});

		ro.observe(el);

		return () => ro.disconnect();
	});

	function getInitials(name) {
		name = name?.trim() || "";

		if (!name) return "";

		const words = name.split(/\s+/);

		return (words[0][0] + (words[1]?.[0] || "")).toUpperCase().slice(0, 2);
	}

	function getContrastColor(hex) {
		if (!hex) return DEFAULT_FONT;

		let h = hex.replace("#", "");

		if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
		if (h.length !== 6) return DEFAULT_FONT;

		const r = parseInt(h.slice(0, 2), 16) / 255;
		const g = parseInt(h.slice(2, 4), 16) / 255;
		const b = parseInt(h.slice(4, 6), 16) / 255;
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

		return luminance > 0.5 ? DEFAULT_FONT : "#ffffff";
	}

	const fontSize = $.derived(() => Math.round(size() * 0.4));
	const avatarBaseStyle = $.derived(() => `width:${size()}px;height:${size()}px;min-width:${size()}px;min-height:${size()}px;font-size:${$.get(fontSize)}px;`);

	function getAvatarItemStyle(user, index) {
		const margin = index === 0 ? "0" : `${size() * -0.25}px`;
		const bg = user.avatar ? "transparent" : user.color || DEFAULT_BG;

		const color = user.avatar
			? "transparent"
			: getContrastColor(user.color || DEFAULT_BG);

		return `margin-left:${margin};background-color:${bg};color:${color};`;
	}

	var div = root_5();
	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_4();

			$.each(div_1, 23, () => $.get(displayUsers), (user) => user.id, ($$anchor, user, index) => {
				var div_2 = root_3();
				let classes;
				var node_1 = $.child(div_2);

				{
					var consequent = ($$anchor) => {
						var img = root();

						$.template_effect(() => $.set_attribute(img, 'src', $.get(user).avatar));
						$.append($$anchor, img);
					};

					var consequent_1 = ($$anchor) => {
						var span = root_1();
						var text = $.only_child(span, true);

						$.template_effect(($0) => $.set_text(text, $0), [() => getInitials($.get(user).name)]);
						$.append($$anchor, span);
					};

					var d = $.derived(() => getInitials($.get(user).name));

					$.if(node_1, ($$render) => {
						if ($.get(user).avatar) $$render(consequent); else if ($.get(d)) $$render(consequent_1, 1);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent_2 = ($$anchor) => {
						var span_1 = root_2();
						var text_1 = $.only_child(span_1);

						$.template_effect(() => $.set_text(text_1, `+${$.get(overflowCount) ?? ''}`));
						$.append($$anchor, span_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(index) === $.get(displayUsers).length - 1 && $.get(overflowCount) > 0) $$render(consequent_2);
					});
				}

				$.reset(div_2);

				$.template_effect(
					($0) => {
						classes = $.set_class(div_2, 1, 'wx-avatar wx-avatar-item svelte-kjji69', null, classes, {
							'wx-avatar-overflow': $.get(index) === $.get(displayUsers).length - 1 && $.get(overflowCount) > 0
						});

						$.set_style(div_2, $0);
					},
					[
						() => $.get(avatarBaseStyle) + getAvatarItemStyle($.get(user), $.get(index))
					]
				);

				$.append($$anchor, div_2);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(displayUsers).length > 0) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
	$.template_effect(() => $.set_class(div, 1, `wx-avatar-root ${css() ?? ''}`, 'svelte-kjji69'));
	$.append($$anchor, div);
	$.pop();
}