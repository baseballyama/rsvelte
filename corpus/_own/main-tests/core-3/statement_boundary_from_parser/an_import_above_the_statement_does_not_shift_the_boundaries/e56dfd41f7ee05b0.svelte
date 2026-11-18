<script>
  import { noop } from './noop.js';
  export let a = 1;
  export let b = 2;
  let n = 0;
  $: v = a -
    b;
  noop;
</script>

<p>{v}{n}</p>
