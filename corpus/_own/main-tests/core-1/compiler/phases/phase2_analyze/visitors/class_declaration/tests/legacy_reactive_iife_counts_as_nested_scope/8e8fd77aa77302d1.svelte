<script>
export let v;
let k;
$: k = (() => { class T extends /ab/.constructor { m() { return v; } } return new T().m(); })();
</script>
