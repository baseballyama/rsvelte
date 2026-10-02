<script lang="ts">
	const src = 'Hello'; // src: "Hello"
</script>

<img src={src} alt="foo"> <!-- src: "Hello" -->
<img {src} alt="foo"> <!-- src: string, src: string -->
