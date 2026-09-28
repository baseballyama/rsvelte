import * as $ from 'svelte/internal/server';

export default function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, size = 32, limit, css = "" } = $$props;
		const DEFAULT_BG = "#dfe2e6";
		const DEFAULT_FONT = "#2c2f3c";

		/** Overlap factor: each avatar after the first adds 75% of size (25% overlap). */
		const OVERLAP_FACTOR = 0.75;

		let containerEl = null;
		let containerWidth = null;

		const users = $.derived(() => {
			if (!value) return [];

			return Array.isArray(value) ? value : [value];
		});

		/** Max avatars that fit in container. Formula: width = size + (n-1) * size * 0.75. */
		const maxFitting = $.derived(() => {
			if (containerWidth == null || containerWidth <= 0) {
				return null;
			}

			const n = 1 + (containerWidth / size - 1) / OVERLAP_FACTOR;

			return Math.max(1, Math.floor(n));
		});

		const displayCount = $.derived(() => {
			const cap = limit != null ? Math.min(users().length, limit) : users().length;

			if (maxFitting() != null) {
				return Math.min(cap, maxFitting());
			}

			return cap;
		});

		const displayUsers = $.derived(() => users().slice(0, displayCount()));
		const overflowCount = $.derived(() => Math.max(0, users().length - displayCount()));

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

		const fontSize = $.derived(() => Math.round(size * 0.4));
		const avatarBaseStyle = $.derived(() => `width:${size}px;height:${size}px;min-width:${size}px;min-height:${size}px;font-size:${fontSize()}px;`);

		function getAvatarItemStyle(user, index) {
			const margin = index === 0 ? "0" : `${size * -0.25}px`;
			const bg = user.avatar ? "transparent" : user.color || DEFAULT_BG;

			const color = user.avatar
				? "transparent"
				: getContrastColor(user.color || DEFAULT_BG);

			return `margin-left:${margin};background-color:${bg};color:${color};`;
		}

		$$renderer.push(`<div${$.attr_class(`wx-avatar-root ${$.stringify(css)}`, 'svelte-kjji69')}>`);

		if (displayUsers().length > 0) {
			$$renderer.push(`<!--[0--><div class="wx-avatar-stack svelte-kjji69"><!--[-->`);

			const each_array = $.ensure_array_like(displayUsers());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let user = each_array[index];

				$$renderer.push(`<div${$.attr_class('wx-avatar wx-avatar-item svelte-kjji69', void 0, {
					'wx-avatar-overflow': index === displayUsers().length - 1 && overflowCount() > 0
				})}${$.attr_style(avatarBaseStyle() + getAvatarItemStyle(user, index))}>`);

				if (user.avatar) {
					$$renderer.push(`<!--[0--><img${$.attr('src', user.avatar)} alt="" loading="lazy" class="svelte-kjji69"/>`);
				} else if (getInitials(user.name)) {
					$$renderer.push(`<!--[1--><span class="svelte-kjji69">${$.escape(getInitials(user.name))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (index === displayUsers().length - 1 && overflowCount() > 0) {
					$$renderer.push(`<!--[0--><span class="wx-avatar-overflow-badge svelte-kjji69">+${$.escape(overflowCount())}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}