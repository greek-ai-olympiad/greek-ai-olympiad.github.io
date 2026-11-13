const e=`Word embeddings (word embeddings)
are a pioneering technique in Natural Language Processing (NLP)
that converts words into numerical vectors in a multidimensional space.
In this space, words with similar meanings lie close to each other, enabling
computers to understand semantic and syntactic relationships without relying
exclusively on linguistic rules. For this problem, Facebook’s
[fastText](https://fasttext.cc/docs/en/crawl-vectors.html) embeddings are used.

**Challenge:** Connect two random words via a chain of semantically related words.

**Example:** Starting from the concept \`chain\`, we reach the concept \`word\` as follows:

\`chain\`-\`link\`-\`connecting\`-\`periphrastic\`-\`periphrasis\`-\`word\`

Build bridges for the given pairs of words. The **dark** bridges are the best and
have distance 1. The **faint** ones have distance 2, while the
**dashed** ones are a more distant connection and have distance 3.

The goal is to find the shortest path.
**How close can you get?**
`;export{e as default};
