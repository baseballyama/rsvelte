<script lang="ts">
	let v = $state('');
</script>

<input onblur={function (this: HTMLInputElement, e: Event) { v = this.value; }} />
<input onfocus={function (this: HTMLInputElement) { function g(this: Window, n: number) { return n; } v = this.value + g(1); }} />
<input onclick={function (e: Event) { v = ''; }} />
