const readline = require('readline');
const keypress = require('keypress');
const kleur = require('kleur');

/**
 * Represents a CLI menu system that allows navigation through menus, submenus, and actions.
 * @class
 */
class MenuCLI {
    /**
     * Initializes the MenuCLI instance.
     * @constructor
     * @param {Object|Function} data_or_function - The data object or function that returns the data object for the menu.
     * @returns {Promise} A promise that resolves when the menu is exited.
     */
    constructor(data_or_function) {
        return new Promise(async (resolve) => {
            this.data_or_function = data_or_function;
            await this.reloadMenu(0);
            
            this.showingDescription = false;
            this.isRunningAction = false;
            this.isAskingQuestions = false;
            this.isExited = false;

            this.rl = readline.createInterface({ input: process.stdin, output: process.stdout, });
            this.rl._writeToOutput = () => {};

            keypress(process.stdin);
            process.stdin.setRawMode(true);
            process.stdin.resume();

            this.handleKeypress = this.handleKeypress.bind(this);
            this.keypressHandler = async (_, key) => await this.handleKeypress(key);
            this.enableKeypress();
            this.hideCursor();

            if (this.setup.length > 0) {
                await this.showSetup();
            } else {
                await this.showMenu();
            }
            this.exitResolver = resolve;
        });
    }

    /**
     * Reloads the menu data and updates the menu display.
     * @async
     * @param {number} selectedIndex - The index of the selected menu item.
     * @returns {Promise<boolean>} A promise that resolves to true when the menu is reloaded.
     */
    async reloadMenu(selectedIndex) {
        if(typeof this.data_or_function === `function`){
            this.data = await this.data_or_function();
        } else {
            this.data = this.data_or_function;
        }
        this.menu = this.data.menu || {};
        this.lang = this.data.lang || {};
        this.logo = this.data.logo || null;
        this.setup = this.data.setup || [];
        this.actions = this.data.actions || {};
        this.show_interface = this.data.show_interface || true;
        this.breadcrumbs = this.data.breadcrumbs || 'line';
        this.information = this.data.information || this.data?.lang?.information || null;

        this.colors = {};
        this.colors.instructions = this.data?.colors?.instructions || `gray`;
        this.colors.breadcrumbs = this.data?.colors?.breadcrumbs || `cyan`;
        this.colors.information = this.data?.colors?.information || `gray`;
        this.colors.menuElement = this.data?.colors?.menuElement || `white`;
        this.colors.menuElementActiv = this.data?.colors?.menuElementActiv || `blue`;
        this.colors.description = this.data?.colors?.description || `green`;

        this.colors.question = this.data?.colors?.question || `yellow`;
        this.colors.functionNotFound = this.data?.colors?.functionNotFound || `red`;
        this.colors.pressAnyKey = this.data?.colors?.pressAnyKey || `yellow`;
        
        if(selectedIndex >= 0){
            this.selectedIndex = 0;
        }
        this.menuStack = [{ menu: this.menu, name: this.lang.mainMenu }];
        await this.showMenu();
        return true;
    }

    /**
     * Renders the logo if it exists.
     * @async
     * @returns {Promise<boolean>} A promise that resolves to true if the logo is rendered, otherwise false.
     */
    async renderLogo() {
        if (this.logo) {
            if (typeof this.logo === "function") {
                console.log(...(await this.logo()));
            } else if (typeof this.logo === "string") {
                console.log(...this.logo);
            }
            return true;
        }
        return false;
    }

    /**
     * Renders instructions text if provided.
     * @async
     * @param {string} text - The instructions text to render.
     * @returns {Promise<boolean>} A promise that resolves to true if the text is rendered, otherwise false.
     */
    async renderInstructions(text = '') {
        if(text){
            console.log(kleur[this.colors.instructions](text));
            return true;
        }
        return false;
    }

    /**
     * Renders breadcrumbs based on the current menu stack.
     * @async
     * @param {string} current_name - The name of the current menu item.
     * @returns {Promise<boolean>} A promise that resolves to true if breadcrumbs are rendered, otherwise false.
     */
    async renderBreadcrumbs(current_name) {
        let menu = [...this.menuStack];
        if(current_name) {
            menu.push({name: current_name});
        }
        let breadcrumbs = null;
        if(this.breadcrumbs == 'tree'){
            breadcrumbs = menu.map((entry, index) => `${index === 0 ? "" : "  ".repeat(index) + "└─ "}${entry.name}`).join("\n");
        } else if(this.breadcrumbs == 'line'){
            breadcrumbs = menu.map(entry => entry.name).join(" > ");
        } else if(typeof this.breadcrumbs === "function") {
            breadcrumbs = await this.breadcrumbs(menu, this.selectedIndex);
        }
        if(breadcrumbs) {
            console.log(kleur[this.colors.breadcrumbs](breadcrumbs));
            return true;
        }
        return false;
    }

    /**
     * Renders additional information if provided.
     * @async
     * @returns {Promise<boolean>} A promise that resolves to true if information is rendered, otherwise false.
     */
    async renderInformation() {
        if (this.information) {
            if (typeof this.information === "function") {
                let info = await this.information(this.menuStack, this.selectedIndex);
                console.log(info ? kleur[this.colors.information](info) : ` `);
            } else if (typeof this.information === "string") {
                console.log(kleur[this.colors.information](this.information));
            }
            return true;
        }
        return false;
    }

    /**
     * Displays the current menu.
     * @async
     * @returns {Promise<void>} A promise that resolves when the menu is displayed.
     */
    async showMenu() {
        if (this.isExited){ return; }
        if (this.show_interface){
            this.clearScreen();
            await this.renderLogo();
            await this.renderInstructions(this.lang?.instructions);
            await this.renderBreadcrumbs();
            await this.renderInformation();
        }

        const currentMenu = this.getCurrentMenu();
        const keys = Object.keys(currentMenu);
        keys.forEach((key, index) => {
            const formattedKey = currentMenu[key].submenu ? `${key} ${this.lang.submenuIndicator}` : key;
            console.log(index === this.selectedIndex ? kleur[this.colors.menuElementActiv](`${this.lang.menuActiveIndicator} ${formattedKey}`) : kleur[this.colors.menuElement](`  ${formattedKey}`));
        });
    }

    /**
     * Displays the description of the currently selected menu item.
     * @async
     * @returns {Promise<void>} A promise that resolves when the description is displayed.
     */
    async showDescription() {
        if (this.isExited){ return; }
        if (this.show_interface){
            this.clearScreen();
            await this.renderLogo();
            await this.renderInstructions(this.lang?.returnMessage);
            await this.renderBreadcrumbs();
            await this.renderInformation();
        }
        console.log(kleur[this.colors.description](this.getCurrentMenu()[Object.keys(this.getCurrentMenu())[this.selectedIndex]].description || this.lang.noDescription));
    }

    /**
     * Displays the setup menu if it exists.
     * @async
     * @returns {Promise<void>} A promise that resolves when the setup menu is displayed.
     */
    async showSetup() {
        if (this.isExited){ return; }
        if (this.show_interface){
            this.clearScreen();
            await this.renderLogo();
            await this.renderInstructions(this.lang?.setup_instructions);
            await this.renderBreadcrumbs(this.setup[0]);
            await this.renderInformation();
        }
        await this.askQuestions(...this.setup);
    }

    /**
     * Displays questions for the user to answer.
     * @async
     * @param {string} current_name - The name of the current menu item.
     * @param {string} action - The action associated with the questions.
     * @param {Array} questions - The list of questions to ask.
     * @returns {Promise<void>} A promise that resolves when the questions are displayed.
     */
    async showQuestions(current_name, action, questions){
        if (this.isExited){ return; }
        if (this.show_interface){
            this.clearScreen();
            await this.renderLogo();
            await this.renderInstructions(this.lang?.questions_instructions);
            await this.renderBreadcrumbs(current_name);
            await this.renderInformation();
        }
        await this.askQuestions(current_name, action, questions);
    }

    /**
     * Asks the user a series of questions and collects their answers.
     * @async
     * @param {string} current_name - The name of the current menu item.
     * @param {string} action - The action associated with the questions.
     * @param {Array} questions - The list of questions to ask.
     * @returns {Promise<void>} A promise that resolves when all questions are answered.
     */
    async askQuestions(current_name, action, questions) {
        this.isAskingQuestions = true;
        let answers = {};
        let questionIndex = 0;

        const askNextQuestion = async () => {
            this.rl._writeToOutput = function (stringToWrite) { this.output.write(stringToWrite); };
            this.showCursor();
            if (questionIndex >= questions.length) {
                this.isAskingQuestions = false;
                this.rl._writeToOutput = () => {};
                this.hideCursor();
                await this.runAction(current_name, action, answers);
                return;
            }

            const question = questions[questionIndex];
            if(`value` in question) {
                answers[question.id] = question.value;
            } else {
                answers[question.id] = await new Promise(resolve => {
                    this.rl.question(kleur[this.colors.question](`${question.text}\n`), resolve);
                });
            }
            questionIndex++;
            await askNextQuestion();
        };

        await askNextQuestion();
    }

    /**
     * Runs the action associated with the selected menu item.
     * @async
     * @param {string} menu_name - The name of the menu item.
     * @param {string} action - The action to run.
     * @param {Object} data - Additional data to pass to the action.
     * @returns {Promise<void>} A promise that resolves when the action is completed.
     */
    async runAction(menu_name, action, data = {}) {
        this.isRunningAction = true;
        this.clearScreen();
        await this.renderLogo();
        await this.renderInstructions(this.lang?.waitRun);
        await this.renderBreadcrumbs(menu_name);
        await this.renderInformation();
        let run_result = null;
        if (typeof this.actions[action] === "function") {
            run_result = await this.actions[action](data);
        } else {
            console.error(kleur[this.colors.functionNotFound](`${this.lang.function_not_found}`));
        }
        console.log(kleur[this.colors.pressAnyKey](`\n${this.lang.pressAnyKey}`));
        await new Promise(resolve => {
            process.stdin.once("data", () => resolve());
        });
        this.isRunningAction = false;
        if(!run_result){
            await this.showMenu();
        } else if(run_result == 'exitMenu'){
            this.exitMenu();
        } else if(run_result == 'exitProgram'){
            this.exitProgram();
        } else if(run_result == 'reloadMenu'){
            await this.reloadMenu();
        } else if(run_result == 'reloadSetup'){
            await this.showSetup();
        }
    }

    /**
     * Handles the selection of a menu item.
     * @async
     * @returns {Promise<void>} A promise that resolves when the selection is handled.
     */
    async handleSelection() {
        if (this.isRunningAction || this.isAskingQuestions) return;

        const currentMenu = this.getCurrentMenu();
        const keys = Object.keys(currentMenu);
        const selectedKey = keys[this.selectedIndex];
        const selectedItem = currentMenu[selectedKey];

        if (selectedItem.action === "exit") {
            this.exitProgram();
        } if (selectedItem.action === "close_menu") {
            this.exitMenu();
        } else if (selectedItem.action === "back") {
            if (this.menuStack.length > 1) {
                this.menuStack.pop();
            }
            this.selectedIndex = 0;
            await this.showMenu();
        } else if (selectedItem.questions) {
            await this.showQuestions(selectedKey, selectedItem.action, selectedItem.questions);
        } else if (selectedItem.action) {
            await this.runAction(selectedKey, selectedItem.action);
        } else if (selectedItem.submenu) {
            this.menuStack.push({ menu: selectedItem.submenu, name: selectedKey });
            this.selectedIndex = 0;
            await this.showMenu();
        }
    }

    /**
     * Handles keypress events for navigating the menu.
     * @async
     * @param {Object} key - The keypress event object.
     * @returns {Promise<void>} A promise that resolves when the keypress is handled.
     */
    async handleKeypress(key) {
        if (!key || this.isRunningAction || this.isAskingQuestions) return;
        const currentMenu = this.getCurrentMenu();
        const keys = Object.keys(currentMenu);

        if (key.name === "backspace") {
            return;
        }

        if (this.showingDescription) {
            if (key.name === 'space' || key.name === 'escape') {
                this.showingDescription = false;
                await this.showMenu();
            }
            return;
        }

        if (key.name === 'up') {
            this.selectedIndex = (this.selectedIndex - 1 + keys.length) % keys.length;
            await this.showMenu();
        } else if (key.name === 'down') {
            this.selectedIndex = (this.selectedIndex + 1) % keys.length;
            await this.showMenu();
        } else if (key.name === 'return') {
            await this.handleSelection();
        } else if (key.name === 'space') {
            this.showingDescription = true;
            await this.showDescription();
        } else if (key.name === 'escape' && this.menuStack.length > 1) {
            this.menuStack.pop();
            this.selectedIndex = 0;
            await this.showMenu();
        } else if (key.ctrl && key.name === 'c') {
            this.exitProgram();
        }
    }

    /**
     * Exits the current menu.
     * @returns {void}
     */
    exitMenu() {
        this.isExited = true;
        this.clearScreen();
        this.showCursor();
        this.rl.close();
        this.disableKeypress();
        if (this.exitResolver) {
            this.exitResolver();
        }
    }

    /**
     * Exits the program.
     * @returns {void}
     */
    exitProgram() {
        this.clearScreen();
        this.showCursor();
        this.rl.close();
        this.disableKeypress();
        process.exit();
    }

    /**
     * Disables keypress event handling.
     * @returns {void}
     */
    disableKeypress() {
        process.stdin.off('keypress', this.keypressHandler);
    }

    /**
     * Enables keypress event handling.
     * @returns {void}
     */
    enableKeypress() {
        process.stdin.on('keypress', this.keypressHandler);
    }

    /**
     * Hides the cursor in the terminal.
     * @returns {void}
     */
    hideCursor() {
        process.stdout.write("\x1B[?25l");
    }

    /**
     * Shows the cursor in the terminal.
     * @returns {void}
     */
    showCursor() {
        process.stdout.write("\x1B[?25h");
    }

    /**
     * Clears the terminal screen.
     * @returns {void}
     */
    clearScreen() {
        console.clear();
    }

    /**
     * Gets the current menu from the menu stack.
     * @returns {Object} The current menu object.
     */
    getCurrentMenu() {
        return this.menuStack[this.menuStack.length - 1].menu;
    }
}

module.exports = MenuCLI;