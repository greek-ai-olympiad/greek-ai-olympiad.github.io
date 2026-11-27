const n=`We want to colour a square of side 1 using a neural network. The function maps every point $(x,y)$ with $0 \\le x,y \\le 1$ to three colour intensities $(r, g, b)$ with $0 \\le r, g, b \\le 1$, corresponding to the red, green and blue components.

For this task we will use a given neural network architecture as the function that colours the square. The network takes 2 inputs, the coordinates $(x,y)$, and outputs 3 values, the rgb intensities. Your goal is to train such an architecture for each image so that it reproduces the image as faithfully as possible.
\`\`\`
nn.Sequential(
  nn.Linear(2, 10),    
  nn.ReLU(),    
  nn.Linear(10, 10),    
  nn.ReLU(),    
  nn.Linear(10, 10),    
  nn.ReLU(),    
  nn.Linear(10, 10),    
  nn.ReLU(),    
  nn.Linear(10, 10),    
  nn.ReLU(),    
  nn.Linear(10, 10),    
  nn.ReLU(),    
  nn.Linear(10, 3)
)
\`\`\`

## Objective
Optimise the weights and biases of the neural network to achieve the highest possible similarity score with the target image.
`;export{n as default};
