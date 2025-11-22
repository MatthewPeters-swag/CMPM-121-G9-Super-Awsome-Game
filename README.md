Devlog Entry 11/13/2025

Matthew - Design Lead
Jose - Testing Lead
Aiden - Tools Lead
Seamus - Engine Lead

## Tools and materials (WIP)

Engine: Phaser
Language: Type script
Tools:
Visual Studio Code (IDE): This will be our primary source-code editor. As the industry standard, its versatility is unmatched.
GitHub Desktop (Version Control): We will use Git for version control, and GitHub Desktop will be our primary interface.
Deno (Runtime): For any required scripting or backend logic, we will use the Deno runtime for its built-in, first-class support for TypeScript and we’ve all used it on previous assignments.
Vite (Build Tool & Dev Server): For any web-based components or interfaces, Vite will be our build tool, primarily due to its speed.
Why: These tools are widely adopted and represent best practices in the current development industry, making them valuable skills for all team members. Additionally, I have significant personal experience with this entire workflow, which will allow me to help onboard teammates and effectively troubleshoot any issues that arise, ensuring our development process is smooth and productive.
Generative AI: no restrictions

# Important Commands:

- `npm run dev` - Start development server
- `npm run build` - Build project for production
- `npm run preview` - Preview production build
- `npm run lint` - Check for linting errors (read-only)
- `npm run lint:fix` - Auto-fix linting errors
- `npm run format` - Format all `.js`, `.json`, and `.md` files
- `npm run format:check` - Check if files are formatted (read-only)

**Note:** Pre-commit hooks automatically run linting and formatting on staged files before each commit. The commit will be blocked if code doesn't pass linting or build tests.

## Outlook

What are you hoping to learn by approaching the project with the tools and materials you selected above?

We want to get more comfortable with the kinds of technology that real software teams use. Working with them in a small project helps us learn how they work, what they do well, and where they can be tricky. We also want to see how these tools affect the way we plan and build things. We also hope to gain practical experience that will help us in future projects.

Devlog Entry 11/21/2025

## How we satisfied the software requirements

For each of the F1 requirements, give a paragraph of explanation for how your project's implementation satisfies the requirements.
Your team can earn partial credit for covering only a subset of the F1 requirements at this stage. (It is much better to satisfy the requirements in a sloppy way right now than lock in your partial credit.)

-It is built using a platform (i.e. engine, framework, language) that does not already provide support for 3D rendering and physics simulation.
The game uses Phaser.js and Node.js with Vite

-It uses a third-party 3D rendering library.
Three.js is used to handle 3D rendering

-It uses a third-party physics simulation library.
Uses Rapier3D to handle physics simulation

-The playable prototype presents the player with a simple physics-based puzzle.
The player is able to exert some control over the simulation in a way that allows them to succeed or fail at the puzzle.
The player controls a small cube that goes to where you click. When you run into the larger cube you push it. The player wins by pushing the cube into the green goal and loses if either cube goes outside the grey platform. The code for the mechanics of this game is in main.js.

-The game detects success or failure and reports this back to the player using the game's graphics.
When you win you get a on screen pop-up that will say “You Win!” or “You Lose!” The code for this is also in main.js.

-The codebase for the prototype must include some before-commit automation that helps developers:
The codebase uses Husky's pre-commit hook to run lint-staged, which executes ESLint (with --max-warnings=0) and Prettier on staged files, automatically fixing lint issues and formatting code. The hook then runs npm run build to ensure the project builds successfully. If linting fails, warnings remain, or the build fails, the commit is blocked, ensuring only properly formatted, linted, and buildable code enters the repository.

-The codebase for the prototype must include some post-push automation that helps developers:
Automatic packaging and deployment to GitHub Pages or Itch.io
Automatic screenshot generation using a headless browser
Automatic interaction testing where a fixed sequence of input is executed to ensure the game reaches an expected state
The codespace uses run and runs a deterministic end-to-end integration test that builds the game, serves the production and opens the game into a headless browser. With a serveDist(port) that starts a minimal static HTTP server, runTest(): calls upon build and launches puppeteer and waits for window.**TEST_API**.

-

## Reflection

Originally we were going to use a 3D library specifically made for phaser but we decided to go for three.js as there seemed to be much more documentation for it which was needed as our team had very little 3D game development experience. Another interesting thing that happened was that we finished the game before adding a third party physics engine so we later had to refactor the code to support the new engine. The physics interactions were simple enough that we could make the game without it.
