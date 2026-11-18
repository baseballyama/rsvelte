<script lang="ts">
	interface Point {
		x: number;
		y: number;
	}

	type Pair = [Point, Point];

	const origin: Point = { x: 0, y: 0 };
	const pair = [origin, origin] as Pair;
</script>

<p>{origin.x}{pair.length}</p>
