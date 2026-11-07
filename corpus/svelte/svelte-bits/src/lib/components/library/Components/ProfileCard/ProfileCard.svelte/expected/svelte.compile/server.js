import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function ProfileCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			avatarUrl = '<Placeholder for avatar URL>',
			iconUrl = '<Placeholder for icon URL>',
			grainUrl = '<Placeholder for grain URL>',
			innerGradient,
			behindGlowEnabled = true,
			behindGlowColor,
			behindGlowSize,
			class: className = '',
			enableTilt = true,
			enableMobileTilt = false,
			mobileTiltSensitivity = 5,
			miniAvatarUrl,
			name = 'Javi A. Torres',
			title = 'Software Engineer',
			handle = 'javicodes',
			status = 'Online',
			contactText = 'Contact',
			showUserInfo = true,
			onContactClick
		} = $$props;

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
			`--icon: ${iconUrl ? `url(${iconUrl})` : 'none'}`,
			`--grain: ${grainUrl ? `url(${grainUrl})` : 'none'}`,
			`--inner-gradient: ${innerGradient ?? DEFAULT_INNER_GRADIENT}`,
			`--behind-glow-color: ${behindGlowColor ?? 'rgba(125, 190, 255, 0.67)'}`,
			`--behind-glow-size: ${behindGlowSize ?? '50%'}`
		].join('; '));

		onMount(() => {
			if (!enableTilt) return;

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
				const x = clamp(cx + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
				const y = clamp(cy + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity, 0, shell.clientHeight);

				setTarget(x, y);
			};

			const onClick = () => {
				if (!enableMobileTilt || location.protocol !== 'https:') return;

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
			t.src = avatarUrl;
		}

		$$renderer.push(`<div${$.attr_class(`pc-card-wrapper ${$.stringify(className)}`, 'svelte-1qk9xnc')}${$.attr_style(cardStyle())}>`);

		if (behindGlowEnabled) {
			$$renderer.push(`<!--[0--><div class="pc-behind svelte-1qk9xnc"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="pc-card-shell svelte-1qk9xnc"><section class="pc-card svelte-1qk9xnc"><div class="pc-inside svelte-1qk9xnc"><div class="pc-shine svelte-1qk9xnc"></div> <div class="pc-glare svelte-1qk9xnc"></div> <div class="pc-content pc-avatar-content svelte-1qk9xnc"><img class="avatar svelte-1qk9xnc"${$.attr('src', avatarUrl)}${$.attr('alt', `${name || 'User'} avatar`)} loading="lazy" onerror="this.__e=event"/> `);

		if (showUserInfo) {
			$$renderer.push(`<!--[0--><div class="pc-user-info svelte-1qk9xnc"><div class="pc-user-details svelte-1qk9xnc"><div class="pc-mini-avatar svelte-1qk9xnc"><img${$.attr('src', miniAvatarUrl || avatarUrl)}${$.attr('alt', `${name || 'User'} mini avatar`)} loading="lazy" class="svelte-1qk9xnc" onerror="this.__e=event"/></div> <div class="pc-user-text svelte-1qk9xnc"><div class="pc-handle svelte-1qk9xnc">@${$.escape(handle)}</div> <div class="pc-status svelte-1qk9xnc">${$.escape(status)}</div></div></div> <button class="pc-contact-btn svelte-1qk9xnc" style="pointer-events:auto" type="button"${$.attr('aria-label', `Contact ${name || 'user'}`)}>${$.escape(contactText)}</button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="pc-content svelte-1qk9xnc"><div class="pc-details svelte-1qk9xnc"><h3 class="svelte-1qk9xnc">${$.escape(name)}</h3> <p class="svelte-1qk9xnc">${$.escape(title)}</p></div></div></div></section></div></div>`);
	});
}