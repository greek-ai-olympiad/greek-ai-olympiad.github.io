const e=`Have you ever wondered how recommendation systems find the perfect movie for you? Behind these services lies a powerful technique: **embeddings**.

In this task, you'll explore how recommendation systems use embeddings to find movies that match your interests. When you write a query like "sci-fi action thriller", the system converts both your query and each movie into vectors in a multidimensional space. Using **cosine similarity**, the system finds movies that are closest to your query - a form of **approximate search** that enables fast and efficient retrieval.

The UI uses the **multilingual-e5-small** model to generate 384-dimensional embeddings from queries. In the same way, each movie has a pre-computed embedding based on its title and description.

## Challenge

You're given a **target permutation** - the top 5 movies we want to appear at the top of the results. Your goal is to find an **embedding** (vector of 384 floats) that will rank the movies so these 5 movies appear first, and in the correct order!

**How well can you "game" the system?** Can you find the perfect embedding that brings the right movies to the top?

**Note**: The UI needs to download the model weights, which are hundreds of MB in size. The first load may take some time.

## Scoring System

The scoring system is based on ranking accuracy and the score difference between consecutive movies:

- **Base Score (up to 50 points)**:
  - If a target movie is in the top 5 positions: **5 points**
  - If a target movie is in the correct position: **10 points** (replaces the 5 points)
  - Maximum base score: **50 points** (5 movies × 10 points)

- **Bonus (up to 50 points)**:
  - Calculated only if all 5 target movies are in the top 5 positions **and** in the correct order
  - Based on the minimum score difference between consecutive movies (1st-2nd, 2nd-3rd, 3rd-4th, 4th-5th, 5th-6th)
  - If minimum difference reaches the level threshold: full 50 points bonus (total = 100%)
  - Otherwise: linear scaling based on the level threshold

**Goal: 100% - Can you achieve it?**
`;export{e as default};
