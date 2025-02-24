const menu_data = {
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
                            action: "Action 1.1.1"
                        },
                        "Back": { action: "back" }
                    }
                },
                "Back": { action: "back" }
            }
        },
        "Option 2": {
            description: "This is an explanation for Option 2.",
            submenu: {
                "Suboption 2.1": {
                    description: "Details about Suboption 2.1",
                    questions: [
                        { id: "qA", text: "Enter value for Q-A:" },
                        { id: "qB", text: "Enter value for Q-B:" }
                    ],
                    action: "progress_bar_test"
                },
                "Back": { action: "back" }
            }
        },
        "Exit": {
            description: "Exit the program.",
            action: "exit"
        }
    },
    lang: {
        mainMenu: "Main Menu",
        instructions: "Use arrow keys to navigate, Enter to select, Space for help, Esc to go back.",
        submenuIndicator: "▶",
        returnMessage: "Use Space or Esc to return",
        noDescription: "No description available.",
        executingAction: "Executing",
        waitRun: "Wait for it to complete.",
        pressAnyKey: "Press any key to continue.",
    },
    logo: async () => {
        return "YOUR LOGO HERE\n";
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
                }, 800);
            });
            return true;
        }
    }
};

module.exports = menu_data;