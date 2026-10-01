const e=`In the game **Codenames**, there is a grid of words where each word belongs to one of two categories: **good** (which we want our teammate to find) and **bad** (which must be avoided). You know which words are good and which are bad, but your teammate sees only the words without knowing their category.

Your goal is to guide your teammate by providing **hints**, so they can identify all the good words with **the fewest possible hints**.

## Hint mechanism

Each hint consists of:

* **One word** that exists in the vocabulary.
* **A number $n$**, which indicates that your teammate should guess the $n$ most related *(remaining)* words based on the meaning of the hint.

The relatedness between words is determined by **precomputed word embeddings**, which represent semantic similarities between words. We assume your teammate is an optimal player, who each time selects the $n$ remaining words that are closest to the hint according to the embeddings.

## Objective

The objective is to find a **strategy** that produces hints in such a way as to:

* **Minimize the number of hints** required for our teammate to identify all the good words.
* Avoid hints that could lead our teammate to bad words.

## Example

Suppose we have the following grid of words:

|           |            |        |              |
| --------- | ---------- | ------ | ------------ |
| **APPLE** | DOG        | CAR    | CAT          |
| BOOK      | **FOREST** | SOCCER | TABLE        |
| WINTER    | **CARROT** | BEACH  | **MOUNTAIN** |

The good words are: **APPLE, CARROT, FOREST, MOUNTAIN**.

A good strategy could be to give the hint **("FIR", 3)**. The closest word to FIR is **FOREST**, then **MOUNTAIN**, then **APPLE**, and then **WINTER**. By choosing the number 3 along with the word FIR, we cover most of the good words while avoiding **WINTER**, which should not be guessed.

Then, we can give the hint **("VEGETABLE", 1)** or **("CARROT", 1)** to steer our teammate to **CARROT**.

Thus, instead of giving one hint per word, we reduced the total number of hints to **just two**, achieving the game’s objective more efficiently.
`;export{e as default};
