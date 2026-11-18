const nestedTemplate = `outer ${JSON.stringify({ key: "value" })} tail`;
const doubleNested = `a ${`b ${"c"} d`} e`;
const regexInTemplate = `x ${/[a-z]/.source} y`;
const commentLike = "/* not a comment */ // not a comment";
const templateWithComment = `${/* a real comment */ 1}`;
const stringWithBackticks = "a ` b ` c";
const escapedBacktick = `a \` b`;

let real = $state(1);

const doubled = $derived(real * 2);

export function read() {
  return [
    nestedTemplate,
    doubleNested,
    regexInTemplate,
    commentLike,
    templateWithComment,
    stringWithBackticks,
    escapedBacktick,
    doubled,
  ];
}
