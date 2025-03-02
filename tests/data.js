const menu_data = {
    logo: "YOUR LOGO HERE",
    /*breadcrumbs: async (menuStack, menuIndex) => {
        return menuStack.map(entry => entry.name).join(" → ");
    },
    colors: {
        breadcrumbs: 'red',
        information: 'green',
        information: 'green',
        instructions: 'blue',
        menuElement: 'blue',
        menuElementActiv: 'yellow',
        description: 'cyan',
        question: 'magenta',
        functionNotFound: 'red',
        pressAnyKey: 'blue',

    },*/
    setup: [
        `Setup`,
        `progress_bar_test`,
        [
            { id: "s1", text: "Enter s1:" },
            { id: "s2", text: "Enter s2:" },
        ], 
    ],
    /*information: async (menuStack, menuIndex) => {
        const lastMenu = menuStack[menuStack.length - 1].menu;
        const keys = Object.keys(lastMenu);
        if (keys[menuIndex]) {
            return lastMenu[keys[menuIndex]].description;
        }
        return ``;
    },*/
    menu: {
        "Option 1": {
            description: "This is an explanation for Option 1.",
            submenu: {
                "Suboption 1.1": {
                    description: "Details about Suboption 1.1",
                    submenu: {
                        "Sub-suboption 1.1.1": {
                            description: "Details about Sub-suboption 1.1.1",
                            questions: [
                                { id: "q1", text: "Enter value for Q1:" },
                                { id: "q2", text: "Enter value for Q2:" }
                            ],
                            action: "progress_bar_test"
                        },
                        "Back": { action: "back" }
                    }
                },
                "Back": { action: "back" }
            }
        },
        "Option 2": {
            description: "This is an explanation for Option 2.",
            action: "progress_bar_test"
        },
        "Close Menu": {
            action: "close_menu"
        },
        "Exit": {
            description: "Exit the program.",
            action: "exit"
        }
    },
    lang: {
        mainMenu: "Main Menu",
        setup_instructions: "Before you start, you need to make some settings.",
        instructions: "Use arrow keys to navigate, Enter to select, Space for help, Esc to go back.",
        menuActiveIndicator: "=",
        submenuIndicator: "▶",
        returnMessage: "Use Space or Esc to return",
        noDescription: "No description available.",
        executingAction: "Executing",
        waitRun: "Wait for it to complete.",
        pressAnyKey: "Press any key to continue.",
        function_not_found: "Action Function not found",
    },
    actions: {
        progress_bar_test: async (data) => {
            const cliProgress = require('cli-progress');
            console.log(data);
            const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            progressBar.start(100, 0);

            let value = 0;
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    value += 10;
                    progressBar.update(value);
                    if (value >= 100) {
                        clearInterval(interval);
                        progressBar.stop();
                        resolve();
                    }
                }, 100);
            });
            return;
        }
    }
};

module.exports = menu_data;