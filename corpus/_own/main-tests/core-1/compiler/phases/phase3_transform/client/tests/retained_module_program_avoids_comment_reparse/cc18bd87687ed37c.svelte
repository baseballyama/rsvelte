<script module>
// omitted
export const answer = 42;

export function nested() {
    // kept
    return answer;
}
</script>

<p>{answer}</p>
