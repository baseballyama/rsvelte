<script>
const counter = new class Counter {
constructor() {
this.count = $state(0);
$effect(() => { this.count = 10; });
}
}
</script>
<button onclick={() => counter.count++}>{counter.count}</button>