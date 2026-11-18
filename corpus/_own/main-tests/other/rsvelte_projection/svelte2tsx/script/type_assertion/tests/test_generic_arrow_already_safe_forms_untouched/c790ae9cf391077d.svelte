<script lang="ts">
const multi = <T, U>(x: T, y: U): T => x;
const constrained = <T extends number>(x: T): T => x;
const defaulted = <T = string>(x: T): T => x;
const already = <T,>(x: T): T => x;
function fn<T>(x: T): T { return x; }
const call = fn<number>(1);
</script>