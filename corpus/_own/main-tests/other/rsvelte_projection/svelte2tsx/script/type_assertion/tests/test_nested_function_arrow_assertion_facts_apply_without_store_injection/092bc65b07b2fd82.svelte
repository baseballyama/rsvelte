<script lang="ts">
const store = {};
function outer($store: unknown) {
const inner = <T>($inner: T) => {
const asserted = <Inner>$inner;
return asserted;
};
return <Outer>inner;
}
</script>