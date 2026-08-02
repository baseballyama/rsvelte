<script>
  let obj = $state({});
  let n = $state(0);

  function report() {
    console.log(obj);
    console.log(n);
    console.log(`n is ${n}`);
    console.log("n is " + n);
    console.log(n === 1);
    console.log($effect.tracking());
    console.log("literal", 1, true, null, undefined);
  }
</script>

<button onclick={() => console.log(obj)}>{n}</button>
<button onclick={() => console.log(n)}>read</button>
<button onclick={() => console.log(`n is ${n}`)}>interpolate</button>
<button onclick={report}>report</button>
