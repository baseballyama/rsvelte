import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<canvas class="w-full h-full border-none block"></canvas>`);

export default function ShapeGrid($$anchor, $$props) {
	$.push($$props, true);

	let direction = $.prop($$props, 'direction', 3, 'right'),
		speed = $.prop($$props, 'speed', 3, 1),
		borderColor = $.prop($$props, 'borderColor', 3, '#999'),
		squareSize = $.prop($$props, 'squareSize', 3, 40),
		hoverFillColor = $.prop($$props, 'hoverFillColor', 3, '#222'),
		shape = $.prop($$props, 'shape', 3, 'square'),
		hoverTrailAmount = $.prop($$props, 'hoverTrailAmount', 3, 0),
		fadeColor = $.prop($$props, 'fadeColor', 3, '#14110E');

	let canvas = $.state(null);

	$.user_effect(() => {
		if (!$.get(canvas)) return;

		const ctx = $.get(canvas).getContext('2d');

		if (!ctx) return;

		const isHex = shape() === 'hexagon';
		const isTri = shape() === 'triangle';
		const hexHoriz = squareSize() * 1.5;
		const hexVert = squareSize() * Math.sqrt(3);
		const gridOffset = { x: 0, y: 0 };
		let hoveredSquare = null;
		const trailCells = [];
		const cellOpacities = new Map();
		let requestId = null;

		const resizeCanvas = () => {
			if (!$.get(canvas)) return;

			$.get(canvas).width = $.get(canvas).offsetWidth;
			$.get(canvas).height = $.get(canvas).offsetHeight;
		};

		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();

		const drawHex = (cx, cy, size) => {
			ctx.beginPath();

			for (let i = 0; i < 6; i++) {
				const angle = Math.PI / 3 * i;
				const vx = cx + size * Math.cos(angle);
				const vy = cy + size * Math.sin(angle);

				if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
			}

			ctx.closePath();
		};

		const drawCircle = (cx, cy, size) => {
			ctx.beginPath();
			ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
			ctx.closePath();
		};

		const drawTriangle = (cx, cy, size, flip) => {
			ctx.beginPath();

			if (flip) {
				ctx.moveTo(cx, cy + size / 2);
				ctx.lineTo(cx + size / 2, cy - size / 2);
				ctx.lineTo(cx - size / 2, cy - size / 2);
			} else {
				ctx.moveTo(cx, cy - size / 2);
				ctx.lineTo(cx + size / 2, cy + size / 2);
				ctx.lineTo(cx - size / 2, cy + size / 2);
			}

			ctx.closePath();
		};

		const drawGrid = () => {
			if (!$.get(canvas)) return;

			ctx.clearRect(0, 0, $.get(canvas).width, $.get(canvas).height);

			if (isHex) {
				const colShift = Math.floor(gridOffset.x / hexHoriz);
				const offsetX = (gridOffset.x % hexHoriz + hexHoriz) % hexHoriz;
				const offsetY = (gridOffset.y % hexVert + hexVert) % hexVert;
				const cols = Math.ceil($.get(canvas).width / hexHoriz) + 3;
				const rows = Math.ceil($.get(canvas).height / hexVert) + 3;

				for (let col = -2; col < cols; col++) {
					for (let row = -2; row < rows; row++) {
						const cx = col * hexHoriz + offsetX;
						const cy = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;
						const cellKey = `${col},${row}`;
						const alpha = cellOpacities.get(cellKey);

						if (alpha) {
							ctx.globalAlpha = alpha;
							drawHex(cx, cy, squareSize());
							ctx.fillStyle = hoverFillColor();
							ctx.fill();
							ctx.globalAlpha = 1;
						}

						drawHex(cx, cy, squareSize());
						ctx.strokeStyle = borderColor();
						ctx.stroke();
					}
				}
			} else if (isTri) {
				const halfW = squareSize() / 2;
				const colShift = Math.floor(gridOffset.x / halfW);
				const rowShift = Math.floor(gridOffset.y / squareSize());
				const offsetX = (gridOffset.x % halfW + halfW) % halfW;
				const offsetY = (gridOffset.y % squareSize() + squareSize()) % squareSize();
				const cols = Math.ceil($.get(canvas).width / halfW) + 4;
				const rows = Math.ceil($.get(canvas).height / squareSize()) + 4;

				for (let col = -2; col < cols; col++) {
					for (let row = -2; row < rows; row++) {
						const cx = col * halfW + offsetX;
						const cy = row * squareSize() + squareSize() / 2 + offsetY;
						const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;
						const cellKey = `${col},${row}`;
						const alpha = cellOpacities.get(cellKey);

						if (alpha) {
							ctx.globalAlpha = alpha;
							drawTriangle(cx, cy, squareSize(), flip);
							ctx.fillStyle = hoverFillColor();
							ctx.fill();
							ctx.globalAlpha = 1;
						}

						drawTriangle(cx, cy, squareSize(), flip);
						ctx.strokeStyle = borderColor();
						ctx.stroke();
					}
				}
			} else if (shape() === 'circle') {
				const offsetX = (gridOffset.x % squareSize() + squareSize()) % squareSize();
				const offsetY = (gridOffset.y % squareSize() + squareSize()) % squareSize();
				const cols = Math.ceil($.get(canvas).width / squareSize()) + 3;
				const rows = Math.ceil($.get(canvas).height / squareSize()) + 3;

				for (let col = -2; col < cols; col++) {
					for (let row = -2; row < rows; row++) {
						const cx = col * squareSize() + squareSize() / 2 + offsetX;
						const cy = row * squareSize() + squareSize() / 2 + offsetY;
						const cellKey = `${col},${row}`;
						const alpha = cellOpacities.get(cellKey);

						if (alpha) {
							ctx.globalAlpha = alpha;
							drawCircle(cx, cy, squareSize());
							ctx.fillStyle = hoverFillColor();
							ctx.fill();
							ctx.globalAlpha = 1;
						}

						drawCircle(cx, cy, squareSize());
						ctx.strokeStyle = borderColor();
						ctx.stroke();
					}
				}
			} else {
				const offsetX = (gridOffset.x % squareSize() + squareSize()) % squareSize();
				const offsetY = (gridOffset.y % squareSize() + squareSize()) % squareSize();
				const cols = Math.ceil($.get(canvas).width / squareSize()) + 3;
				const rows = Math.ceil($.get(canvas).height / squareSize()) + 3;

				for (let col = -2; col < cols; col++) {
					for (let row = -2; row < rows; row++) {
						const sx = col * squareSize() + offsetX;
						const sy = row * squareSize() + offsetY;
						const cellKey = `${col},${row}`;
						const alpha = cellOpacities.get(cellKey);

						if (alpha) {
							ctx.globalAlpha = alpha;
							ctx.fillStyle = hoverFillColor();
							ctx.fillRect(sx, sy, squareSize(), squareSize());
							ctx.globalAlpha = 1;
						}

						ctx.strokeStyle = borderColor();
						ctx.strokeRect(sx, sy, squareSize(), squareSize());
					}
				}
			}

			const gradient = ctx.createRadialGradient($.get(canvas).width / 2, $.get(canvas).height / 2, 0, $.get(canvas).width / 2, $.get(canvas).height / 2, Math.sqrt($.get(canvas).width ** 2 + $.get(canvas).height ** 2) / 2);

			gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
			gradient.addColorStop(1, fadeColor());
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, $.get(canvas).width, $.get(canvas).height);
		};

		const updateCellOpacities = () => {
			const targets = new Map();

			if (hoveredSquare) {
				targets.set(`${hoveredSquare.x},${hoveredSquare.y}`, 1);
			}

			if (hoverTrailAmount() > 0) {
				for (let i = 0; i < trailCells.length; i++) {
					const t = trailCells[i];
					const key = `${t.x},${t.y}`;

					if (!targets.has(key)) {
						targets.set(key, (trailCells.length - i) / (trailCells.length + 1));
					}
				}
			}

			for (const [key] of targets) {
				if (!cellOpacities.has(key)) {
					cellOpacities.set(key, 0);
				}
			}

			for (const [key, opacity] of cellOpacities) {
				const target = targets.get(key) || 0;
				const next = opacity + (target - opacity) * 0.15;

				if (next < 0.005) {
					cellOpacities.delete(key);
				} else {
					cellOpacities.set(key, next);
				}
			}
		};

		const updateAnimation = () => {
			const effectiveSpeed = Math.max(speed(), 0.1);
			const wrapX = isHex ? hexHoriz * 2 : squareSize();
			const wrapY = isHex ? hexVert : isTri ? squareSize() * 2 : squareSize();

			switch (direction()) {
				case 'right':
					gridOffset.x = (gridOffset.x - effectiveSpeed + wrapX) % wrapX;
					break;

				case 'left':
					gridOffset.x = (gridOffset.x + effectiveSpeed + wrapX) % wrapX;
					break;

				case 'up':
					gridOffset.y = (gridOffset.y + effectiveSpeed + wrapY) % wrapY;
					break;

				case 'down':
					gridOffset.y = (gridOffset.y - effectiveSpeed + wrapY) % wrapY;
					break;

				case 'diagonal':
					gridOffset.x = (gridOffset.x - effectiveSpeed + wrapX) % wrapX;
					gridOffset.y = (gridOffset.y - effectiveSpeed + wrapY) % wrapY;
					break;
			}

			updateCellOpacities();
			drawGrid();
			requestId = requestAnimationFrame(updateAnimation);
		};

		const handleMouseMove = (event) => {
			if (!$.get(canvas)) return;

			const rect = $.get(canvas).getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;
			let col;
			let row;

			if (isHex) {
				const colShift = Math.floor(gridOffset.x / hexHoriz);
				const offsetX = (gridOffset.x % hexHoriz + hexHoriz) % hexHoriz;
				const offsetY = (gridOffset.y % hexVert + hexVert) % hexVert;
				const adjustedX = mouseX - offsetX;
				const adjustedY = mouseY - offsetY;

				col = Math.round(adjustedX / hexHoriz);

				const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;

				row = Math.round((adjustedY - rowOffset) / hexVert);
			} else if (isTri) {
				const halfW = squareSize() / 2;
				const offsetX = (gridOffset.x % halfW + halfW) % halfW;
				const offsetY = (gridOffset.y % squareSize() + squareSize()) % squareSize();

				col = Math.round((mouseX - offsetX) / halfW);
				row = Math.floor((mouseY - offsetY) / squareSize());
			} else if (shape() === 'circle') {
				const offsetX = (gridOffset.x % squareSize() + squareSize()) % squareSize();
				const offsetY = (gridOffset.y % squareSize() + squareSize()) % squareSize();

				col = Math.round((mouseX - offsetX) / squareSize());
				row = Math.round((mouseY - offsetY) / squareSize());
			} else {
				const offsetX = (gridOffset.x % squareSize() + squareSize()) % squareSize();
				const offsetY = (gridOffset.y % squareSize() + squareSize()) % squareSize();

				col = Math.floor((mouseX - offsetX) / squareSize());
				row = Math.floor((mouseY - offsetY) / squareSize());
			}

			if (!hoveredSquare || hoveredSquare.x !== col || hoveredSquare.y !== row) {
				if (hoveredSquare && hoverTrailAmount() > 0) {
					trailCells.unshift({ ...hoveredSquare });

					if (trailCells.length > hoverTrailAmount()) trailCells.length = hoverTrailAmount();
				}

				hoveredSquare = { x: col, y: row };
			}
		};

		const handleMouseLeave = () => {
			if (hoveredSquare && hoverTrailAmount() > 0) {
				trailCells.unshift({ ...hoveredSquare });

				if (trailCells.length > hoverTrailAmount()) trailCells.length = hoverTrailAmount();
			}

			hoveredSquare = null;
		};

		$.get(canvas).addEventListener('mousemove', handleMouseMove);
		$.get(canvas).addEventListener('mouseleave', handleMouseLeave);
		requestId = requestAnimationFrame(updateAnimation);

		return () => {
			window.removeEventListener('resize', resizeCanvas);

			if (requestId !== null) cancelAnimationFrame(requestId);

			$.get(canvas)?.removeEventListener('mousemove', handleMouseMove);
			$.get(canvas)?.removeEventListener('mouseleave', handleMouseLeave);
		};
	});

	var canvas_1 = root();

	$.bind_this(canvas_1, ($$value) => $.set(canvas, $$value), () => $.get(canvas));
	$.append($$anchor, canvas_1);
	$.pop();
}