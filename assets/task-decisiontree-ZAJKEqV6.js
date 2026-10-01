const e=`**Decision trees** are a classic technique in Machine Learning that allows modeling complex input-output relationships in a way that is easily understandable by humans. They are based on automatically learning a hierarchical structure of rules where at each node a check is made on a feature, until we reach a leaf that corresponds to a prediction or category.

**Objective:** Train Decision Tree classifiers that can predict whether a student will pass or fail the course, based on the following features:

- Personal study hours per week (0 to 30 hours)
- Class attendance rate (0 to 1)
- Hours of sleep per day (4 to 10 hours)
- Assignment completion rate (0 to 1)
- Stress level (0 to 1)

For the \`Easy\` level you only need to study the first two features, while for the \`Hard\` level all the features that are provided to you. The decision tree must predict whether the student passed or not the course (0: did not pass and 1: passed).


**Note:** The score you see is indicative. To avoid overfitting, the final score will be based on the performance of the trees on a hidden dataset that is similar to the training data and the visible data displayed here.
`;export{e as default};
