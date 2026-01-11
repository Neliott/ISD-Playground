import VisualScatterIntro from '../components/visuals/VisualScatterIntro.vue'
import VisualSlopeIntercept from '../components/visuals/VisualSlopeIntercept.vue'
import VisualResiduals from '../components/visuals/VisualResiduals.vue'
import VisualGradientDescent from '../components/visuals/VisualGradientDescent.vue'
import VisualOverfitting from '../components/visuals/VisualOverfitting.vue'
import VisualCorrelation from '../components/visuals/VisualCorrelation.vue'
import QuizView from '../components/learning/QuizView.vue'
import LinearRegressionView from '../experiences/linear-regression/LinearRegressionView.vue'

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
    }
]
