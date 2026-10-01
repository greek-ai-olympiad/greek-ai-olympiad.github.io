const e=`Neural networks (NNs) have flourished in recent years, finding applications in a wide range of scientific fields. Alongside research on improving and developing new architectures, the robustness of NNs is also being studied.

In particular, recent work has shown that many image-classification architectures are highly vulnerable to malicious attacks. For example, one can construct images that are almost identical to real data, yet are misclassified by an NN trained with the traditional methods.

## Goal

The goal is to train an NN that classifies digits so that it stays robust to attacks, without changing its architecture. More specifically, your model should correctly classify not only "clean" digit images but also "perturbed" versions of them produced by a malicious user (adversary).

## Data

For training, you are given clean digit images from the MNIST dataset together with their labels. Each image consists of pixels with values in $[0, 1]$. An adversary may modify a clean MNIST image $X$ and produce a perturbed image $Y$, subject to the following constraints:

- every pixel of $Y$ must stay in $[0, 1]$, and
- for every pixel $Y_i$ of the perturbed image $Y$ and the corresponding pixel $X_i$ of the original image $X$, $|Y_i - X_i| \\leq 0.3$.

In other words, every pixel of the perturbed image may change by at most $0.3$, without leaving the allowed range $[0, 1]$.

The model architecture (which may not be changed) is:

\`\`\`python
class SmallMNISTCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, kernel_size=5, padding=2)
        self.conv2 = nn.Conv2d(8, 16, kernel_size=5, padding=2)
        self.fc = nn.Linear(7 * 7 * 16, 10)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.conv1(x)), 2)
        x = F.max_pool2d(F.relu(self.conv2(x)), 2)
        return self.fc(x.view(x.size(0), -1))
\`\`\`

## Evaluation

Your model is evaluated on its ability to correctly classify both "clean" and "perturbed" images, under the attack model described above.

During the contest, feedback is given through submissions on a set of "perturbed" examples. The displayed score comes from your model's accuracy: the higher the accuracy, the higher the score. The final evaluation includes a check on a private set of "perturbed" examples and possibly an additional robustness check of your model (which may also take characteristics of the model into account).

You submit the trained model itself (its weights, from the notebook). The grader attacks it: for every evaluation image it runs a PGD attack ($L_\\infty$, $\\epsilon = 0.3$, 20 steps) on the original clean image and also checks the given perturbed version. An image counts as correct only if the model classifies both correctly, and the score grows with that accuracy.
`;export{e as default};
