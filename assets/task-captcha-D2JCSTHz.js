const e=`Many websites protect their content using so-called "CAPTCHA Challenges" -- problems that are relatively easy for a human, but difficult for automated processes, i.e., algorithms.

The goal of this exercise is to demonstrate how, using machine learning techniques, we can "overcome" these barriers. That is, we can solve them in an automated way. This problem asks you to solve mathematical problems presented as CAPTCHA images. Each image contains a problem of the form "AB ± CD" where A, B, C, D are digits (0-9) and the symbol can be addition (+) or subtraction (-). You need to recognize the digits and operator from the image and compute the result.

You can enter your answers manually below each image to see how the grading works. There are many problems -- 2,500 clean (easy) and 2,500 noisy (hard) problems, for a total of 5,000 CAPTCHAs.

**Challenge**

Design a system that finds the solutions algorithmically, and upload the solutions in bulk. The "Submit from File" button accepts JSON files with the following structure:

\`\`\`json
{
  "public-clean": "37+34=71\\n71+47=118\\n24+54=78",
  "public-noisy": "38-50=-12\\n79-55=24\\n73-08=65",
  "private-clean": "02+26=28\\n06+86=92\\n99-32=67",
  "private-noisy": "02-16=-14\\n37-60=-23\\n72-44=28"
}
\`\`\`

Each key corresponds to a difficulty level (public-clean, public-noisy, private-clean, private-noisy) and contains a string with answers separated by newlines (\`\\n\`). Each answer has the format \`equation=result\` (e.g., \`37+34=71\`).

To get started quickly, you can create a JSON file with this structure and upload it. The example above contains 3 solved problems for each test level.

**Initial Ideas**

The addition/subtraction problem is easy (and easily automated). Digit recognition is the essential difficulty in these CAPTCHA problems. The basic requirement is to be able to distinguish four digits from the image, and from these find which digits they correspond to. One approach is through neural networks for MNIST. You can start with the Colab Notebook we have prepared for you.

`;export{e as default};
