import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Matter from "matter-js";

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div class="z-1 relative pt-8 w-full h-full overflow-hidden text-center cursor-pointer" role="button" tabindex="0"><div class="inline-block"></div> <canvas class="top-0 left-0 z-0 absolute"></canvas></div>`);

export default function FallingText($$anchor, $$props) {
	$.push($$props, true);

	let text = $.prop($$props, 'text', 3, ""),
		highlightWords = $.prop($$props, 'highlightWords', 19, () => []),
		highlightClass = $.prop($$props, 'highlightClass', 3, "highlighted"),
		trigger = $.prop($$props, 'trigger', 3, "auto"),
		backgroundColor = $.prop($$props, 'backgroundColor', 3, "transparent"),
		wireframes = $.prop($$props, 'wireframes', 3, false),
		gravity = $.prop($$props, 'gravity', 3, 1),
		mouseConstraintStiffness = $.prop($$props, 'mouseConstraintStiffness', 3, 0.2),
		fontSize = $.prop($$props, 'fontSize', 3, "1rem");

	let containerEl = $.state(void 0);
	let canvasEl = $.state(void 0);
	let effectStarted = $.state(false);

	const words = $.derived(() => text().split(" ").map((word) => ({
		word,
		isHighlighted: highlightWords().some((hw) => word.startsWith(hw))
	})));

	let spanEls = $.proxy([]);

	$.user_effect(() => {
		if (trigger() === "auto") {
			$.set(effectStarted, true);

			return;
		}

		if (trigger() === "scroll" && $.get(containerEl)) {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						$.set(effectStarted, true);
						observer.disconnect();
					}
				},
				{ threshold: 0.1 }
			);

			observer.observe($.get(containerEl));

			return () => observer.disconnect();
		}
	});

	$.user_effect(() => {
		if (!$.get(effectStarted)) return;
		if (!$.get(containerEl) || !$.get(canvasEl)) return;
		if (spanEls.some((el) => !el)) return;

		const {
			Engine,
			Render,
			World,
			Bodies,
			Runner,
			Mouse,
			MouseConstraint
		} = Matter;

		const containerRect = $.get(containerEl).getBoundingClientRect();
		const width = containerRect.width;
		const height = containerRect.height;

		if (width <= 0 || height <= 0) return;

		const engine = Engine.create();

		engine.world.gravity.y = gravity();

		const render = Render.create({
			canvas: $.get(canvasEl),
			engine,
			options: {
				width,
				height,
				background: backgroundColor(),
				wireframes: wireframes()
			}
		});

		const boundaryOptions = { isStatic: true, render: { fillStyle: "transparent" } };
		const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions);
		const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions);
		const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions);
		const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions);

		const wordBodies = spanEls.map((elem) => {
			const rect = elem.getBoundingClientRect();
			const x = rect.left - containerRect.left + rect.width / 2;
			const y = rect.top - containerRect.top + rect.height / 2;

			const body = Bodies.rectangle(x, y, rect.width, rect.height, {
				render: { fillStyle: "transparent" },
				restitution: 0.8,
				frictionAir: 0.01,
				friction: 0.2
			});

			Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: 0 });
			Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

			return { elem, body };
		});

		wordBodies.forEach(({ elem, body }) => {
			elem.style.position = "absolute";
			elem.style.left = `${body.position.x - body.bounds.max.x + body.bounds.min.x / 2}px`;
			elem.style.top = `${body.position.y - body.bounds.max.y + body.bounds.min.y / 2}px`;
			elem.style.transform = "none";
		});

		const mouse = Mouse.create($.get(containerEl));

		const mouseConstraint = MouseConstraint.create(engine, {
			mouse,
			constraint: {
				stiffness: mouseConstraintStiffness(),
				render: { visible: false }
			}
		});

		render.mouse = mouse;

		World.add(engine.world, [
			floor,
			leftWall,
			rightWall,
			ceiling,
			mouseConstraint,
			...wordBodies.map((wb) => wb.body)
		]);

		const runner = Runner.create();

		Runner.run(runner, engine);
		Render.run(render);

		let rafId;

		const updateLoop = () => {
			wordBodies.forEach(({ body, elem }) => {
				const { x, y } = body.position;

				elem.style.left = `${x}px`;
				elem.style.top = `${y}px`;
				elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
			});

			Matter.Engine.update(engine);
			rafId = requestAnimationFrame(updateLoop);
		};

		updateLoop();

		return () => {
			cancelAnimationFrame(rafId);
			Render.stop(render);
			Runner.stop(runner);
			World.clear(engine.world, false);
			Engine.clear(engine);
		};
	});

	function handleTrigger() {
		if (!$.get(effectStarted) && (trigger() === "click" || trigger() === "hover")) {
			$.set(effectStarted, true);
		}
	}

	var div = root_1();
	var div_1 = $.child(div);
	let styles;

	$.each(div_1, 21, () => $.get(words), $.index, ($$anchor, $$item, index) => {
		let word = () => $.get($$item).word;
		let isHighlighted = () => $.get($$item).isHighlighted;
		var span = root();
		var text_1 = $.only_child(span, true);

		$.bind_this(span, ($$value, index) => spanEls[index] = $$value, (index) => spanEls?.[index], () => [index]);

		$.template_effect(() => {
			$.set_class(span, 1, `inline-block mx-0.5 select-none ${(isHighlighted() ? highlightClass() : '') ?? ''}`);
			$.set_text(text_1, word());
		});

		$.append($$anchor, span);
	});

	$.reset(div_1);

	var canvas = $.sibling(div_1, 2);

	$.bind_this(canvas, ($$value) => $.set(canvasEl, $$value), () => $.get(canvasEl));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
	$.template_effect(() => styles = $.set_style(div_1, '', styles, { 'font-size': fontSize(), 'line-height': 1.4 }));

	$.delegated('click', div, function (...$$args) {
		(trigger() === "click" ? handleTrigger : undefined)?.apply(this, $$args);
	});

	$.event('mouseenter', div, function (...$$args) {
		(trigger() === "hover" ? handleTrigger : undefined)?.apply(this, $$args);
	});

	$.delegated('keydown', div, (e) => e.key === "Enter" && handleTrigger());
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);