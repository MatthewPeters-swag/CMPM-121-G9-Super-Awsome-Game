Newer entries towards the bottom.

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
It is built using a platform (i.e. engine, framework, language) that does not already provide support for 3D rendering and physics simulation.
The game uses the Three.js platform for the engine and framework. Originally, the team decided that we wanted to use the Phaser game engine with the Enable3D extension to help supplement the 3D environment, but after further testing and review amongst the team, we decided that Three.js might offer us an easier time to accomplish our goals. Three.js was one of the suggested platforms in which to accomplish this project, and Vite was additionally brought on to help with the platform/testing side of the project.
It uses a third-party 3D rendering library.
Three.js is used to handle 3D rendering. Three.js is a popular JavaScript rendering library and fits quite nicely to satisfy the requirements of this project. It is used to display 3D rendering in web browsers.
It uses a third-party physics simulation library.
Uses Rapier3D to handle physics simulation
The playable prototype presents the player with a simple physics-based puzzle.
There is a cube representing the player and another inanimate cube that the player can move to a goal using physics interactions
The player is able to exert some control over the simulation in a way that allows them to succeed or fail at the puzzle.
The player controls a small cube that goes to where you click. When you run into the larger cube you push it. The player wins by pushing the cube into the green goal and loses if either cube goes outside the grey platform. The code for the mechanics of this game is in main.js.
The game detects success or failure and reports this back to the player using the game's graphics.
When you win you get an on screen pop-up that will say “You Win!” or “You Lose!” The code for this is also in main.js.
The codebase for the prototype must include some before-commit automation that helps developers:
The codebase uses Husky's pre-commit hook to run lint-staged, which executes ESLint (with --max-warnings=0) and Prettier on staged files, automatically fixing lint issues and formatting code. The hook then runs npm run build to ensure the project builds successfully. If linting fails, warnings remain, or the build fails, the commit is blocked, ensuring only properly formatted, linted, and buildable code enters the repository.
The codebase for the prototype must include some post-push automation that helps developers:
Automatic packaging and deployment to GitHub Pages or Itch.io


Automatic screenshot generation using a headless browser
Automatic interaction testing where a fixed sequence of input is executed to ensure the game reaches an expected state


## Reflection
Originally we were going to use a 3D library specifically made for phaser but we decided to go for three.js as there seemed to be much more documentation for it which was needed as our team had very little 3D game development experience. Another interesting thing that happened was that we finished the game before adding a third party physics engine so we later had to refactor the code to support the new engine. The physics interactions were simple enough that we could make the game without it.

Devlog Entry 12/01/2025

## How we satisfied the software requirements
We continued using the same tools (phaser, rapier, three) for rendering and physics
If the player steps on the cyan cylinder in either room they get teleported to the other room.
When the puzzle of the first room is completed, a key will spawn in the center which the player can click on with their mouse to pick it up and add it to their inventory. The interaction happens in the mousedown event listener where a raycast is created from the camera to the mouse and if it collides with the key, the keys onClick method is called.
The game maintains the players inventory between scenes. This is important for beating the game as you must bring the key that drops in the first stage to the second in order to beat the game.
In the first scene, the player must use physics to push a large block onto the green “goal” in order to spawn the key to be used in the next level.
If the puzzle is successfully completed, the key can be used to beat the game. If either the player or the block falls off the platform, then it will result in a loss for the player and they will need to restart the game.
The game can be beaten by completing the puzzle and using the key, and the game can be lost by knocking the cube off the edge of the map or by falling off yourself at any point in the game.
## Reflection
Our plan has remained the same from F1, but this part of the assignment was different because each group member needed to complete their part of the assignment in order, for example the puzzle needed to spawn an interactable key before the door the key unlocks could be properly implemented. Another difference was that everyone was a design lead, as the only thing that needed to be implemented was the game itself.

Devlog Entry 12/05/2025
## Selected Requirements
Languages
We picked languages and external DSL as a sort of pair of requirements since the best method of implementing different languages would be to use JSON files to store translated text
External DSL
Unlimited Undo
We picked this requirement because we thought that it could be smoothly integrated into our vision of the game. Unlimited undos added to the functionality of our game.
Visual Themes
Game Save
## How we satisfied the software requirements
The game uses a dropdown menu to switch between english, arabic, and chinese and remembers the user’s last selected language.
The game uses JSON files for two purposes: storing the game text in each language and storing the physics data for the player and cube (i.e. friction, mass, damping). Additionally added tools for the JSON files, specifically the physics ones which add features such as: hovering an attribute to see it a brief description of an attribute when modifying physics JSON and validation of the DSL files which can fail and block commits if aspects of them are incorrect of invalid
The game now saves the previously taken action by saving the position of the player in the prior move. It also stores actions like picking up a key as a prior action. It does this by tracking the type of the last action. If the action was a ‘move’ action then the game looks into the previous move database to find the last coordinates of the player and the block. If it is the ‘keypickup’ action then it removes the key from the player’s inventory and respawns the key in the level. If the previous action caused the block to move off of the goal, the game despawns the key. Resetting the game after you lose clears all action history.
Game has different set colors based on the operating systems setting picked for either light or dark mode and changes the games color scheme accordingly.
Game autosaves so that if the site refreshes almost no progress is lost. Player position, cube position, and key status are all saved.
## Reflection
Our plan has changed a little bit in the implementation of our game since the previous devlogs. Overall F3 has given us a chance to really work on the polish and the usability of our game rather than having us focus on adding flashy features and new mechanics. Our game now functions as a game rather than a buggy prototype. The playtesting in the section showed how the usability of our program really affected the experience that the players had. However, while the overall vision that we had for our features didn’t change that much, we still altered certain aspects about how the game functions. The game now tracks how many moves it takes for the player to solve a puzzle. This promotes replayability as players may now try to complete the game again, but figure out a way to do it in fewer moves.
