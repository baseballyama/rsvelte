<script module>
class Counter {
    n = $state(0);
    static {
        // kept-static
    }
}
// kept-after-class
{
    // kept-in-block
}
// kept-after-block
export const answer = 42;
</script>

<p>{answer}</p>
