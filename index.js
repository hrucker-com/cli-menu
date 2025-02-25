'use strict';

const readline = require('readline');
const keypress = require('keypress');
const kleur = require('kleur');

class MenuCLI {
    constructor(data, actions, startup_questions = []) {
        return (async () => {
            this.menu = data.menu || {};
            this.lang = data.lang || {};
            this.logo = data.logo || null;
            this.actions = data.actions || actions || {};
            this.startup_questions = data.startup_questions || startup_questions || [];
            this.btype = data.btype || 'line';
            this.selectedIndex = 0;
            this.menuStack = [{ menu: this.menu, name: this.lang.mainMenu }];
            this.showingDescription = false;
            this.isRunningAction = false;
            this.isAskingQuestions = false;

            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            this.rl._writeToOutput = () => {};

            keypress(process.stdin);
            process.stdin.setRawMode(true);
            process.stdin.resume();

            this.keypressHandler = async (_, key) => await this.handleKeypress(key);
            this.enableKeypress();
            this.hideCursor();

            if(this.startup_questions.length > 0){
                await this.showStartupQuestions(...this.startup_questions);
            } else {
                await this.showMenu();
            }
        })();
    }

    disableKeypress() {
        process.stdin.off('keypress', this.keypressHandler);
    }

    enableKeypress() {
        process.stdin.on('keypress', this.keypressHandler);
    }

    hideCursor() {
        process.stdout.write("\x1B[?25l");
    }

    showCursor() {
        process.stdout.write("\x1B[?25h");
    }

    clearScreen() {
        console.clear();
    }

    getCurrentMenu() {
        return this.menuStack[this.menuStack.length - 1].menu;
    }

    getBreadcrumbs() {
        if(this.btype == 'tree'){
            return this.menuStack.map((entry, index) => `${index === 0 ? "" : "  ".repeat(index) + "└─ "}${entry.name}`).join("\n");
        } else {
            return this.menuStack.map(entry => entry.name).join(" > ");
        }
    }    

    formatMenuItem(key, item) {
        return item.submenu ? `${key} ${this.lang.submenuIndicator}` : key;
    }

    async renderLogo() {
        if (this.logo) {
            const logoText = await this.logo();
            console.log(...logoText);
        }
    }

    async showMenu() {
        this.clearScreen();
        await this.renderLogo();
        console.log(kleur.gray(`${this.lang.instructions}\n`));
        console.log(kleur.cyan(`${this.getBreadcrumbs()}\n`));

        const currentMenu = this.getCurrentMenu();
        const keys = Object.keys(currentMenu);

        keys.forEach((key, index) => {
            const formattedKey = this.formatMenuItem(key, currentMenu[key]);
            console.log(index === this.selectedIndex ? kleur.blue(`> ${formattedKey}`) : `  ${formattedKey}`);
        });
    }

    async showDescription() {
        this.clearScreen();
        await this.renderLogo();
        console.log(kleur.gray(`${this.lang.returnMessage}\n`));
        console.log(kleur.cyan(`${this.getBreadcrumbs()}\n`));

        const currentMenu = this.getCurrentMenu();
        const keys = Object.keys(currentMenu);
        const selectedKey = keys[this.selectedIndex];
        const selectedItem = currentMenu[selectedKey];
        const description = selectedItem?.description || this.lang.noDescription;

        console.log(selectedKey);
        console.log(kleur.green(description));
    }

    async handleSelection() {
        if (this.isRunningAction || this.isAskingQuestions) return;

        const currentMenu = this.getCurrentMenu();
        const keys = Object.keys(currentMenu);
        const selectedKey = keys[this.selectedIndex];
        const selectedItem = currentMenu[selectedKey];

        if (selectedItem.action === "exit") {
            this.exitProgram();
        } else if (selectedItem.action === "back") {
            if (this.menuStack.length > 1) {
                this.menuStack.pop();
            }
            this.selectedIndex = 0;
            await this.showMenu();
        } else if (selectedItem.questions) {
            await this.askQuestions(selectedItem.questions, selectedItem.action);
        } else if (selectedItem.action) {
            await this.runAction(selectedItem.action, {});
        } else if (selectedItem.submenu) {
            this.menuStack.push({ menu: selectedItem.submenu, name: selectedKey });
            this.selectedIndex = 0;
            await this.showMenu();
        }
    }

    async showStartupQuestions(questions, action) {
        this.clearScreen();
        await this.renderLogo();
        console.log(kleur.gray(`${this.lang.startup_instructions}\n`));
        await this.askQuestions(questions, action, true);
        this.disableKeypress();
        return true;
    }

    async askQuestions(questions, action, hidden = false) {
        this.isAskingQuestions = true;
        let answers = {};
        let questionIndex = 0;

        const askNextQuestion = async () => {
            this.rl._writeToOutput = function (stringToWrite) { this.output.write(stringToWrite); };
            if (questionIndex >= questions.length) {
                this.isAskingQuestions = false;
                this.rl._writeToOutput = () => {};
                await this.runAction(action, answers, hidden);
                return;
            }

            const question = questions[questionIndex];
            answers[question.id] = await new Promise(resolve => {
                this.rl.question(kleur.yellow(`${question.text} `), resolve);
            });

            questionIndex++;
            await askNextQuestion();
        };

        await askNextQuestion();
    }

    async runAction(action, data, hidden = false) {
        this.isRunningAction = true;
        if(!hidden){
            this.clearScreen();
            await this.renderLogo();
            console.log(kleur.gray(`${this.lang.waitRun}\n`));
            console.log(kleur.cyan(`${this.getBreadcrumbs()}\n`));
            console.log(`${this.lang.executingAction} ${action}:`);
        }
        if (typeof this.actions[action] === "function") {
            await this.actions[action](data);
        } else {
            console.error(kleur.red(`${this.lang.function_not_found}`));
        }
        if(!hidden){
            console.log(kleur.yellow(`\n${this.lang.pressAnyKey}`));
            await new Promise(resolve => {
                process.stdin.once("data", () => resolve());
            });
        }
        this.isRunningAction = false;
        if(!hidden){
            await this.showMenu();
        } else {
            this.clearScreen();
        }
    }

    exitProgram() {
        this.clearScreen();
        this.showCursor();
        this.rl.close();
        process.exit();
    }

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
}

module.exports = MenuCLI;