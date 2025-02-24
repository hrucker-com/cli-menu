# CLI Menu

## Overview
CLI Menu is a simple, customizable command-line interface (CLI) menu system that enables users to navigate and execute predefined actions within a structured menu. It supports nested menus, action execution, keyboard navigation, and interactive prompts.

## Features
- Interactive CLI menu navigation
- Customizable language and UI
- Support for nested menus
- Action execution with parameters
- Breadcrumbs navigation display
- Supports user prompts for input
- Lightweight and easy to extend

## Installation
Ensure you have Node.js installed on your system, then run:

```sh
npm install
```

## Usage
To use CLI Menu, you need to create a menu structure and initialize the `MenuCLI` class.

### Example
```javascript
const MenuCLI = require('./index');

const menuData = {
    menu: {
        "Option 1": { action: "action1" },
        "Option 2": { action: "action2" },
        "Submenu": {
            submenu: {
                "Back": { action: "back" }
            }
        },
        "Ask Question": {
            questions: [
                { id: "name", text: "What is your name?" },
                { id: "age", text: "How old are you?" }
            ],
            action: "processAnswers"
        },
        "Exit": { action: "exit" }
    },
    lang: {
        mainMenu: "Main Menu",
        submenuIndicator: "→",
        instructions: "Use arrow keys to navigate. Press Enter to select.",
        executingAction: "Executing",
        waitRun: "Please wait...",
        returnMessage: "Press Space or Escape to return.",
        noDescription: "No description available.",
        pressAnyKey: "Press any key to continue..."
    }
};

const actions = {
    action1: () => console.log("Action 1 executed"),
    action2: () => console.log("Action 2 executed"),
    processAnswers: (data) => {
        console.log(`User Name: ${data.name}, Age: ${data.age}`);
    }
};

new MenuCLI(menuData, actions);
```

### Running the CLI
```sh
node index.js
```

## Keyboard Shortcuts
- **Arrow Keys**: Navigate through menu items
- **Enter**: Select a menu option
- **Spacebar**: Show item description
- **Escape**: Go back to the previous menu
- **Ctrl + C**: Exit the menu