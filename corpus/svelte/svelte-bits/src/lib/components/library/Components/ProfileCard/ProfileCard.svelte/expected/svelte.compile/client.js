import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="pc-behind svelte-1qk9xnc"></div>`);
var root_1 = $.from_html(`<div class="pc-user-info svelte-1qk9xnc"><div class="pc-user-details svelte-1qk9xnc"><div class="pc-mini-avatar svelte-1qk9xnc"><img loading="lazy" class="svelte-1qk9xnc"/></div> <div class="pc-user-text svelte-1qk9xnc"><div class="pc-handle svelte-1qk9xnc"> </div> <div class="pc-status svelte-1qk9xnc"> </div></div></div> <button class="pc-contact-btn svelte-1qk9xnc" style="pointer-events:auto" type="button"> </button></div>`);
var root_2 = $.from_html(`<div><!> <div class="pc-card-shell svelte-1qk9xnc"><section class="pc-card svelte-1qk9xnc"><div class="pc-inside svelte-1qk9xnc"><div class="pc-shine svelte-1qk9xnc"></div> <div class="pc-glare svelte-1qk9xnc"></div> <div class="pc-content pc-avatar-content svelte-1qk9xnc"><img class="avatar svelte-1qk9xnc" loading="lazy"/> <!></div> <div class="pc-content svelte-1qk9xnc"><div class="pc-details svelte-1qk9xnc"><h3 class="svelte-1qk9xnc"> </h3> <p class="svelte-1qk9xnc"> </p></div></div></div></section></div></div>`);

export default function ProfileCard($$anchor, $$props) {
	$.push($$props, true);

	let avatarUrl = $.prop($$props, 'avatarUrl', 3, '<Placeholder for avatar URL>'),
		iconUrl = $.prop($$props, 'iconUrl', 3, '<Placeholder for icon URL>'),
		grainUrl = $.prop($$props, 'grainUrl', 3, '<Placeholder for grain URL>'),
		behindGlowEnabled = $.prop($$props, 'behindGlowEnabled', 3, true),
		className = $.prop($$props, 'class', 3, ''),
		enableTilt = $.prop($$props, 'enableTilt', 3, true),
		enableMobileTilt = $.prop($$props, 'enableMobileTilt', 3, false),
		mobileTiltSensitivity = $.prop($$props, 'mobileTiltSensitivity', 3, 5),
		name = $.prop($$props, 'name', 3, 'Javi A. Torres'),
		title = $.prop($$props, 'title', 3, 'Software Engineer'),
		handle = $.prop($$props, 'handle', 3, 'javicodes'),
		status = $.prop($$props, 'status', 3, 'Online'),
		contactText = $.prop($$props, 'contactText', 3, 'Contact'),
		showUserInfo = $.prop($$props, 'showUserInfo', 3, true);

	const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

	const ANIMATION_CONFIG = {
		INITIAL_DURATION: 1200,
		INITIAL_X_OFFSET: 70,
		INITIAL_Y_OFFSET: 60,
		DEVICE_BETA_OFFSET: 20,
		ENTER_TRANSITION_MS: 180
	};

	const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
	const round = (v, p = 3) => parseFloat(v.toFixed(p));
	const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + (tMax - tMin) * (v - fMin) / (fMax - fMin));
	let wrapEl;
	let shellEl;

	const cardStyle = $.derived(() => [
		`--icon: ${iconUrl() ? `url(${iconUrl()})` : 'none'}`,
		`--grain: ${grainUrl() ? `url(${grainUrl()})` : 'none'}`,
		`--inner-gradient: ${$$props.innerGradient ?? DEFAULT_INNER_GRADIENT}`,
		`--behind-glow-color: ${$$props.behindGlowColor ?? 'rgba(125, 190, 255, 0.67)'}`,
		`--behind-glow-size: ${$$props.behindGlowSize ?? '50%'}`
	].join('; '));

	onMount(() => {
		if (!enableTilt()) return;

		const shell = shellEl;
		const wrap = wrapEl;

		if (!shell || !wrap) return;

		let rafId = null;
		let running = false;
		let lastTs = 0;
		let currentX = 0;
		let currentY = 0;
		let targetX = 0;
		let targetY = 0;
		const DEFAULT_TAU = 0.14;
		const INITIAL_TAU = 0.6;
		let initialUntil = 0;
		let enterTimer = null;
		let leaveRaf = null;

		const setVarsFromXY = (x, y) => {
			const width = shell.clientWidth || 1;
			const height = shell.clientHeight || 1;
			const percentX = clamp(100 / width * x);
			const percentY = clamp(100 / height * y);
			const centerX = percentX - 50;
			const centerY = percentY - 50;

			const props = {
				'--pointer-x': `${percentX}%`,
				'--pointer-y': `${percentY}%`,
				'--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
				'--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
				'--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
				'--pointer-from-top': `${percentY / 100}`,
				'--pointer-from-left': `${percentX / 100}`,
				'--rotate-x': `${round(-(centerX / 5))}deg`,
				'--rotate-y': `${round(centerY / 4)}deg`
			};

			for (const [k, v] of Object.entries(props)) wrap.style.setProperty(k, v);
		};

		const step = (ts) => {
			if (!running) return;
			if (lastTs === 0) lastTs = ts;

			const dt = (ts - lastTs) / 1000;

			lastTs = ts;

			const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
			const k = 1 - Math.exp(-dt / tau);

			currentX += (targetX - currentX) * k;
			currentY += (targetY - currentY) * k;
			setVarsFromXY(currentX, currentY);

			const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

			if (stillFar || document.hasFocus()) {
				rafId = requestAnimationFrame(step);
			} else {
				running = false;
				lastTs = 0;

				if (rafId) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
			}
		};

		const start = () => {
			if (running) return;

			running = true;
			lastTs = 0;
			rafId = requestAnimationFrame(step);
		};

		const setImmediate = (x, y) => {
			currentX = x;
			currentY = y;
			setVarsFromXY(x, y);
		};

		const setTarget = (x, y) => {
			targetX = x;
			targetY = y;
			start();
		};

		const toCenter = () => setTarget(shell.clientWidth / 2, shell.clientHeight / 2);

		const getOffsets = (e) => {
			const rect = shell.getBoundingClientRect();

			return { x: e.clientX - rect.left, y: e.clientY - rect.top };
		};

		const onPointerEnter = (e) => {
			shell.classList.add('active');
			shell.classList.add('entering');

			if (enterTimer) window.clearTimeout(enterTimer);

			enterTimer = window.setTimeout(() => shell.classList.remove('entering'), ANIMATION_CONFIG.ENTER_TRANSITION_MS);

			const { x, y } = getOffsets(e);

			setTarget(x, y);
		};

		const onPointerMove = (e) => {
			const { x, y } = getOffsets(e);

			setTarget(x, y);
		};

		const onPointerLeave = () => {
			toCenter();

			const checkSettle = () => {
				const settled = Math.hypot(targetX - currentX, targetY - currentY) < 0.6;

				if (settled) {
					shell.classList.remove('active');
					leaveRaf = null;
				} else {
					leaveRaf = requestAnimationFrame(checkSettle);
				}
			};

			if (leaveRaf) cancelAnimationFrame(leaveRaf);

			leaveRaf = requestAnimationFrame(checkSettle);
		};

		const onDeviceOrientation = (event) => {
			const { beta, gamma } = event;

			if (beta == null || gamma == null) return;

			const cx = shell.clientWidth / 2;
			const cy = shell.clientHeight / 2;
			const x = clamp(cx + gamma * mobileTiltSensitivity(), 0, shell.clientWidth);
			const y = clamp(cy + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity(), 0, shell.clientHeight);

			setTarget(x, y);
		};

		const onClick = () => {
			if (!enableMobileTilt() || location.protocol !== 'https:') return;

			const anyMotion = window.DeviceMotionEvent;

			if (anyMotion && typeof anyMotion.requestPermission === 'function') {
				anyMotion.requestPermission().then((state) => {
					if (state === 'granted') window.addEventListener('deviceorientation', onDeviceOrientation);
				}).catch(console.error);
			} else {
				window.addEventListener('deviceorientation', onDeviceOrientation);
			}
		};

		shell.addEventListener('pointerenter', onPointerEnter);
		shell.addEventListener('pointermove', onPointerMove);
		shell.addEventListener('pointerleave', onPointerLeave);
		shell.addEventListener('click', onClick);

		const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
		const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

		setImmediate(initialX, initialY);
		toCenter();
		initialUntil = performance.now() + ANIMATION_CONFIG.INITIAL_DURATION;
		start();

		return () => {
			shell.removeEventListener('pointerenter', onPointerEnter);
			shell.removeEventListener('pointermove', onPointerMove);
			shell.removeEventListener('pointerleave', onPointerLeave);
			shell.removeEventListener('click', onClick);
			window.removeEventListener('deviceorientation', onDeviceOrientation);

			if (enterTimer) window.clearTimeout(enterTimer);
			if (leaveRaf) cancelAnimationFrame(leaveRaf);
			if (rafId) cancelAnimationFrame(rafId);

			running = false;
			shell.classList.remove('entering');
			shell.classList.remove('active');
		};
	});

	function handleAvatarError(e) {
		const t = e.target;

		t.style.display = 'none';
	}

	function handleMiniAvatarError(e) {
		const t = e.target;

		t.style.opacity = '0.5';
		t.src = avatarUrl();
	}

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (behindGlowEnabled()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var section = $.child(div_2);
	var div_3 = $.child(section);
	var div_4 = $.sibling($.child(div_3), 4);
	var img = $.child(div_4);
	var node_1 = $.sibling(img, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_1();
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var img_1 = $.only_child(div_7);
			var div_8 = $.sibling(div_7, 2);
			var div_9 = $.child(div_8);
			var text = $.only_child(div_9);
			var div_10 = $.sibling(div_9, 2);
			var text_1 = $.only_child(div_10, true);

			$.reset(div_8);
			$.reset(div_6);

			var button = $.sibling(div_6, 2);
			var text_2 = $.only_child(button, true);

			$.reset(div_5);

			$.template_effect(() => {
				$.set_attribute(img_1, 'src', $$props.miniAvatarUrl || avatarUrl());
				$.set_attribute(img_1, 'alt', `${name() || 'User'} mini avatar`);
				$.set_text(text, `@${handle() ?? ''}`);
				$.set_text(text_1, status());
				$.set_attribute(button, 'aria-label', `Contact ${name() || 'user'}`);
				$.set_text(text_2, contactText());
			});

			$.event('error', img_1, handleMiniAvatarError);
			$.replay_events(img_1);
			$.delegated('click', button, () => $$props.onContactClick?.());
			$.append($$anchor, div_5);
		};

		$.if(node_1, ($$render) => {
			if (showUserInfo()) $$render(consequent_1);
		});
	}

	$.reset(div_4);

	var div_11 = $.sibling(div_4, 2);
	var div_12 = $.child(div_11);
	var h3 = $.child(div_12);
	var text_3 = $.only_child(h3, true);
	var p_1 = $.sibling(h3, 2);
	var text_4 = $.only_child(p_1, true);

	$.reset(div_12);
	$.reset(div_11);
	$.reset(div_3);
	$.reset(section);
	$.reset(div_2);
	$.bind_this(div_2, ($$value) => shellEl = $$value, () => shellEl);
	$.reset(div);
	$.bind_this(div, ($$value) => wrapEl = $$value, () => wrapEl);

	$.template_effect(() => {
		$.set_class(div, 1, `pc-card-wrapper ${className() ?? ''}`, 'svelte-1qk9xnc');
		$.set_style(div, $.get(cardStyle));
		$.set_attribute(img, 'src', avatarUrl());
		$.set_attribute(img, 'alt', `${name() || 'User'} avatar`);
		$.set_text(text_3, name());
		$.set_text(text_4, title());
	});

	$.event('error', img, handleAvatarError);
	$.replay_events(img);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);