<script>
	import { paint } from './gradient.js';
</script>

<canvas
	width={32}
	height={32}
	{@attach (canvas) => {
		const context = canvas.getContext('2d');

		$effect(() => {
			let frame = requestAnimationFrame(function loop(t) {
				frame = requestAnimationFrame(loop);
				paint(context, t);
			});

			return () => {
				cancelAnimationFrame(frame);
			};
		});
	}}
></canvas>