import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export default function MagicBento($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DEFAULT_PARTICLE_COUNT = 12;
		const DEFAULT_SPOTLIGHT_RADIUS = 300;
		const DEFAULT_GLOW_COLOR = '255, 138, 76';
		const MOBILE_BREAKPOINT = 768;

		const cardData = [
			{
				color: '#14110E',
				title: 'Analytics',
				description: 'Track user behavior',
				label: 'Insights'
			},

			{
				color: '#14110E',
				title: 'Dashboard',
				description: 'Centralized data view',
				label: 'Overview'
			},

			{
				color: '#14110E',
				title: 'Collaboration',
				description: 'Work together seamlessly',
				label: 'Teamwork'
			},

			{
				color: '#14110E',
				title: 'Automation',
				description: 'Streamline workflows',
				label: 'Efficiency'
			},

			{
				color: '#14110E',
				title: 'Integration',
				description: 'Connect favorite tools',
				label: 'Connectivity'
			},

			{
				color: '#14110E',
				title: 'Security',
				description: 'Enterprise-grade protection',
				label: 'Protection'
			}
		];

		let {
			textAutoHide = true,
			enableStars = true,
			enableSpotlight = true,
			enableBorderGlow = true,
			disableAnimations = false,
			spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
			particleCount = DEFAULT_PARTICLE_COUNT,
			enableTilt = false,
			glowColor = DEFAULT_GLOW_COLOR,
			clickEffect = true,
			enableMagnetism = true
		} = $$props;

		let gridRef;
		let isMobile = false;
		const shouldDisableAnimations = $.derived(() => disableAnimations || isMobile);

		function createParticleEl(x, y, color) {
			const el = document.createElement('div');

			el.className = 'particle';
			el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${color},1);box-shadow:0 0 6px rgba(${color},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;

			return el;
		}

		function updateCardGlow(card, mx, my, glow, radius) {
			const rect = card.getBoundingClientRect();

			card.style.setProperty('--glow-x', `${(mx - rect.left) / rect.width * 100}%`);
			card.style.setProperty('--glow-y', `${(my - rect.top) / rect.height * 100}%`);
			card.style.setProperty('--glow-intensity', glow.toString());
			card.style.setProperty('--glow-radius', `${radius}px`);
		}

		function attachCard(el, index) {
			// Per-card behaviour: particles (if enableStars), tilt, magnetism, click ripple
			let isHovered = false;

			const timeouts = [];
			const liveParticles = [];
			let memoParticles = [];
			let particlesInit = false;
			let magnetTween = null;

			const initParticles = () => {
				if (particlesInit || !el) return;

				const { width, height } = el.getBoundingClientRect();

				memoParticles = Array.from({ length: particleCount }, () => createParticleEl(Math.random() * width, Math.random() * height, glowColor));
				particlesInit = true;
			};

			const clearParticles = () => {
				timeouts.forEach(clearTimeout);
				timeouts.length = 0;
				magnetTween?.kill();

				liveParticles.forEach((p) => {
					gsap.to(p, {
						scale: 0,
						opacity: 0,
						duration: 0.3,
						ease: 'back.in(1.7)',
						onComplete: () => p.parentNode?.removeChild(p)
					});
				});

				liveParticles.length = 0;
			};

			const animateParticles = () => {
				if (!isHovered) return;
				if (!particlesInit) initParticles();

				memoParticles.forEach((p, i) => {
					const t = setTimeout(
						() => {
							if (!isHovered) return;

							const clone = p.cloneNode(true);

							el.appendChild(clone);
							liveParticles.push(clone);
							gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

							gsap.to(clone, {
								x: (Math.random() - 0.5) * 100,
								y: (Math.random() - 0.5) * 100,
								rotation: Math.random() * 360,
								duration: 2 + Math.random() * 2,
								ease: 'none',
								repeat: -1,
								yoyo: true
							});

							gsap.to(clone, {
								opacity: 0.3,
								duration: 1.5,
								ease: 'power2.inOut',
								repeat: -1,
								yoyo: true
							});
						},
						i * 100
					);

					timeouts.push(t);
				});
			};

			const onEnter = () => {
				if (shouldDisableAnimations()) return;

				isHovered = true;

				if (enableStars) animateParticles();

				if (enableTilt) gsap.to(el, {
					rotateX: 5,
					rotateY: 5,
					duration: 0.3,
					ease: 'power2.out',
					transformPerspective: 1000
				});
			};

			const onLeave = () => {
				if (shouldDisableAnimations()) return;

				isHovered = false;

				if (enableStars) clearParticles();
				if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
				if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
			};

			const onMove = (e) => {
				if (shouldDisableAnimations()) return;
				if (!enableTilt && !enableMagnetism) return;

				const rect = el.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				const cx = rect.width / 2, cy = rect.height / 2;

				if (enableTilt) {
					gsap.to(el, {
						rotateX: (y - cy) / cy * -10,
						rotateY: (x - cx) / cx * 10,
						duration: 0.1,
						ease: 'power2.out',
						transformPerspective: 1000
					});
				}

				if (enableMagnetism) {
					magnetTween = gsap.to(el, {
						x: (x - cx) * 0.05,
						y: (y - cy) * 0.05,
						duration: 0.3,
						ease: 'power2.out'
					});
				}
			};

			const onClick = (e) => {
				if (!clickEffect || shouldDisableAnimations()) return;

				const rect = el.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				const maxD = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));
				const ripple = document.createElement('div');

				ripple.style.cssText = `position:absolute;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;background:radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);left:${x - maxD}px;top:${y - maxD}px;pointer-events:none;z-index:1000;`;
				el.appendChild(ripple);

				gsap.fromTo(ripple, { scale: 0, opacity: 1 }, {
					scale: 1,
					opacity: 0,
					duration: 0.8,
					ease: 'power2.out',
					onComplete: () => ripple.remove()
				});
			};

			el.addEventListener('mouseenter', onEnter);
			el.addEventListener('mouseleave', onLeave);
			el.addEventListener('mousemove', onMove);
			el.addEventListener('click', onClick);

			return () => {
				isHovered = false;
				el.removeEventListener('mouseenter', onEnter);
				el.removeEventListener('mouseleave', onLeave);
				el.removeEventListener('mousemove', onMove);
				el.removeEventListener('click', onClick);
				clearParticles();
			};
		}

		function cardAction(node, index) {
			const detach = attachCard(node, index);

			return { destroy: detach };
		}

		onMount(() => {
			const checkMobile = () => isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

			checkMobile();
			window.addEventListener('resize', checkMobile);

			// Global spotlight
			let spotlight = null;

			let onDocMove = null;
			let onDocLeave = null;

			if (enableSpotlight && !shouldDisableAnimations()) {
				spotlight = document.createElement('div');
				spotlight.className = 'global-spotlight';
				spotlight.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle, rgba(${glowColor}, 0.15) 0%, rgba(${glowColor}, 0.08) 15%, rgba(${glowColor}, 0.04) 25%, rgba(${glowColor}, 0.02) 40%, rgba(${glowColor}, 0.01) 65%, transparent 70%);z-index:200;opacity:0;transform:translate(-50%, -50%);mix-blend-mode:screen;`;
				document.body.appendChild(spotlight);

				const proximity = spotlightRadius * 0.5;
				const fadeDistance = spotlightRadius * 0.75;

				onDocMove = (e) => {
					if (!spotlight || !gridRef) return;

					const section = gridRef.closest('.bento-section');
					const rect = section?.getBoundingClientRect();
					const inside = !!rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
					const cards = gridRef.querySelectorAll('.magic-bento-card');

					if (!inside) {
						gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
						cards.forEach((c) => c.style.setProperty('--glow-intensity', '0'));

						return;
					}

					let minDistance = Infinity;

					cards.forEach((card) => {
						const cr = card.getBoundingClientRect();
						const cx = cr.left + cr.width / 2;
						const cy = cr.top + cr.height / 2;
						const distance = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
						const eff = Math.max(0, distance);

						minDistance = Math.min(minDistance, eff);

						let glow = 0;

						if (eff <= proximity) glow = 1; else if (eff <= fadeDistance) glow = (fadeDistance - eff) / (fadeDistance - proximity);

						updateCardGlow(card, e.clientX, e.clientY, glow, spotlightRadius);
					});

					gsap.to(spotlight, {
						left: e.clientX,
						top: e.clientY,
						duration: 0.1,
						ease: 'power2.out'
					});

					const targetOpacity = minDistance <= proximity
						? 0.8
						: minDistance <= fadeDistance
							? (fadeDistance - minDistance) / (fadeDistance - proximity) * 0.8
							: 0;

					gsap.to(spotlight, {
						opacity: targetOpacity,
						duration: targetOpacity > 0 ? 0.2 : 0.5,
						ease: 'power2.out'
					});
				};

				onDocLeave = () => {
					gridRef?.querySelectorAll('.magic-bento-card').forEach((c) => c.style.setProperty('--glow-intensity', '0'));

					if (spotlight) gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
				};

				document.addEventListener('mousemove', onDocMove);
				document.addEventListener('mouseleave', onDocLeave);
			}

			return () => {
				window.removeEventListener('resize', checkMobile);

				if (onDocMove) document.removeEventListener('mousemove', onDocMove);
				if (onDocLeave) document.removeEventListener('mouseleave', onDocLeave);

				spotlight?.parentNode?.removeChild(spotlight);
			};
		});

		const baseCardClass = $.derived(() => `magic-bento-card ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''} ${enableStars ? 'particle-container' : ''} ${textAutoHide ? 'magic-bento-card--text-autohide' : ''}`);
		const cardStyle = (color) => `background-color:${color || 'var(--background-dark)'};`;

		$$renderer.push(`<div class="bento-section svelte-f4wcgw"><div class="card-grid"><!--[-->`);

		const each_array = $.ensure_array_like(cardData);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let card = each_array[i];

			$$renderer.push(`<div${$.attr_class($.clsx(baseCardClass()), 'svelte-f4wcgw')}${$.attr_style(cardStyle(card.color))}><div class="magic-bento-card__header"><span class="magic-bento-card__label">${$.escape(card.label)}</span></div> <div class="magic-bento-card__content"><h3 class="magic-bento-card__title">${$.escape(card.title)}</h3> <p class="magic-bento-card__description">${$.escape(card.description)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}