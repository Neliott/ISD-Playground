import VisualScatterIntro from '../components/visuals/VisualScatterIntro.vue'
import VisualSlopeIntercept from '../components/visuals/VisualSlopeIntercept.vue'
import VisualResiduals from '../components/visuals/VisualResiduals.vue'
import VisualGradientDescent from '../components/visuals/VisualGradientDescent.vue'
import VisualOverfitting from '../components/visuals/VisualOverfitting.vue'
import VisualCorrelation from '../components/visuals/VisualCorrelation.vue'
import QuizView from '../components/learning/QuizView.vue'
import LinearRegressionView from '../experiences/linear-regression/LinearRegressionView.vue'
import KnnLvqView from '../experiences/knn-lvq/KnnLvqView.vue'
import VisualKnnVoting from '../components/visuals/VisualKnnVoting.vue'
import VisualLvqUpdate from '../components/visuals/VisualLvqUpdate.vue'
import VisualDistanceMetrics from '../components/visuals/VisualDistanceMetrics.vue'
import VisualKEffect from '../components/visuals/VisualKEffect.vue'
import GradientDescentView from '../experiences/gradient-descent/GradientDescentView.vue'
import ConfusionMatrixView from '../experiences/confusion-matrix/ConfusionMatrixView.vue'
import BoxPlotHistogramView from '../experiences/box-plot-histogram/BoxPlotHistogramView.vue'
import VisualDistribution from '../components/visuals/VisualDistribution.vue'

export const courses = [
    {
        id: 'linear-regression',
        title: 'Linear Regression',
        description: 'The "Hello World" of Machine Learning. Predict values using straight lines.',
        steps: [
            {
                id: 'intro',
                type: 'concept',
                title: 'Linear Regression',
                content: `
          <p class="text-xl text-white mb-6">Unlocking the Power of Prediction.</p>
          <p class="mb-4">Linear Regression is the "Hello World" of Machine Learning. It assumes there is a simple underlying trend in your data.</p>
          <p>By finding this trend, we can predict future values based on past observations.</p>
        `,
                component: VisualScatterIntro
            },
            {
                id: 'goal',
                type: 'concept',
                title: 'The Goal: Best Fit',
                content: `
          <p class="mb-4">Our objective is to draw a line that passes as close as possible to all data points.</p>
          <p class="mb-4">But how do we define "close"? With mathematics!</p>
          <div class="p-4 bg-white/5 border border-white/10 rounded-lg">
            <code class="text-green-400">y = mx + b</code>
            <p class="text-xs mt-2 text-text-muted">m = Slope (Trend direction)<br>b = Intercept (Starting value)</p>
          </div>
        `,
                component: VisualSlopeIntercept
            },
            {
                id: 'playground',
                type: 'experiment',
                title: 'Interactive Playground',
                content: 'Experiment with the data points.',
                content: 'Experiment with the data points.',
                component: LinearRegressionView,
                props: { isEmbedded: true }
            },
            {
                id: 'mse',
                type: 'concept',
                title: 'Visualizing Error (MSE)',
                content: `
          <p class="mb-4">To find the best line, we calculate the <strong>Residuals</strong> (red lines).</p>
          <p class="mb-4">We simplify the problem by calculating the <strong>Mean Squared Error (MSE)</strong>.</p>
          <p class="text-sm text-text-muted">The animated squares you see represent the error being "squared". Our goal is to make the total area of these red squares as small as possible.</p>
        `,
                component: VisualResiduals
            },
            {
                id: 'gradient-descent',
                type: 'concept',
                title: 'How It Learns',
                content: `
          <p class="mb-4">Imagine a blindfolded hiker trying to find a valley's bottom.</p>
          <p class="mb-4">This process is called <strong>Gradient Descent</strong>.</p>
          <ul class="list-disc pl-5 space-y-2 text-sm text-text-muted">
            <li>The 'Ball' is our model's parameters.</li>
            <li>The 'Hill' is the total error.</li>
            <li>We take small steps downhill until we stop moving.</li>
          </ul>
        `,
                component: VisualGradientDescent
            },
            {
                id: 'overfitting',
                type: 'concept',
                title: 'The Danger of Complexity',
                content: `
          <p class="mb-4">More power isn't always better.</p>
          <p class="mb-4">If we use a complex model (like a high-degree polynomial) on simple data, we risk <strong>Overfitting</strong>.</p>
          <p class="text-sm text-text-muted">Watch the animation cycle through Underfitting (too simple), Good Fit, and Overfitting (memorizing noise).</p>
        `,
                component: VisualOverfitting
            },
            {
                id: 'correlation',
                type: 'concept',
                title: 'Correlation Coefficient',
                content: `
          <p class="mb-4">How well does X predict Y?</p>
          <p class="mb-4">The <strong>Pearson Coefficient (r)</strong> gives us a score from -1 to 1.</p>
          <ul class="list-disc pl-5 space-y-2 text-sm text-text-muted">
            <li><strong>1</strong>: Perfect positive correlation</li>
            <li><strong>0</strong>: No correlation (random cloud)</li>
            <li><strong>-1</strong>: Perfect negative correlation</li>
          </ul>
        `,
                component: VisualCorrelation
            },
            {
                id: 'quiz',
                type: 'quiz',
                title: 'Knowledge Check',
                component: QuizView,
                props: {
                    questions: [
                        {
                            id: 1,
                            question: "What is the main goal of Linear Regression?",
                            options: [
                                { id: 'a', text: "To classify data into groups", isCorrect: false },
                                { id: 'b', text: "To find the best fitting line through data points", isCorrect: true },
                                { id: 'c', text: "To sort data alphabetically", isCorrect: false }
                            ],
                            explanation: "Linear regression aims to model the relationship between variables by fitting a linear equation to observed data."
                        },
                        {
                            id: 2,
                            question: "What does the 'Slope' (m) represent?",
                            options: [
                                { id: 'a', text: "Where the line starts on the y-axis", isCorrect: false },
                                { id: 'b', text: "The direction and steepness of the trend", isCorrect: true },
                                { id: 'c', text: "The total error of the model", isCorrect: false }
                            ],
                            explanation: "The slope indicates how much the dependent variable changes for a unit change in the independent variable."
                        },
                        {
                            id: 3,
                            question: "What is 'Overfitting'?",
                            options: [
                                { id: 'a', text: "When the model is too simple", isCorrect: false },
                                { id: 'b', text: "When the model fits the noise instead of the signal", isCorrect: true },
                                { id: 'c', text: "When the model runs too slowly", isCorrect: false }
                            ],
                            explanation: "Overfitting happens when a model is too complex and learns the random noise in the training data rather than the underlying pattern."
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'knn-lvq',
        title: 'KNN & LVQ',
        description: 'Lazy Learning vs Prototype-based Learning. Classification basics.',
        steps: [
            {
                id: 'intro',
                type: 'concept',
                title: 'Lazy Learning (k-NN)',
                content: `
            <p class="text-xl text-white mb-6">Tell me who your neighbors are, and I'll tell you who you are.</p>
            <p class="mb-4">k-Nearest Neighbors (k-NN) is a simple but powerful algorithm.</p>
            <p class="mb-4">It doesn't "learn" a model. Instead, it memorizes all training data effectively postponing the decision until you ask for a prediction (Lazy Learning).</p>
          `
            },
            {
                id: 'voting',
                type: 'concept',
                title: 'Voting Mechanism',
                content: `
            <p class="mb-4">When a new point appears (the question mark), we find the <strong>k</strong> closest known points.</p>
            <p class="mb-4">These neighbors vote on the class of the new point. Majority wins.</p>
            <p class="text-sm text-text-muted">In the visual, watch the circle expand to find its 3 closest friends.</p>
          `,
                component: VisualKnnVoting
            },
            {
                id: 'playground',
                type: 'experiment',
                title: 'Interactive Playground',
                content: 'Experiment with k-NN and LVQ.',
                component: KnnLvqView,
                props: { isEmbedded: true }
            },
            {
                id: 'distance',
                type: 'concept',
                title: 'How do we measure "Close"?',
                content: `
            <p class="mb-4">Distance isn't always a straight line.</p>
            <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-text-muted">
              <li><strong>Euclidean (L2)</strong>: The standard straight line (crow flies). Best for physical setups.</li>
              <li><strong>Manhattan (L1)</strong>: Only horizontal/vertical moves (like a taxi in a grid city).</li>
            </ul>
            <p class="text-sm">Changing the metric changes which neighbors are "closest"!</p>
          `,
                component: VisualDistanceMetrics
            },
            {
                id: 'k-effect',
                type: 'concept',
                title: 'The "k" Hyperparameter',
                content: `
            <p class="mb-4">How many neighbors should we trust?</p>
            <ul class="list-disc pl-5 space-y-2 text-sm text-text-muted mb-4">
              <li><strong>Low k (e.g., 1)</strong>: Very detailed, jagged boundaries. Fits every noisy point. (High Variance)</li>
              <li><strong>High k</strong>: Smooth boundaries. Ignores small islands of data. (High Bias)</li>
            </ul>
          `,
                component: VisualKEffect
            },
            {
                id: 'lvq-intro',
                type: 'concept',
                title: 'Switching to LVQ',
                content: `
            <p class="mb-4">k-NN is slow if you have millions of points. You have to measure distance to ALL of them.</p>
            <p class="mb-4"><strong>Learning Vector Quantization (LVQ)</strong> solves this by using "Prototypes".</p>
            <p>We only keep a few points per class. These prototypes move to represent the data.</p>
          `
            },
            {
                id: 'lvq-dynamics',
                type: 'concept',
                title: 'LVQ Training Dynamics',
                content: `
            <p class="mb-4">Prototypes learn by moving based on feedback:</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="p-3 bg-green-500/10 border border-green-500/20 rounded">
                <strong class="text-green-400 block mb-1">Attraction</strong>
                If nearest prototype is CORRECT class -> Move Closer.
              </div>
              <div class="p-3 bg-red-500/10 border border-red-500/20 rounded">
                <strong class="text-red-400 block mb-1">Repulsion</strong>
                If nearest prototype is WRONG class -> Move Away.
              </div>
            </div>
          `,
                component: VisualLvqUpdate
            },
            {
                id: 'quiz',
                type: 'quiz',
                title: 'Knowledge Check',
                component: QuizView,
                props: {
                    questions: [
                        {
                            id: 1,
                            question: "How does k-NN classify a new point?",
                            options: [
                                { id: 'a', text: "It builds a decision tree", isCorrect: false },
                                { id: 'b', text: "It asks the nearest neighbors to vote", isCorrect: true },
                                { id: 'c', text: "It calculates the average of all points", isCorrect: false }
                            ],
                            explanation: "k-NN looks at the 'k' closest data points and assigns the most common class among them to the new point."
                        },
                        {
                            id: 2,
                            question: "What happens if 'k' is too small (e.g., k=1)?",
                            options: [
                                { id: 'a', text: "The model becomes too simple (Underfitting)", isCorrect: false },
                                { id: 'b', text: "The model captures noise and outliers (Overfitting)", isCorrect: true },
                                { id: 'c', text: "The model becomes very slow", isCorrect: false }
                            ],
                            explanation: "A small 'k' makes the decision boundary very jagged and sensitive to noise, leading to high variance (overfitting)."
                        },
                        {
                            id: 3,
                            question: "How does LVQ differ from k-NN?",
                            options: [
                                { id: 'a', text: "LVQ uses prototypes instead of all data points", isCorrect: true },
                                { id: 'b', text: "LVQ is a regression algorithm", isCorrect: false },
                                { id: 'c', text: "LVQ requires no training", isCorrect: false }
                            ],
                            explanation: "LVQ learns a set of prototypes to represent the classes, making prediction much faster than k-NN which needs all training data."
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'gradient-descent',
        title: 'Gradient Descent',
        description: 'How machines learn by sliding down hills.',
        steps: [
            {
                id: 'intro',
                type: 'concept',
                title: 'The Valley of Loss',
                content: `
                    <p class="text-xl text-white mb-6">Learning is just finding the lowest point.</p>
                    <p class="mb-4">Imagine you are on a mountain at night (blindfolded). You want to go down to the village.</p>
                    <p>You feel the slope of the ground under your feet and take a step downhill.</p>
                `,
                component: VisualGradientDescent
            },
            {
                id: 'playground',
                type: 'experiment',
                title: 'Interactive Surface',
                content: 'Explore the gradient landscape.',
                component: GradientDescentView,
                props: { isEmbedded: true }
            },
            {
                id: 'learning-rate',
                type: 'concept',
                title: 'Learning Rate (Step Size)',
                content: `
                    <p class="mb-4">How big of a step should you take?</p>
                    <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-text-muted">
                        <li><strong>Too Small</strong>: It takes forever to reach the bottom.</li>
                        <li><strong>Too Big</strong>: You might overshoot and jump to the other side of the valley!</li>
                    </ul>
                `
            },
            {
                id: 'quiz',
                type: 'quiz',
                title: 'Knowledge Check',
                component: QuizView,
                props: {
                    questions: [
                        {
                            id: 1,
                            question: "What does the Gradient represent?",
                            options: [
                                { id: 'a', text: "The height of the mountain", isCorrect: false },
                                { id: 'b', text: "The direction of steepest ascent", isCorrect: true },
                                { id: 'c', text: "The distance to the goal", isCorrect: false }
                            ],
                            explanation: "The gradient points uphill. We move in the opposite direction (descent) to minimize loss."
                        },
                        {
                            id: 2,
                            question: "What happens if the Learning Rate is too high?",
                            options: [
                                { id: 'a', text: "We reach the minimum faster", isCorrect: false },
                                { id: 'b', text: "We might overshoot and diverge", isCorrect: true },
                                { id: 'c', text: "The model stops learning instantly", isCorrect: false }
                            ],
                            explanation: "A very high learning rate causes the updates to be too large, potentially bouncing back and forth or even moving further away from the minimum."
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'confusion-matrix',
        title: 'Confusion Matrix',
        description: 'Understand True Positives, False Negatives, and other classification metrics.',
        steps: [
            {
                id: 'intro',
                type: 'concept',
                title: 'Evaluating Classifiers',
                content: `
                    <p class="text-xl text-white mb-6">It's not just about "Corect" or "Wrong".</p>
                    <p class="mb-4">When a doctor diagnoses a patient, telling a healthy person they are sick (False Positive) is bad.</p>
                    <p>But telling a sick person they are healthy (False Negative) is potentially deadly.</p>
                `
            },
            {
                id: 'playground',
                type: 'experiment',
                title: 'The Matrix',
                content: 'Drag points to see how metrics change.',
                component: ConfusionMatrixView,
                props: { isEmbedded: true }
            },
            {
                id: 'precision-recall',
                type: 'concept',
                title: 'Precision vs Recall',
                content: `
                    <p class="mb-4">These two metrics are often in conflict.</p>
                    <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-text-muted">
                        <li><strong>Precision</strong>: Of all the ones we predicted as positive, how many were actually positive? "Quality of result."</li>
                        <li><strong>Recall</strong>: Of all the actual positives, how many did we find? "Quantity of result."</li>
                    </ul>
                `
            },
            {
                id: 'quiz',
                type: 'quiz',
                title: 'Knowledge Check',
                component: QuizView,
                props: {
                    questions: [
                        {
                            id: 1,
                            question: "What is a False Positive?",
                            options: [
                                { id: 'a', text: "Predicting Positive when it's actually Negative", isCorrect: true },
                                { id: 'b', text: "Predicting Negative when it's actually Positive", isCorrect: false },
                                { id: 'c', text: "Correctly predicting Positive", isCorrect: false }
                            ],
                            explanation: "A False Positive is a 'false alarm'. The model thought it was positive, but it wasn't."
                        },
                        {
                            id: 2,
                            question: "Which metric is most important for detecting spam emails?",
                            options: [
                                { id: 'a', text: "Recall (Find all spam, even if some real emails get trashed)", isCorrect: false },
                                { id: 'b', text: "Precision (Don't trash real emails, even if some spam gets through)", isCorrect: true },
                                { id: 'c', text: "Accuracy (Just get most right)", isCorrect: false }
                            ],
                            explanation: "Precision is usually preferred for spam. We really don't want to lose important emails (False Positives), even if it means seeing a few spam emails (False Negatives)."
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'box-plot-histogram',
        title: 'Box Plot & Histogram',
        description: 'Visualizing data distributions. Mean, Median, and Spread.',
        steps: [
            {
                id: 'intro',
                type: 'concept',
                title: 'Understanding Distributions',
                content: `
                    <p class="text-xl text-white mb-6">Where is the data hiding?</p>
                    <p class="mb-4">A list of numbers is hard to read. We need shapes to understand patterns.</p>
                    <p>The <strong>Normal Curve</strong> (or Bell Curve) is the most common shape in nature.</p>
                `,
                component: VisualDistribution
            },
            {
                id: 'playground',
                type: 'experiment',
                title: 'Interactive Dashboard',
                content: 'Create your own distribution.',
                component: BoxPlotHistogramView,
                props: { isEmbedded: true }
            },
            {
                id: 'boxplot-basics',
                type: 'concept',
                title: 'The Box Plot Anatomy',
                content: `
                    <p class="mb-4">A Box Plot summarizes data in 5 numbers:</p>
                    <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-text-muted">
                        <li><strong>Median</strong>: The middle line. 50% of data is below it.</li>
                        <li><strong>Box</strong>: The middle 50% of data (Interquartile Range).</li>
                        <li><strong>Whiskers</strong>: The rest of the data (usually 1.5x IQR).</li>
                        <li><strong>Dots</strong>: Outliers!</li>
                    </ul>
                `
            },
            {
                id: 'quiz',
                type: 'quiz',
                title: 'Knowledge Check',
                component: QuizView,
                props: {
                    questions: [
                        {
                            id: 1,
                            question: "What does the 'Box' in a Box Plot represent?",
                            options: [
                                { id: 'a', text: "All range of data", isCorrect: false },
                                { id: 'b', text: "The middle 50% of the data (Interquartile Range)", isCorrect: true },
                                { id: 'c', text: "The bottom 25% of the data", isCorrect: false }
                            ],
                            explanation: "The box spans from the 25th percentile (Q1) to the 75th percentile (Q3), showing where the bulk of the data lies."
                        },
                        {
                            id: 2,
                            question: "If a distribution is 'Skewed Right', where is the tail?",
                            options: [
                                { id: 'a', text: "On the left side", isCorrect: false },
                                { id: 'b', text: "It has no tail", isCorrect: false },
                                { id: 'c', text: "On the right side", isCorrect: true }
                            ],
                            explanation: "Skew direction is named after the 'tail' (the long thin part), not the peak. So Skewed Right means the tail extends to the right (positive values)."
                        }
                    ]
                }
            }
        ]
    }
]
