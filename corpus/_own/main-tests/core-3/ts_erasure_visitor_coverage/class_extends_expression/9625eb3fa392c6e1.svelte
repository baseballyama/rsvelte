<script lang="ts">
	class Base {}
	const B: any = Base;
	class A extends (B as any) {}
	console.log(A);
</script>

<p>ok</p>
