<script>
    const left = $state({ value: 1 });
    const right = $state({ value: 2 });
    const logical = $state(left ?? right);
    const conditional = $state(logical ? logical : right);
    const result = $state(logical ? conditional.value : []);
</script>