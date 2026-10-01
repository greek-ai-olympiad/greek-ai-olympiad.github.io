const e=`The Belousov-Zhabotinsky chemical reaction is commonly used for chemistry demonstrations because it creates striking patterns. However, its mechanism is extremely complicated. In this problem we assume that 3 compounds react: A, B and C.

## Goal

From a photo of the reaction dish we would like to predict the concentrations of compounds A, B and C. The prediction must use minimal computing power. So you should extract a few features (i.e. characteristics of the image) and then use a neural network that predicts the concentrations of the three compounds.

## Data

To obtain the data we ran experiments, mixing certain amounts of the three compounds in a shallow circular dish with a black bottom.

However, we ran into a few problems:

- At some point some of the lab lamps broke, so some photos are darker than others (not all equally darker)
- In some photos the right half of the photo was destroyed

**Training data:** For each training image we have the following data:

- $Q$: a number representing the initial state of the dish.
- $c_A, c_B, c_C$: the concentrations of the compounds when the photo was taken

**Evaluation data:** In the evaluation (test) data only the photo is given, and we must extract features.

## Information

- Compound A is red, compound B is colourless and compound C is blue.
- You may assume that when two colours are mixed, each of which has only one of the 3 RGB channels, the information of the corresponding channels simply adds up.

## Submission and scoring

You submit your model together with the features of the evaluation images. Your neural network must have at most 2000 parameters, consist only of \`Linear\`, \`LayerNorm\`, \`ReLU\`, \`ELU\`, \`Mish\` or \`Tanh\` layers, and its first layer must be \`Linear\`. The first layer takes $1 + a$ inputs: $Q$ (added by the server) and the $a$ features you extracted. The last layer outputs the concentrations of A, B and C, in this order.

For each image $i$ we compute

$$\\text{Score}_i = \\frac{1}{3} \\sum_{k \\in \\{A,B,C\\}} \\max\\left(0, 1 - \\frac{5|c_k - \\hat{c}_k|}{\\sqrt{c_k} + 1}\\right)$$

where $c_k$ is the true concentration of compound $k$ and $\\hat{c}_k$ the concentration of compound $k$ you predicted. Finally,

$$\\text{Score} = \\frac{\\mu(a)}{N} \\sum_{i} \\text{Score}_i$$

where $a$ is the number of features you use and

$$
\\mu(a) = \\begin{cases}
1 & 0 \\leq a \\leq 2 \\\\
-\\frac{1}{10}(a-2) + 1 & 2 < a \\leq 4 \\\\
-\\frac{1}{100}(a-4) + 0.8 & 4 < a \\leq 20 \\\\
-\\frac{1}{400}(a-20) + 0.64 & 20 < a \\leq 276 \\\\
0 & a > 276
\\end{cases}
$$

The higher the Score, the higher the final score, up to 100. You are scored on testA and testB; the testA score is shown to you, but only the hidden testB score counts in the end.
`;export{e as default};
