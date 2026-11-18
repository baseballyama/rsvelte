<script>
  let { initial = 1 } = $props();
  let value = $state(initial);
  export const version = 'vapor';
  export const object = $state({ count: 1 });
  export const [token] = ['native'];
  export function increase() { value++; object.count++; }
  export function current() { return value; }
  export class Counter {
    value = $state(1);
    increment() { this.value++; }
  }
</script>
<p class="export-child">{value}</p>
