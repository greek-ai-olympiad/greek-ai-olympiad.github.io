const e=`**Skroutz**, the most popular e-commerce platform in Greece, hosts millions of user reviews for products and stores. Each review comes with **text** (e.g., “Fast shipping, polite service”) and a **rating** from 1 to 5.

The goal of this competition is to build a Machine Learning model that, by reading only the **review text**, will predict **the corresponding rating**.

### Objective

Given the text of a review, predict its rating, which is an integer from **1** (bad experience) to **5** (excellent experience).

Beyond the text, you are provided with **precomputed embeddings** for each review, with **1024 dimensions**, based on the **Multilingual-E5-large-instruct** model. These embeddings will help you capture the context of the reviews and improve your model’s performance.

### Examples

| Review                                                              | Rating |
| ------------------------------------------------------------------- | ------ |
| “The product arrived exactly as described and very quickly!”        | 5      |
| “The store delayed the shipment and didn’t respond to emails.”      | 2      |
| “Customer service was average, but the product is worth the money.” | 3      |
| “Wrong product and no willingness to fix it.”                       | 1      |

### Evaluation

The full evaluation **(full)** will be based on the **Mean Absolute Error (MAE)** between the true and predicted ratings for the hidden test data.

Your model will also be evaluated on an easier sub-case **(easy)** using only the most extreme ratings (1 and 5). In this subset, if the true score is 5, your model receives full credit if it predicts 4 or 5, and half credit if it predicts 3. Similarly, if the true score is 1, your model receives full credit if it predicts 1 or 2, and half credit if it predicts 3.
`;export{e as default};
