<script>
class Counter {
constructor() {
this.count = $state(0);
$effect(() => { this.count = 10; });
}
}
const counter = new Counter();
</script>
<button onclick={() => counter.count++}>{counter.count}</button>