# MenuCLI - A Dynamic Command Line Interface Library

**MenuCLI** is a powerful and flexible library for creating dynamic, interactive command-line interfaces (CLI) in Node.js. It allows developers to easily build menus, submenus, and interactive prompts with support for custom actions, descriptions, and more. The library is designed to be highly customizable, with support for colors, breadcrumbs, and dynamic content rendering.

## Features

- **Dynamic Menus**: Create nested menus and submenus with ease.
- **Interactive Prompts**: Ask users questions and collect input.
- **Custom Actions**: Define custom actions to be executed when a menu item is selected.
- **Color Support**: Use the `kleur` library to add colors to your CLI interface.
- **Breadcrumbs**: Display the current menu path using either a tree or line format.
- **Dynamic Content**: Render logos, instructions, and information dynamically.
- **Keyboard Navigation**: Navigate menus using arrow keys, space, and enter.
- **Exit Handling**: Gracefully exit the menu or the entire program.

## Usage

### Basic Example

Here's a simple example of how to use `MenuCLI` to create a basic menu:

```javascript
const MenuCLI = require('menucli');

const menuData = {
    menu: {
        'Option 1': { action: 'action1' },
        'Option 2': { action: 'action2' },
        'Exit': { action: 'exit' }
    },
    lang: {
        mainMenu: 'Main Menu',
        instructions: 'Use arrow keys to navigate, Enter to select, and Esc to go back.',
        returnMessage: 'Press space to return to the menu.',
        waitRun: 'Running action...',
        pressAnyKey: 'Press any key to continue...',
        function_not_found: 'Function not found!',
        noDescription: 'No description available.'
    },
    actions: {
        action1: async () => {
            console.log('Action 1 executed!');
            return 'reloadMenu';
        },
        action2: async () => {
            console.log('Action 2 executed!');
            return 'reloadMenu';
        }
    }
};

new MenuCLI(menuData);
```

### Advanced Example with Submenus and Questions

Here's a more advanced example that includes submenus and interactive questions:

```javascript
const MenuCLI = require('menucli');

const menuData = {
    menu: {
        'Submenu 1': {
            submenu: {
                'Submenu Option 1': { action: 'subAction1' },
                'Submenu Option 2': { action: 'subAction2' },
                'Back': { action: 'back' }
            }
        },
        'Ask Questions': {
            action: 'askQuestions',
            questions: [
                { id: 'name', text: 'What is your name?' },
                { id: 'age', text: 'What is your age?' }
            ]
        },
        'Exit': { action: 'exit' }
    },
    lang: {
        mainMenu: 'Main Menu',
        instructions: 'Use arrow keys to navigate, Enter to select, and Esc to go back.',
        returnMessage: 'Press space to return to the menu.',
        waitRun: 'Running action...',
        pressAnyKey: 'Press any key to continue...',
        function_not_found: 'Function not found!',
        noDescription: 'No description available.',
        questions_instructions: 'Please answer the following questions:'
    },
    actions: {
        subAction1: async () => {
            console.log('Submenu Action 1 executed!');
            return 'reloadMenu';
        },
        subAction2: async () => {
            console.log('Submenu Action 2 executed!');
            return 'reloadMenu';
        },
        askQuestions: async (data) => {
            console.log(`Hello, ${data.name}! You are ${data.age} years old.`);
            return 'reloadMenu';
        }
    }
};

new MenuCLI(menuData);
```

### Customizing Colors

You can customize the colors used in the menu by specifying them in the `colors` object:

```javascript
const menuData = {
    menu: {
        'Option 1': { action: 'action1' },
        'Option 2': { action: 'action2' },
        'Exit': { action: 'exit' }
    },
    colors: {
        instructions: 'gray',
        breadcrumbs: 'cyan',
        information: 'gray',
        menuElement: 'white',
        menuElementActiv: 'blue',
        description: 'green',
        question: 'yellow',
        functionNotFound: 'red',
        pressAnyKey: 'yellow'
    },
    // ... other configurations
};

new MenuCLI(menuData);
```

### Breadcrumbs

You can choose between two types of breadcrumbs: `line` or `tree`. Here's an example of how to use the `tree` format:

```javascript
const menuData = {
    menu: {
        'Submenu 1': {
            submenu: {
                'Submenu Option 1': { action: 'subAction1' },
                'Submenu Option 2': { action: 'subAction2' },
                'Back': { action: 'back' }
            }
        },
        'Exit': { action: 'exit' }
    },
    breadcrumbs: 'tree',
    // ... other configurations
};

new MenuCLI(menuData);
```

### Dynamic Content

You can render dynamic content such as logos, instructions, and information using functions:

```javascript
const menuData = {
    logo: () => ['My Custom Logo'],
    information: async () => 'Dynamic information based on current state',
    // ... other configurations
};

new MenuCLI(menuData);
```

## API Reference

### `MenuCLI(data_or_function)`

- **`data_or_function`**: Either an object containing the menu configuration or a function that returns such an object.

### Menu Configuration Object

- **`menu`**: The main menu object, where keys are menu item names and values are objects containing `action`, `submenu`, or `questions`.
- **`lang`**: An object containing language strings for instructions, messages, etc.
- **`actions`**: An object containing functions to be executed when a menu item is selected.
- **`colors`**: An object containing color configurations for different parts of the interface.
- **`breadcrumbs`**: Either `'line'`, `'tree'`, or a custom function for rendering breadcrumbs.
- **`information`**: A string or function that returns dynamic information to be displayed.
- **`logo`**: A string or function that returns a logo to be displayed.
