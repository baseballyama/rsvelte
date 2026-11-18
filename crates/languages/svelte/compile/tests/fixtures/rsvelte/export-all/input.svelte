<script lang="ts">
	import { x } from "m";
	export * from "mod" with { type: "json" };
	export * as ns from "mod2";
	let y = $state(1);
</script>
{y}{x}
