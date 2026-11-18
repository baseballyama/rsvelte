<script>
  let a = 1; export let p = 1;
  if (a) {} export let q = 2;
  let s = 'export let r = 1;'; export let t = 3;
  export let u = 4; let b = 2;
  let c = 5; export { c as v };
</script>

<span>{p}{q}{t}{u}{a}{b}{s}{c}</span>
