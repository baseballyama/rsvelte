<script lang="ts" generics="T extends (a: 1, b: 2) => void">
	let x: T = null as any; void x;
</script>
